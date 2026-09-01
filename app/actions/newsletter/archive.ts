import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import parseFrontMatter from "front-matter";
import { detectMimeType } from "remix/mime";
import { parseTar } from "remix/tar-parser";

import { routes } from "../../routes.ts";
import { env } from "../../utils/env.ts";

/**
 * Newsletter archive.
 *
 * Issues live in the private `remix-run/newsletter` GitHub repository under
 * `newsletters/newsletter-<N>/<YYYY-MM-DD>-remix-newsletter-<N>.md`, with any
 * images beside the markdown. We fetch a single repository tarball at runtime,
 * parse it once, and keep parsed content plus image file references in memory.
 * The live repository stores image bytes in a process-local disk cache.
 */

const NEWSLETTER_REPO_OWNER = "remix-run";
const NEWSLETTER_REPO_NAME = "newsletter";
const NEWSLETTER_REPO_REF = "main";

/** Raster image types we are willing to serve. SVG is intentionally excluded. */
const SAFE_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"] as const;

const FRESH_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ISSUES = 200;
const MAX_FILES = 1_000;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_ARCHIVE_BYTES = 64 * 1024 * 1024;

export interface NewsletterSummary {
  number: number;
  /** UTC publication date parsed from the markdown filename. */
  date: Date;
  preview: string;
  image: {
    src: string;
    alt: string;
  } | null;
}

export interface NewsletterIssue {
  number: number;
  date: Date;
  title: string;
  markdown: string;
  image: NewsletterSummary["image"];
}

export interface NewsletterImage {
  filename: string;
  contentType: string;
  bytes: Uint8Array;
}

/**
 * Explicit error: the upstream GitHub fetch failed and no stale snapshot is
 * available. Controllers translate this to a 503 response.
 */
export class NewsletterUpstreamUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "NewsletterUpstreamUnavailableError";
  }
}

export interface NewsletterRepository {
  listSummaries(): Promise<NewsletterSummary[]>;
  getIssue(number: number): Promise<NewsletterIssue | null>;
  getImage(number: number, filename: string): Promise<NewsletterImage | null>;
}

interface ParsedIssue {
  number: number;
  date: Date;
  title: string;
  preview: string;
  markdown: string;
}

interface NewsletterSnapshot {
  issues: ParsedIssue[];
  summaries: NewsletterSummary[];
  files: Map<string, Uint8Array | string>;
  imageCacheDirectory?: string;
}

export interface RawTarFile {
  name: string;
  type: string;
  bytes: Uint8Array;
}

/**
 * Pure snapshot parser. Accepts the flattened set of tar entries whose names
 * are rooted at the repository's `newsletters/` directory and returns a sorted
 * (newest-first) snapshot. Exported for unit testing without live GitHub.
 */
export function parseNewsletterSnapshot(
  files: RawTarFile[],
): NewsletterSnapshot {
  let issueDirs = new Map<number, Map<string, RawTarFile>>();

  for (let file of files) {
    let parts = file.name.split("/");
    // Expected relative path: `newsletter-<N>/<filename>`
    if (parts.length !== 2) continue;
    let dirName = parts[0];
    let dirMatch = dirName.match(/^newsletter-(\d+)$/);
    if (!dirMatch) continue;
    let number = parseInt(dirMatch[1], 10);
    if (!Number.isInteger(number) || number <= 0) continue;

    let bucket = issueDirs.get(number);
    if (!bucket) {
      bucket = new Map();
      issueDirs.set(number, bucket);
    }
    // Keep the last segment as the key so callers can look up by filename.
    bucket.set(parts.slice(1).join("/"), file);
  }

  let issues: ParsedIssue[] = [];
  for (let [number, bucket] of issueDirs) {
    let filenamePattern = new RegExp(
      `^(\\d{4})-(\\d{2})-(\\d{2})-remix-newsletter-${number}\\.md$`,
    );
    let markdownEntry: RawTarFile | undefined;
    let dateMatch: RegExpMatchArray | null = null;
    for (let file of bucket.values()) {
      let filename = file.name.split("/").pop()!;
      let match = filename.match(filenamePattern);
      if (!match) continue;
      markdownEntry = file;
      dateMatch = match;
      break;
    }
    if (!markdownEntry || !dateMatch) continue;
    let [, yearValue, monthValue, dayValue] = dateMatch;
    let year = Number(yearValue);
    let month = Number(monthValue);
    let day = Number(dayValue);
    let date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      continue;
    }

    let markdown = new TextDecoder().decode(markdownEntry.bytes);
    let frontmatter = readNewsletterFrontmatter(markdown);
    let title = extractTitle(markdown, number);

    issues.push({
      number,
      date,
      title,
      preview: getNewsletterPreview(frontmatter),
      markdown,
    });
  }

  issues.sort((a, b) => b.number - a.number);
  issues = issues.slice(0, MAX_ISSUES);

  let fileMap = new Map<string, Uint8Array | string>();
  for (let file of files) {
    let parts = file.name.split("/");
    if (parts.length !== 2) continue;
    let [directory, filename] = parts;
    if (
      !directory ||
      !filename ||
      !/^newsletter-\d+$/.test(directory) ||
      !isSafeImageFilename(filename)
    ) {
      continue;
    }
    fileMap.set(file.name, file.bytes);
  }

  let summaries = issues.map((issue) => {
    let image = extractNewsletterPreviewImage(issue.markdown, (filename) =>
      fileMap.has(`newsletter-${issue.number}/${filename}`),
    );

    return {
      number: issue.number,
      date: issue.date,
      preview: issue.preview,
      image: image
        ? {
            src: routes.newsletter.image.href({
              number: issue.number,
              filename: image.filename,
            }),
            alt: image.alt,
          }
        : null,
    };
  });

  return { issues, summaries, files: fileMap };
}

/**
 * Collect tar entries rooted under `newsletters/` into the flat relative paths
 * the snapshot parser expects (`newsletter-<N>/<filename>`).
 */
export async function collectNewsletterFiles(
  archive: ReadableStream<Uint8Array> | Uint8Array,
): Promise<RawTarFile[]> {
  let files: RawTarFile[] = [];
  let totalBytes = 0;
  await parseTar(archive, (entry) => {
    if (entry.header.type === "directory" || entry.name.endsWith("/")) return;
    let match = entry.name.match(/^[^/]+\/newsletters\/(.+)$/);
    if (!match) return;
    if (files.length >= MAX_FILES) {
      throw new Error("Newsletter archive contains too many files");
    }
    if (entry.size > MAX_FILE_BYTES) {
      throw new Error("Newsletter archive contains an oversized file");
    }
    totalBytes += entry.size;
    if (totalBytes > MAX_ARCHIVE_BYTES) {
      throw new Error("Newsletter archive is too large");
    }

    let relativePath = match[1];
    return entry.bytes().then((bytes) => {
      files.push({ name: relativePath, type: entry.header.type, bytes });
    });
  });
  return files;
}

interface NewsletterFrontmatter {
  previewText?: unknown;
}

function readNewsletterFrontmatter(markdown: string): NewsletterFrontmatter {
  try {
    let { attributes } = parseFrontMatter<Record<string, unknown>>(markdown);
    if (
      !attributes ||
      typeof attributes !== "object" ||
      Array.isArray(attributes)
    ) {
      return {};
    }
    return attributes;
  } catch {
    return {};
  }
}

function getNewsletterPreview(frontmatter: NewsletterFrontmatter): string {
  return typeof frontmatter.previewText === "string"
    ? frontmatter.previewText.trim()
    : "";
}

function extractTitle(markdown: string, fallbackNumber: number): string {
  // Prefer an explicit H1 in the body, then use the issue number as fallback.
  let h1 = markdown.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return `Remix Newsletter #${fallbackNumber}`;
}

/** Return the first safe, same-directory raster image in newsletter Markdown. */
export function extractNewsletterPreviewImage(
  markdown: string,
  isAvailable: (filename: string) => boolean = () => true,
): { filename: string; alt: string } | null {
  let body = stripFrontmatter(markdown);
  let imagePattern = /!\[([^\]]*)\]\(\s*(?:<([^>\n]+)>|([^\s)]+))[^\n)]*\)/g;

  for (let match of body.matchAll(imagePattern)) {
    let url = match[2] ?? match[3];
    let filenameMatch = url.match(/^(?:\.\/)?([^/?#]+)(?:[?#].*)?$/);
    if (
      !filenameMatch ||
      !isSafeImageFilename(filenameMatch[1]) ||
      !isAvailable(filenameMatch[1])
    ) {
      continue;
    }
    return { filename: filenameMatch[1], alt: match[1].trim() };
  }

  return null;
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---\n")) return markdown;
  let end = markdown.indexOf("\n---\n", 4);
  if (end === -1) return markdown;
  return markdown.slice(end + 5);
}

export function isSafeImageFilename(filename: string): boolean {
  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return false;
  }
  if (filename === "." || filename === "..") return false;
  let ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return (SAFE_IMAGE_EXTENSIONS as ReadonlyArray<string>).includes(ext);
}

function isSafeImageContentType(contentType: string): boolean {
  let base = contentType.split(";")[0].trim().toLowerCase();
  return ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(base);
}

export function createGitHubNewsletterRepository(
  options: {
    owner?: string;
    repo?: string;
    ref?: string;
    token?: string;
    fetchImpl?: typeof fetch;
    ttlMs?: number;
    imageCacheDir?: string;
    onRefreshError?: (
      error: unknown,
      context: { servingStale: boolean },
    ) => void;
  } = {},
): NewsletterRepository {
  let owner = options.owner ?? NEWSLETTER_REPO_OWNER;
  let repo = options.repo ?? NEWSLETTER_REPO_NAME;
  let ref = options.ref ?? NEWSLETTER_REPO_REF;
  let token = options.token;
  let fetchImpl = options.fetchImpl ?? globalThis.fetch;
  let ttlMs = options.ttlMs ?? FRESH_TTL_MS;
  let imageCacheDir = options.imageCacheDir;
  let onRefreshError = options.onRefreshError;

  let snapshot: NewsletterSnapshot | null = null;
  let retiredImageCacheDirectory: string | undefined;
  let expiresAt = 0;
  let refreshPromise: Promise<NewsletterSnapshot> | null = null;

  async function refresh(): Promise<NewsletterSnapshot> {
    try {
      let files = await fetchTarballFiles(fetchImpl, owner, repo, ref, token);
      let next = parseNewsletterSnapshot(files);
      if (imageCacheDir) {
        await persistNewsletterImages(next, imageCacheDir);
      }

      let previousSnapshot = snapshot;
      snapshot = next;
      expiresAt = Date.now() + ttlMs;
      if (retiredImageCacheDirectory) {
        void rm(retiredImageCacheDirectory, {
          recursive: true,
          force: true,
        }).catch((error) =>
          console.error("[newsletter] Failed to remove retired image cache", {
            error,
          }),
        );
      }
      retiredImageCacheDirectory = previousSnapshot?.imageCacheDirectory;
      return next;
    } catch (error) {
      onRefreshError?.(error, { servingStale: snapshot != null });
      if (snapshot) {
        // Serve stale data and stretch freshness so we don't hammer GitHub.
        expiresAt = Date.now() + ttlMs;
        return snapshot;
      }
      throw new NewsletterUpstreamUnavailableError(
        "Newsletter archive is currently unavailable",
        { cause: error },
      );
    }
  }

  async function getSnapshot(): Promise<NewsletterSnapshot> {
    if (snapshot && Date.now() < expiresAt) return snapshot;
    if (refreshPromise) return refreshPromise;
    refreshPromise = refresh();
    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  }

  return {
    async listSummaries() {
      return (await getSnapshot()).summaries;
    },

    async getIssue(number) {
      if (!Number.isInteger(number) || number <= 0) return null;
      let snap = await getSnapshot();
      let issue = snap.issues.find((i) => i.number === number);
      if (!issue) return null;
      return {
        number: issue.number,
        date: issue.date,
        title: issue.title,
        markdown: issue.markdown,
        image:
          snap.summaries.find((summary) => summary.number === number)?.image ??
          null,
      };
    },

    async getImage(number, filename) {
      if (!Number.isInteger(number) || number <= 0) return null;
      if (!isSafeImageFilename(filename)) return null;
      let snap = await getSnapshot();
      let cachedImage = snap.files.get(`newsletter-${number}/${filename}`);
      if (!cachedImage) return null;
      let mimeType = detectMimeType(filename);
      if (!mimeType || !isSafeImageContentType(mimeType)) return null;

      let bytes;
      try {
        bytes =
          typeof cachedImage === "string"
            ? new Uint8Array(await readFile(cachedImage))
            : cachedImage;
      } catch (error) {
        if (isFileNotFoundError(error)) return null;
        throw error;
      }
      return { filename, contentType: mimeType, bytes };
    },
  };
}

/** Rewrite a same-directory markdown image src to its archive route. */
export function resolveNewsletterImageUrl(number: number, url: string): string {
  let match = url.match(/^(?:\.\/)?([^/?#]+)(?:[?#].*)?$/);
  if (!match || !isSafeImageFilename(match[1])) return url;
  return routes.newsletter.image.href({ number, filename: match[1] });
}

async function fetchTarballFiles(
  fetchImpl: typeof fetch,
  owner: string,
  repo: string,
  ref: string,
  token: string | undefined,
): Promise<RawTarFile[]> {
  let tarballUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/${ref}`;
  let headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let signal = AbortSignal.timeout(15_000);
  let response = await fetchImpl(tarballUrl, {
    headers,
    redirect: "manual",
    signal,
  });

  if (response.status >= 300 && response.status < 400) {
    let location = response.headers.get("Location");
    if (!location) {
      throw new Error("Newsletter tarball redirect had no location");
    }

    let redirectUrl = new URL(location, tarballUrl);
    if (
      redirectUrl.protocol !== "https:" ||
      redirectUrl.hostname !== "codeload.github.com"
    ) {
      throw new Error("Newsletter tarball redirect had an unexpected origin");
    }

    // GitHub returns a short-lived signed codeload URL. Deliberately omit all
    // request headers so the repository token cannot cross the API boundary.
    response = await fetchImpl(redirectUrl, {
      redirect: "error",
      signal,
    });
  }

  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch newsletter tarball (${response.status})`);
  }

  let stream = response.body.pipeThrough(new DecompressionStream("gzip"));
  return collectNewsletterFiles(stream);
}

async function persistNewsletterImages(
  snapshot: NewsletterSnapshot,
  cacheRoot: string,
) {
  let cacheDirectory = path.join(cacheRoot, randomUUID());
  try {
    for (let [key, bytes] of snapshot.files) {
      if (typeof bytes === "string") continue;

      let filePath = path.join(cacheDirectory, key);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, bytes);
      snapshot.files.set(key, filePath);
    }
    snapshot.imageCacheDirectory = cacheDirectory;
  } catch (error) {
    await rm(cacheDirectory, { recursive: true, force: true });
    throw error;
  }
}

function isFileNotFoundError(
  error: unknown,
): error is NodeJS.ErrnoException & { code: "ENOENT" | "ENOTDIR" } {
  return (
    error instanceof Error &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "ENOTDIR")
  );
}

/**
 * Shared live repository. Reusing one process-wide instance keeps the in-memory
 * cache and concurrent-refresh dedupe effective across requests.
 */
export const liveNewsletterRepository = createGitHubNewsletterRepository({
  imageCacheDir: path.join(
    os.tmpdir(),
    "remix-website-newsletter",
    `process-${process.pid}`,
  ),
  onRefreshError(error, { servingStale }) {
    console.error("[newsletter] GitHub archive refresh failed", {
      servingStale,
      error,
    });
  },
  token: env.NEWSLETTER_GITHUB_TOKEN,
});
