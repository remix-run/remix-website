import * as os from "node:os";
import * as path from "node:path";
import { createFsFileCache, type FileCache } from "remix/assets";

import {
  NEWSLETTER_MARKDOWN_PATTERN,
  type NewsletterFile,
} from "./file-contract.ts";
import { createGitHubNewsletterSource } from "./github.ts";

import { parseFrontmatter } from "../../data/frontmatter.ts";
import { routes } from "../../routes.ts";
import { env } from "../../utils/env.ts";

/**
 * Newsletter archive.
 *
 * Issues live in the private `remix-run/newsletter` GitHub repository under
 * `newsletters/newsletter-<N>/<YYYY-MM-DD>-remix-newsletter-<N>.md`, with any
 * images beside the markdown. We fetch the file tree and batch only Markdown
 * into a snapshot. Images are fetched on demand by immutable Git SHA and stored
 * in a file cache. Expired snapshots remain available during a shared refresh.
 */

const NEWSLETTER_REPO_OWNER = "remix-run";
const NEWSLETTER_REPO_NAME = "newsletter";
const NEWSLETTER_REPO_REF = "main";

/** Raster image types we are willing to serve. SVG is intentionally excluded. */
const SAFE_IMAGE_CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

const FRESH_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ISSUES = 200;
const MAX_CACHED_IMAGE_BYTES = 64 * 1024 * 1024;
// GitHub image downloads are capped at 8 MiB; leave room for cache metadata.
const MAX_CACHED_IMAGE_ENTRY_BYTES = 9 * 1024 * 1024;

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
  preview: string;
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
  files: Map<string, string>;
}

/**
 * Parse Markdown and image references rooted at the repository's newsletters/
 * directory into a newest-first snapshot, without downloading any images.
 */
export function parseNewsletterSnapshot(
  files: NewsletterFile[],
): NewsletterSnapshot {
  // One pass: the first published-issue Markdown per issue, plus the Git SHA
  // of every safe raster image keyed by its `newsletter-<N>/<filename>` path.
  let markdownFiles = new Map<number, IssueMarkdownFile>();
  let imageShas = new Map<string, string>();
  for (let file of files) {
    let location = parseIssueFilePath(file.name);
    if (!location) continue;

    if ("sha" in file) {
      if (isSafeImageFilename(location.filename)) {
        imageShas.set(file.name, file.sha);
      }
    } else if (!markdownFiles.has(location.number)) {
      // The pattern's backreference ties the filename's issue number to its
      // directory, so a match always belongs to `location.number`.
      let match = file.name.match(NEWSLETTER_MARKDOWN_PATTERN);
      if (!match) continue;
      let [, , year, month, day] = match.map(Number);
      markdownFiles.set(location.number, {
        markdown: file.markdown,
        year,
        month,
        day,
      });
    }
  }

  let issues: ParsedIssue[] = [];
  let summaries: NewsletterSummary[] = [];
  for (let [number, file] of markdownFiles) {
    let issue = parseIssue(number, file);
    if (!issue) continue;
    issues.push(issue.parsed);
    summaries.push(
      buildSummary(issue.parsed, issue.body, (filename) =>
        imageShas.has(`newsletter-${number}/${filename}`),
      ),
    );
  }

  let byNewest = (a: { number: number }, b: { number: number }) =>
    b.number - a.number;
  return {
    issues: issues.sort(byNewest).slice(0, MAX_ISSUES),
    summaries: summaries.sort(byNewest).slice(0, MAX_ISSUES),
    files: imageShas,
  };
}

/** Splits `newsletter-<N>/<filename>`, the only layout the archive reads. */
function parseIssueFilePath(name: string) {
  let match = name.match(/^newsletter-(\d+)\/([^/]+)$/);
  if (!match) return null;
  let number = Number(match[1]);
  return number > 0 ? { number, filename: match[2] } : null;
}

interface IssueMarkdownFile {
  markdown: string;
  /** Publication date parts from the filename, not yet validated. */
  year: number;
  month: number;
  day: number;
}

/** Returns null for drafts and filenames with an impossible date. */
function parseIssue(
  number: number,
  { markdown, year, month, day }: IssueMarkdownFile,
): { parsed: ParsedIssue; body: string } | null {
  let date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  let { attributes, body } = readNewsletterMarkdown(markdown);
  if (attributes.draft === true) return null;

  return {
    parsed: {
      number,
      date,
      title: findTitleHeading(body)?.title ?? `Remix Newsletter #${number}`,
      preview:
        typeof attributes.previewText === "string"
          ? attributes.previewText.trim()
          : "",
      markdown,
    },
    body,
  };
}

function buildSummary(
  issue: ParsedIssue,
  body: string,
  isImageAvailable: (filename: string) => boolean,
): NewsletterSummary {
  let image = extractNewsletterPreviewImage(body, isImageAvailable);
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
}

function readNewsletterMarkdown(markdown: string): {
  attributes: { draft?: unknown; previewText?: unknown };
  body: string;
} {
  try {
    let { attributes, body } = parseFrontmatter(markdown);
    return {
      attributes:
        attributes !== null &&
        typeof attributes === "object" &&
        !Array.isArray(attributes)
          ? attributes
          : {},
      body,
    };
  } catch {
    // Malformed remote frontmatter falls back to defaults instead of dropping
    // the newsletter issue from the archive.
    return { attributes: {}, body: markdown };
  }
}

/**
 * Find the issue title: the first ATX H1 line in a Markdown body (frontmatter
 * already removed). `start`/`end` span the heading line so the issue page can
 * drop it instead of rendering the title twice.
 */
export function findTitleHeading(
  body: string,
): { title: string; start: number; end: number } | null {
  let match = /^#[ \t]+(.+)$/m.exec(body);
  if (!match) return null;
  return {
    title: match[1].trim(),
    start: match.index,
    end: match.index + match[0].length,
  };
}

/**
 * Return the first safe, same-directory raster image in a newsletter's
 * Markdown body (frontmatter already removed).
 */
export function extractNewsletterPreviewImage(
  body: string,
  isAvailable: (filename: string) => boolean = () => true,
): { filename: string; alt: string } | null {
  let imagePattern = /!\[([^\]]*)\]\(\s*(?:<([^>\n]+)>|([^\s)]+))[^\n)]*\)/g;

  for (let match of body.matchAll(imagePattern)) {
    let filename = parseSameDirImageFilename(match[2] ?? match[3]);
    if (filename && isAvailable(filename)) {
      return { filename, alt: match[1].trim() };
    }
  }

  return null;
}

/** `header.png`, `./header.png?raw=1` -> `header.png`; null otherwise. */
function parseSameDirImageFilename(url: string): string | null {
  let filename = url.match(/^(?:\.\/)?([^/?#]+)(?:[?#].*)?$/)?.[1];
  return filename && isSafeImageFilename(filename) ? filename : null;
}

export function isSafeImageFilename(filename: string): boolean {
  return getSafeImageContentType(filename) !== null;
}

/** The content type to serve for a safe raster image filename, else null. */
function getSafeImageContentType(filename: string): string | null {
  if (!filename || filename.includes("/") || filename.includes("\\")) {
    return null;
  }
  let ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return Object.hasOwn(SAFE_IMAGE_CONTENT_TYPES, ext)
    ? SAFE_IMAGE_CONTENT_TYPES[ext]
    : null;
}

export function createGitHubNewsletterRepository(options: {
  /** Stores downloaded images by Git SHA. Failures never block serving. */
  imageCache: FileCache;
  token?: string;
  fetchImpl?: typeof fetch;
  ttlMs?: number;
  onRefreshError?: (error: unknown, context: { servingStale: boolean }) => void;
  onImageError?: (error: unknown) => void;
  onImageCacheError?: (error: unknown) => void;
}): NewsletterRepository {
  let {
    imageCache,
    token,
    fetchImpl = globalThis.fetch,
    ttlMs = FRESH_TTL_MS,
    onRefreshError,
    onImageError,
    onImageCacheError,
  } = options;
  let source = createGitHubNewsletterSource({
    owner: NEWSLETTER_REPO_OWNER,
    repo: NEWSLETTER_REPO_NAME,
    ref: NEWSLETTER_REPO_REF,
    token,
    fetchImpl,
  });
  let pendingImages = new Map<string, Promise<Uint8Array>>();

  /** Share one cache lookup or download per SHA across concurrent requests. */
  function getImageBytes(sha: string): Promise<Uint8Array> {
    let pending = pendingImages.get(sha);
    if (pending) return pending;
    let load = loadImageBytes(sha).finally(() => pendingImages.delete(sha));
    pendingImages.set(sha, load);
    return load;
  }

  async function loadImageBytes(sha: string): Promise<Uint8Array> {
    try {
      let cached = await imageCache.get(sha);
      if (cached) return new Uint8Array(await cached.arrayBuffer());
    } catch (error) {
      onImageCacheError?.(error);
    }

    let bytes: Uint8Array;
    try {
      bytes = await source.getImage(sha);
    } catch (error) {
      onImageError?.(error);
      throw new NewsletterUpstreamUnavailableError(
        "Newsletter image is currently unavailable",
        { cause: error },
      );
    }

    try {
      await imageCache.put(sha, new File([Uint8Array.from(bytes)], sha));
    } catch (error) {
      onImageCacheError?.(error);
    }
    return bytes;
  }

  let snapshot: NewsletterSnapshot | null = null;
  let expiresAt = 0;
  let refreshPromise: Promise<NewsletterSnapshot> | null = null;

  async function refresh(): Promise<NewsletterSnapshot> {
    try {
      let files = await source.listFiles();
      let next = parseNewsletterSnapshot(files);
      snapshot = next;
      expiresAt = Date.now() + ttlMs;
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
    if (!refreshPromise) {
      refreshPromise = refresh().finally(() => {
        refreshPromise = null;
      });
      // Warm requests don't await the refresh. Errors are reported in refresh();
      // cold callers still receive the original promise and its rejection.
      void refreshPromise.catch(() => {});
    }
    return snapshot ?? refreshPromise;
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
        preview: issue.preview,
        markdown: issue.markdown,
        image:
          snap.summaries.find((summary) => summary.number === number)?.image ??
          null,
      };
    },

    async getImage(number, filename) {
      if (!Number.isInteger(number) || number <= 0) return null;
      let contentType = getSafeImageContentType(filename);
      if (!contentType) return null;
      let snap = await getSnapshot();
      let sha = snap.files.get(`newsletter-${number}/${filename}`);
      if (!sha) return null;
      let bytes = await getImageBytes(sha);
      return { filename, contentType, bytes };
    },
  };
}

/** Rewrite a same-directory markdown image src to its archive route. */
export function resolveNewsletterImageUrl(number: number, url: string): string {
  let filename = parseSameDirImageFilename(url);
  return filename ? routes.newsletter.image.href({ number, filename }) : url;
}

let liveNewsletterRepository: NewsletterRepository | undefined;

/**
 * The shared live repository, created on first use so importing this module
 * has no filesystem side effects and reads the token when it's needed. Reusing
 * one process-wide instance keeps the snapshot and concurrent refresh and
 * download dedupe effective across requests.
 */
export function getLiveNewsletterRepository(): NewsletterRepository {
  liveNewsletterRepository ??= createLiveNewsletterRepository();
  return liveNewsletterRepository;
}

function createLiveNewsletterRepository() {
  return createGitHubNewsletterRepository({
    imageCache: createFsFileCache({
      directory: path.join(os.tmpdir(), "remix-website-newsletter-images"),
      maxEntries: 1_000,
      maxFileSize: MAX_CACHED_IMAGE_ENTRY_BYTES,
      maxTotalSize: MAX_CACHED_IMAGE_BYTES,
    }),
    onRefreshError(error, { servingStale }) {
      console.error("[newsletter] GitHub refresh failed", {
        servingStale,
        error,
      });
    },
    onImageError(error) {
      console.error("[newsletter] GitHub image fetch failed", { error });
    },
    onImageCacheError(error) {
      console.error("[newsletter] Image cache failed", { error });
    },
    token: env.NEWSLETTER_GITHUB_TOKEN,
  });
}
