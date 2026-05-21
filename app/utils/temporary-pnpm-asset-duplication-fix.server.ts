import * as fs from "node:fs";
import * as path from "node:path";

/*
 * TEMPORARY REMIX BUG WORKAROUND.
 *
 * Remove this file and the wrapper call in `assets.server.ts` after upgrading
 * to a Remix release that fixes https://github.com/remix-run/remix/issues/11458.
 */

interface TemporaryAssetServer {
  close(): Promise<void> | void;
  fetch(request: Request): Promise<Response | null>;
  getHref(entry: string): Promise<string>;
  getPreloads(entry: string | readonly string[]): Promise<string[]>;
}

interface TemporaryFixOptions {
  basePath: string;
  packagePathPrefix: string;
  rootDir: string;
}

export function applyTemporaryPnpmAssetDuplicationFix(
  assetServer: TemporaryAssetServer,
  options: TemporaryFixOptions,
): TemporaryAssetServer {
  let canonicalizer = createPnpmAssetCanonicalizer(options);

  return {
    close() {
      return assetServer.close();
    },

    async fetch(request) {
      let redirectHref = canonicalizer.getRedirectHref(request);
      if (redirectHref) return Response.redirect(redirectHref, 302);

      let response = await assetServer.fetch(request);
      if (!response) return response;
      return canonicalizer.canonicalizeResponse(response);
    },

    async getHref(entry) {
      return canonicalizer.canonicalizeHref(await assetServer.getHref(entry));
    },

    async getPreloads(entry) {
      return canonicalizer.canonicalizeHrefs(
        await assetServer.getPreloads(entry),
      );
    },
  };
}

function createPnpmAssetCanonicalizer(options: TemporaryFixOptions) {
  let canonicalPathnameCache = new Map<string, string>();
  let packageRootPathname = joinUrlPath(
    options.basePath,
    options.packagePathPrefix,
  );
  let pnpmPackageRootPathname = `${packageRootPathname}/.pnpm`;
  let pnpmAssetHrefPattern = new RegExp(
    `${escapeRegExp(pnpmPackageRootPathname)}/[^\\s"'<>\\\`]+`,
    "g",
  );

  function canonicalizeHref(href: string) {
    let parsed = parseHref(href);
    if (!parsed) return href;

    let canonicalPathname = canonicalizePathname(parsed.url.pathname);
    if (canonicalPathname === parsed.url.pathname) return href;

    parsed.url.pathname = canonicalPathname;
    return parsed.isAbsoluteUrl
      ? parsed.url.toString()
      : formatRootRelativeHref(parsed.url);
  }

  function canonicalizeHrefs(hrefs: string[]) {
    let seen = new Set<string>();
    let canonicalHrefs: string[] = [];

    for (let href of hrefs) {
      let canonicalHref = canonicalizeHref(href);
      if (seen.has(canonicalHref)) continue;
      seen.add(canonicalHref);
      canonicalHrefs.push(canonicalHref);
    }

    return canonicalHrefs;
  }

  function canonicalizeScript(source: string) {
    if (!source.includes(pnpmPackageRootPathname)) return source;
    return source.replace(pnpmAssetHrefPattern, (href) =>
      canonicalizeHref(href),
    );
  }

  function getRedirectHref(request: Request) {
    let url = new URL(request.url);
    let canonicalPathname = canonicalizePathname(url.pathname);
    if (canonicalPathname === url.pathname) return null;

    url.pathname = canonicalPathname;
    return url.toString();
  }

  async function canonicalizeResponse(response: Response) {
    if (!isJavaScriptResponse(response)) return response;

    let source = await response.text();
    let canonicalSource = canonicalizeScript(source);
    let headers = new Headers(response.headers);
    headers.delete("content-length");

    return new Response(canonicalSource, {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  }

  function canonicalizePathname(pathname: string) {
    let cachedPathname = canonicalPathnameCache.get(pathname);
    if (cachedPathname) return cachedPathname;

    let canonicalPathname = findCanonicalPathname(pathname) ?? pathname;
    canonicalPathnameCache.set(pathname, canonicalPathname);
    return canonicalPathname;
  }

  function findCanonicalPathname(pathname: string) {
    if (!pathname.startsWith(`${pnpmPackageRootPathname}/`)) return null;

    let virtualStoreSegments = pathname
      .slice(pnpmPackageRootPathname.length + 1)
      .split("/");
    let nodeModulesIndex = virtualStoreSegments.indexOf("node_modules");
    if (nodeModulesIndex === -1) return null;

    let packageSegments = virtualStoreSegments.slice(nodeModulesIndex + 1);
    let packageNameSegmentCount = getPackageNameSegmentCount(packageSegments);
    if (!packageNameSegmentCount) return null;

    let decodedVirtualStoreSegments =
      decodeSafePathSegments(virtualStoreSegments);
    let decodedPackageSegments = decodeSafePathSegments(packageSegments);
    if (!decodedVirtualStoreSegments || !decodedPackageSegments) return null;

    let pnpmPackageFilePath = path.join(
      options.rootDir,
      "node_modules",
      ".pnpm",
      ...decodedVirtualStoreSegments,
    );
    let cleanPackageFilePath = path.join(
      options.rootDir,
      "node_modules",
      ...decodedPackageSegments,
    );

    if (!isSameRealPath(pnpmPackageFilePath, cleanPackageFilePath)) return null;

    return `${packageRootPathname}/${packageSegments.join("/")}`;
  }

  return {
    canonicalizeHref,
    canonicalizeHrefs,
    canonicalizeResponse,
    getRedirectHref,
  };
}

function getPackageNameSegmentCount(segments: string[]) {
  if (segments.length === 0) return 0;
  return segments[0]?.startsWith("@") ? (segments.length >= 2 ? 2 : 0) : 1;
}

function decodeSafePathSegments(segments: string[]) {
  let decodedSegments: string[] = [];

  for (let segment of segments) {
    let decodedSegment: string;
    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
      return null;
    }

    if (
      decodedSegment.length === 0 ||
      decodedSegment === "." ||
      decodedSegment === ".." ||
      decodedSegment.includes("/") ||
      decodedSegment.includes("\\")
    ) {
      return null;
    }

    decodedSegments.push(decodedSegment);
  }

  return decodedSegments;
}

function isSameRealPath(left: string, right: string) {
  let leftRealPath = resolveRealPath(left);
  let rightRealPath = resolveRealPath(right);
  return (
    leftRealPath !== null &&
    rightRealPath !== null &&
    leftRealPath === rightRealPath
  );
}

function resolveRealPath(filePath: string) {
  try {
    return path.normalize(fs.realpathSync(filePath));
  } catch (error) {
    if (isMissingPathError(error)) return null;
    throw error;
  }
}

function isMissingPathError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    ((error as NodeJS.ErrnoException).code === "ENOENT" ||
      (error as NodeJS.ErrnoException).code === "ENOTDIR")
  );
}

function isJavaScriptResponse(response: Response) {
  let contentType = response.headers.get("content-type")?.toLowerCase();
  return (
    contentType?.includes("javascript") === true ||
    contentType?.includes("ecmascript") === true
  );
}

function parseHref(href: string) {
  try {
    let isAbsoluteUrl = /^[a-z][a-z\d+.-]*:/i.test(href);
    return {
      isAbsoluteUrl,
      url: new URL(href, "http://remix.local"),
    };
  } catch {
    return null;
  }
}

function formatRootRelativeHref(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function joinUrlPath(...parts: string[]) {
  let segments = parts
    .flatMap((part) => part.split("/"))
    .filter((segment) => segment.length > 0);
  return `/${segments.join("/")}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
