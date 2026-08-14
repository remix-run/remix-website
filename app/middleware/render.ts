import { renderWith } from "remix/middleware/render";
import type { RequestContext } from "remix/router";
import { createHtmlResponse } from "remix/response/html";
import type { RemixNode } from "remix/ui";
import { renderToStream, type ResolveFrameContext } from "remix/ui/server";

import { assets } from "../utils/assets.ts";

const isDevelopment = process.env.NODE_ENV === "development";

export interface AppRenderer {
  (node: RemixNode, init?: ResponseInit): Response;
}

/**
 * Installs `context.render(node, init)` for the current request.
 *
 * Server-resolved frame requests also carry `X-Remix-Ssr-Frame: true`, which
 * routes use to skip entrance animations for frames rendered during SSR.
 */
export let renderMiddleware = renderWith(
  (context): AppRenderer =>
    function render(node, init) {
      let stream = renderToStream(node, {
        frameSrc: context.request.url,
        topFrameSrc: getTopFrameSrc(context.request),
        signal: context.request.signal,
        onError(error) {
          console.error(error);
        },
        resolveFrame: (src, target, frameContext) =>
          resolveFrame(context, src, target, frameContext),
        resolveClientEntry,
      });

      let response = createHtmlResponse(stream, init);
      if (isDevelopment) {
        // Frame navigations fetch HTML programmatically, so production cache
        // headers can hide server changes during development.
        response.headers.set("Cache-Control", "no-store");
      }
      return response;
    },
);

const FRAME_HEADER = "X-Remix-Frame";
const FRAME_TARGET_HEADER = "X-Remix-Target";
const SSR_FRAME_HEADER = "X-Remix-Ssr-Frame";
const TOP_FRAME_SRC_HEADER = "X-Remix-Top-Frame-Src";
const MAX_FRAME_REDIRECTS = 20;
const FRAME_REQUEST_HEADERS_TO_REMOVE = [
  "Connection",
  "Content-Encoding",
  "Content-Language",
  "Content-Length",
  "Content-Location",
  "Content-Type",
  "Expect",
  "Host",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Range",
  "If-Unmodified-Since",
  "Keep-Alive",
  "Range",
  "TE",
  "Trailer",
  "Transfer-Encoding",
  "Upgrade",
] as const;
// The top frame src header is omitted so cross-origin frames never receive the
// outer request URL, which may contain private paths or query parameters.
const CROSS_ORIGIN_FRAME_HEADERS = [
  "Accept",
  "Accept-Encoding",
  FRAME_HEADER,
  FRAME_TARGET_HEADER,
] as const;

function getTopFrameSrc(request: Request) {
  if (request.headers.get(FRAME_HEADER) !== "true") return request.url;
  return request.headers.get(TOP_FRAME_SRC_HEADER) ?? request.url;
}

async function resolveFrame(
  context: RequestContext<any, any>,
  src: string,
  target?: string,
  frameContext?: ResolveFrameContext,
): Promise<string | ReadableStream<Uint8Array>> {
  let currentFrameSrc = frameContext?.currentFrameSrc ?? context.request.url;
  let topFrameSrc =
    frameContext?.topFrameSrc ?? getTopFrameSrc(context.request);
  let frameUrl = new URL(src, currentFrameSrc);
  let headers = createFrameRequestHeaders(context.headers, target, topFrameSrc);

  let response = await followFrameRedirects(context, frameUrl, headers);

  if (response.body != null) return response.body;
  if (response.ok) return "";

  return `<pre>Frame error: ${response.status} ${escapeHtml(response.statusText)}</pre>`;
}

function createFrameRequestHeaders(
  requestHeaders: Headers,
  target: string | undefined,
  topFrameSrc: string,
) {
  let headers = new Headers(requestHeaders);

  for (let name of FRAME_REQUEST_HEADERS_TO_REMOVE) {
    headers.delete(name);
  }
  let secFetchNames = [...headers.keys()].filter((name) =>
    name.startsWith("sec-fetch-"),
  );
  for (let name of secFetchNames) {
    headers.delete(name);
  }

  headers.set("Accept", "text/html");
  headers.set("Accept-Encoding", "identity");
  headers.set(FRAME_HEADER, "true");
  headers.set(SSR_FRAME_HEADER, "true");
  headers.set(TOP_FRAME_SRC_HEADER, topFrameSrc);

  if (target == null) {
    headers.delete(FRAME_TARGET_HEADER);
  } else {
    headers.set(FRAME_TARGET_HEADER, target);
  }

  return headers;
}

async function followFrameRedirects(
  context: RequestContext<any, any>,
  initialUrl: URL,
  headers: Headers,
) {
  let url = initialUrl;

  for (
    let redirectCount = 0;
    redirectCount <= MAX_FRAME_REDIRECTS;
    redirectCount++
  ) {
    if (url.origin !== context.url.origin) {
      headers = createCrossOriginFrameHeaders(headers);
    }

    let response = await context.router.fetch(
      new Request(url, {
        method: "GET",
        headers,
        signal: context.request.signal,
      }),
    );
    let location = response.headers.get("Location");

    if (location == null || response.status < 300 || response.status >= 400) {
      return response;
    }
    if (redirectCount === MAX_FRAME_REDIRECTS) break;

    await response.body?.cancel();
    url = new URL(location, url);
  }

  throw new Error(
    `Too many frame redirects while resolving ${initialUrl.href}`,
  );
}

function createCrossOriginFrameHeaders(headers: Headers) {
  let crossOriginHeaders = new Headers();

  for (let name of CROSS_ORIGIN_FRAME_HEADERS) {
    let value = headers.get(name);
    if (value != null) crossOriginHeaders.set(name, value);
  }

  return crossOriginHeaders;
}

async function resolveClientEntry(
  entryId: string,
  component: { readonly name: string },
) {
  let hashIndex = entryId.lastIndexOf("#");
  let sourceId = hashIndex === -1 ? entryId : entryId.slice(0, hashIndex);
  let exportName =
    (hashIndex === -1 ? "" : entryId.slice(hashIndex + 1)) || component.name;

  if (!exportName) {
    throw new Error(
      `Unable to resolve the export name for client entry "${entryId}". Add an export name to the entry ID (e.g. import.meta.url + "#ExportName") or use a named component function.`,
    );
  }

  if (!sourceId.startsWith("file:")) {
    return { href: sourceId, exportName };
  }

  let [href, preloads] = await Promise.all([
    assets.getHref(sourceId),
    assets.getPreloads(sourceId),
  ]);

  return { href, exportName, preloads };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
