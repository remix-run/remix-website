import parseFrontMatter from "front-matter";
import { detectMimeType } from "remix/mime";
import { LRUCache } from "lru-cache";

import {
  NEWSLETTER_MARKDOWN_PATTERN,
  type NewsletterFile,
} from "./file-contract.ts";
import { createGitHubNewsletterSource } from "./github.ts";

import { routes } from "../../routes.ts";
import { env } from "../../utils/env.ts";

/**
 * Newsletter archive.
 *
 * Issues live in the private `remix-run/newsletter` GitHub repository under
 * `newsletters/newsletter-<N>/<YYYY-MM-DD>-remix-newsletter-<N>.md`, with any
 * images beside the markdown. We fetch the file tree and batch only Markdown
 * into a snapshot. Images are fetched on demand by immutable Git SHA and cached
 * separately. Expired snapshots remain available during a shared refresh.
 */

const NEWSLETTER_REPO_OWNER = "remix-run";
const NEWSLETTER_REPO_NAME = "newsletter";
const NEWSLETTER_REPO_REF = "main";

/** Raster image types we are willing to serve. SVG is intentionally excluded. */
const SAFE_IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"] as const;

const FRESH_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ISSUES = 200;
const MAX_CACHED_IMAGE_BYTES = 64 * 1024 * 1024;

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
  files: Map<string, string>;
}

/**
 * Parse Markdown and image references rooted at the repository's newsletters/
 * directory into a newest-first snapshot, without downloading any images.
 */
export function parseNewsletterSnapshot(
  files: NewsletterFile[],
): NewsletterSnapshot {
  let issueDirs = new Map<number, Map<string, NewsletterFile>>();

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
    let markdown: string | undefined;
    let dateMatch: RegExpMatchArray | null = null;
    for (let file of bucket.values()) {
      let match = file.name.match(NEWSLETTER_MARKDOWN_PATTERN);
      if (!match || Number(match[1]) !== number || !("markdown" in file)) {
        continue;
      }
      markdown = file.markdown;
      dateMatch = match;
      break;
    }
    if (markdown === undefined || !dateMatch) continue;
    let [, , yearValue, monthValue, dayValue] = dateMatch;
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

    let frontmatter = readNewsletterFrontmatter(markdown);
    if (frontmatter.draft === true) continue;
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

  let fileMap = new Map<string, string>();
  for (let file of files) {
    let [directory, filename] = file.name.split("/");
    if (
      !directory ||
      !filename ||
      !/^newsletter-\d+$/.test(directory) ||
      !isSafeImageFilename(filename) ||
      !("sha" in file)
    ) {
      continue;
    }
    fileMap.set(file.name, file.sha);
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

interface NewsletterFrontmatter {
  draft?: unknown;
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
    onRefreshError?: (
      error: unknown,
      context: { servingStale: boolean },
    ) => void;
    onImageError?: (error: unknown) => void;
  } = {},
): NewsletterRepository {
  let owner = options.owner ?? NEWSLETTER_REPO_OWNER;
  let repo = options.repo ?? NEWSLETTER_REPO_NAME;
  let ref = options.ref ?? NEWSLETTER_REPO_REF;
  let token = options.token;
  let fetchImpl = options.fetchImpl ?? globalThis.fetch;
  let ttlMs = options.ttlMs ?? FRESH_TTL_MS;
  let onRefreshError = options.onRefreshError;
  let onImageError = options.onImageError;
  let source = createGitHubNewsletterSource({
    owner,
    repo,
    ref,
    token,
    fetchImpl,
  });
  let imageCache = new LRUCache<string, Uint8Array>({
    max: 1_000,
    maxSize: MAX_CACHED_IMAGE_BYTES,
    sizeCalculation: (bytes) => Math.max(1, bytes.byteLength),
    // Eviction must not fail an image response whose download is in progress.
    ignoreFetchAbort: true,
    async fetchMethod(sha) {
      try {
        return await source.getImage(sha);
      } catch (error) {
        onImageError?.(error);
        throw new NewsletterUpstreamUnavailableError(
          "Newsletter image is currently unavailable",
          { cause: error },
        );
      }
    },
  });

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
      let sha = snap.files.get(`newsletter-${number}/${filename}`);
      if (!sha) return null;
      let mimeType = detectMimeType(filename);
      if (!mimeType || !isSafeImageContentType(mimeType)) return null;
      let bytes = await imageCache.forceFetch(sha);
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

/**
 * Shared live repository. Reusing one process-wide instance keeps the in-memory
 * cache and concurrent-refresh dedupe effective across requests.
 */
export const liveNewsletterRepository = createGitHubNewsletterRepository({
  onRefreshError(error, { servingStale }) {
    console.error("[newsletter] GitHub refresh failed", {
      servingStale,
      error,
    });
  },
  onImageError(error) {
    console.error("[newsletter] GitHub image fetch failed", { error });
  },
  token: env.NEWSLETTER_GITHUB_TOKEN,
});
