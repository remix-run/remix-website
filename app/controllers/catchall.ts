import semver from "semver";
import { renderNotFoundPage } from "../ui/not-found-page";

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

export function catchallHandler(context: { request: Request }) {
  let url = new URL(context.request.url);
  let redirectUrl = normalizeLegacyRedirect(url);
  if (redirectUrl) {
    return Response.redirect(redirectUrl, 302);
  }
  if (isLikelyStaticFileRequest(url.pathname)) {
    return new Response("", { status: 404, statusText: "Not Found" });
  }

  return renderNotFoundPage();
}

function normalizeLegacyRedirect(url: URL): string | null {
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    let normalized = new URL(url.toString());
    normalized.pathname = normalized.pathname.slice(0, -1);
    return normalized.toString();
  }

  if (url.pathname === "/docs") {
    return "https://v2.remix.run/docs";
  }

  if (url.pathname.startsWith("/docs/")) {
    return getDocsRedirect(url.pathname);
  }

  if (url.pathname === "/resources" || url.pathname.startsWith("/resources/")) {
    return `https://v2.remix.run${url.pathname}${url.search}`;
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

function getDocsRedirect(pathname: string): string {
  let fullPathWithoutDocs = pathname.split("/").slice(2);
  let [langOrRef, refOrPath, ...rest] = fullPathWithoutDocs;

  if (langOrRef === "en") {
    let ref = refOrPath;
    let path = rest;

    if (ref) {
      let tag = getVersionedDocsTag(ref);
      if (tag !== null) {
        return getGitHubDocsUrl(tag, path);
      }
    }

    if (ref === "main" || ref === "dev") {
      return `https://v2.remix.run/docs/${path.join("/")}`;
    }

    return `https://v2.remix.run/docs/${[ref, ...path].filter(Boolean).join("/")}`;
  }

  if (langOrRef) {
    let tag = getVersionedDocsTag(langOrRef);
    if (tag !== null) {
      return getGitHubDocsUrl(tag, [refOrPath, ...rest].filter(Boolean));
    }
  }

  return `https://v2.remix.run/docs/${fullPathWithoutDocs.join("/")}`;
}

function isLikelyStaticFileRequest(pathname: string) {
  let trailingSegment = pathname.split("/").pop();
  return !!(
    trailingSegment &&
    SAFE_STATIC_FILE_EXTENSIONS.some((ext) => trailingSegment.endsWith(ext))
  );
}
