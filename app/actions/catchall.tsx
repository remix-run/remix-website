import { redirect } from "remix/response/redirect";
import semver from "semver";

import type { AppRenderer } from "../middleware/render.ts";
import { StatusErrorDocument } from "../ui/not-found-page.tsx";
import { CACHE } from "../utils/cache-control.ts";

const SAFE_STATIC_FILE_EXTENSIONS = [
  ".html",
  ".css",
  ".js",
  ".txt",
  ".json",
  ".ico",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".otf",
  ".mp4",
  ".webm",
  ".ogg",
  ".mp3",
  ".wav",
  ".flac",
  ".aac",
  ".m4a",
  ".mov",
];

export function catchallHandler({
  render,
  request,
}: {
  render: AppRenderer;
  request: Request;
}) {
  let url = new URL(request.url);
  let redirectUrl =
    request.method === "GET" || request.method === "HEAD"
      ? getCatchallRedirect(url)
      : null;
  if (redirectUrl) {
    return redirect(redirectUrl, 302);
  }
  if (isLikelyStaticFileRequest(url.pathname)) {
    return new Response("", { status: 404, statusText: "Not Found" });
  }

  return render(<StatusErrorDocument status={404} statusText="Not Found" />, {
    status: 404,
    statusText: "Not Found",
    headers: {
      "Cache-Control": CACHE.PRIVATE,
    },
  });
}

function getCatchallRedirect(url: URL): string | null {
  if (url.pathname.startsWith("//")) return null;

  // Resolve legacy destinations from the slash-trimmed path so a trailing
  // slash never costs an extra redirect hop.
  let pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/docs") {
    return "https://guides.remix.run/";
  }

  if (pathname.startsWith("/docs/")) {
    return getDocsRedirect(pathname);
  }

  if (pathname === "/resources" || pathname.startsWith("/resources/")) {
    return `https://v2.remix.run${pathname}${url.search}`;
  }

  if (pathname !== url.pathname) {
    let normalized = new URL(url.toString());
    normalized.pathname = pathname;
    return normalized.toString();
  }

  return null;
}

function getVersionedDocsTag(ref: string): string | null {
  if (ref === "v1") {
    return "remix@1.19.3";
  }

  let version = semver.clean(ref);
  if (version === null) {
    return null;
  }

  return semver.lte(version, "1.6.4") ? `v${version}` : `remix@${version}`;
}

function getGitHubDocsUrl(tag: string, path: string[]): string {
  let docsPath = path.length > 0 ? `/docs/${path.join("/")}.md` : "/docs";
  let view = path.length > 0 ? "blob" : "tree";
  return `https://github.com/remix-run/remix/${view}/${encodeURIComponent(tag)}${docsPath}`;
}

function getV2DocsUrl(path: string[]): string {
  // v2.remix.run redirects slashless doc paths, so link to the final URL.
  let docsPath = path.join("/");
  return `https://v2.remix.run/docs/${docsPath ? `${docsPath}/` : ""}`;
}

function getDocsRedirect(pathname: string): string {
  let segments = pathname.split("/").slice(2);
  // Legacy docs lived at /docs/en/<ref>/*, though links often omit `en`.
  let isLegacyDocsPath = segments[0] === "en";
  if (isLegacyDocsPath) segments = segments.slice(1);

  let [ref = "", ...path] = segments;
  let tag = getVersionedDocsTag(ref);
  if (tag !== null) {
    return getGitHubDocsUrl(tag, path);
  }

  if (V2_DOCS_REFS.has(ref)) {
    return getV2DocsUrl(path);
  }

  // Only clearly-v2 paths go to v2; anything else gets the current guides.
  if (isLegacyDocsPath || V2_DOCS_SECTIONS.has(ref)) {
    return getV2DocsUrl(segments);
  }

  return "https://guides.remix.run/";
}

const V2_DOCS_REFS = new Set(["main", "dev", "release-next", "2"]);

const V2_DOCS_SECTIONS = new Set([
  "components",
  "discussion",
  "file-conventions",
  "guides",
  "hooks",
  "other-api",
  "route",
  "start",
  "styling",
  "utils",
]);

function isLikelyStaticFileRequest(pathname: string) {
  let trailingSegment = pathname.split("/").pop();
  return !!(
    trailingSegment &&
    SAFE_STATIC_FILE_EXTENSIONS.some((ext) => trailingSegment.endsWith(ext))
  );
}
