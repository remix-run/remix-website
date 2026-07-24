import type { AssetServer } from "remix/assets";
import { html } from "remix/html-template";
import { Renderer, renderWith } from "remix/middleware/render";
import type { ContextWithEntries, RequestContext, Router } from "remix/router";
import { createHtmlResponse } from "remix/response/html";
import { createElement } from "remix/ui";
import type { RemixNode } from "remix/ui";
import { renderToStream, type ResolveFrameContext } from "remix/ui/server";

import type { AssetEntryContextEntry } from "./asset-entry.ts";
import { AssetEntryProvider } from "../ui/document.tsx";
import { assetServer } from "../utils/assets.server.ts";

export interface AppRenderer {
  (node: RemixNode, init?: ResponseInit): Response;
}

type FormDataContextEntry = {
  key: typeof FormData;
  value: FormData;
  property: "formData";
};

type RendererContextEntry = {
  key: typeof Renderer;
  value: AppRenderer;
  property: "render";
};

type RenderMiddlewareContext = ContextWithEntries<
  RequestContext,
  [AssetEntryContextEntry]
>;

export type AppContext = ContextWithEntries<
  RequestContext,
  [FormDataContextEntry, AssetEntryContextEntry, RendererContextEntry]
>;

declare module "remix/router" {
  interface RouterTypes {
    context: AppContext;
  }
}

const FRAME_HEADER = "x-remix-frame";
const FRAME_TARGET_HEADER = "x-remix-target";
const SSR_FRAME_HEADER = "x-remix-ssr-frame";
const TOP_FRAME_SRC_HEADER = "x-remix-top-frame-src";
const MAX_FRAME_REDIRECTS = 20;
const FRAME_REQUEST_HEADERS_TO_REMOVE = [
  "connection",
  "content-encoding",
  "content-language",
  "content-length",
  "content-location",
  "content-type",
  "expect",
  "host",
  "if-match",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "if-unmodified-since",
  "keep-alive",
  "range",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
] as const;
const CROSS_ORIGIN_FRAME_HEADERS = [
  "accept",
  "accept-encoding",
  FRAME_HEADER,
  FRAME_TARGET_HEADER,
] as const;

export let renderMiddleware = renderWith((context) =>
  createAppRenderer(context as RenderMiddlewareContext),
);

function createAppRenderer(context: RenderMiddlewareContext): AppRenderer {
  let request = context.request;
  let topFrameSrc = getTopFrameSrc(request);

  return function render(node: RemixNode, init?: ResponseInit) {
    let clientEntryHrefs = new Set<string>();
    let isFrameRequest = request.headers.get(FRAME_HEADER) === "true";
    let bootstrapPreloads = isFrameRequest
      ? undefined
      : assetServer.getPreloads(context.assetEntry.source);
    let stream = renderToStream(
      createElement(AssetEntryProvider, { value: context.assetEntry }, node),
      {
        frameSrc: request.url,
        topFrameSrc,
        signal: request.signal,
        resolveFrame: (src, target, frameContext) =>
          resolveFrame(context, src, target, frameContext),
        async resolveClientEntry(entryId, component) {
          let resolved = await resolveClientEntry(
            assetServer,
            entryId,
            component,
          );
          clientEntryHrefs.add(resolved.href);
          return resolved;
        },
        onError(error) {
          console.error(error);
        },
      },
    );

    stream = injectModulePreloads(
      stream,
      context.assetEntry.src,
      isFrameRequest,
      async (includeBootstrap) => {
        return [
          ...new Set([
            ...clientEntryHrefs,
            ...(includeBootstrap && bootstrapPreloads
              ? await bootstrapPreloads
              : []),
          ]),
        ].filter((href) => href !== context.assetEntry.src);
      },
    );

    if (!request.headers.has(FRAME_TARGET_HEADER)) {
      return createHtmlResponse(stream, init);
    }

    let headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/html; charset=utf-8");
    }
    return new Response(stream, { ...init, headers });
  };
}

function getTopFrameSrc(request: Request) {
  if (request.headers.get(FRAME_HEADER) !== "true") return request.url;
  return request.headers.get(TOP_FRAME_SRC_HEADER) ?? request.url;
}

// Remix resolves every client entry before emitting the initial render chunk,
// but does not expose the collected entries to the asset server or provide an
// HTML finalization hook. Hold that chunk long enough to preload document roots
// before the bootstrap script, or frame-local roots before the frame content,
// while leaving all subsequent chunks fully streamed.
function injectModulePreloads(
  stream: ReadableStream<Uint8Array>,
  bootstrapSrc: string,
  isFrameRequest: boolean,
  getPreloads: (includeBootstrap: boolean) => Promise<string[]>,
) {
  let reader = stream.getReader();
  let isInitialChunk = true;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        let { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        if (isInitialChunk) {
          isInitialChunk = false;
          let documentHtml = new TextDecoder().decode(value);
          let bootstrap = String(
            html`<script type="module" async src="${bootstrapSrc}"`,
          );
          let insertionIndex = documentHtml.indexOf(bootstrap);

          if (insertionIndex !== -1 || isFrameRequest) {
            let existingPreloads = new Set(
              [
                ...documentHtml.matchAll(
                  /<link rel="modulepreload" href="([^"]+)"/g,
                ),
              ].map((match) => match[1]),
            );
            let preloads = (await getPreloads(insertionIndex !== -1)).filter(
              (href) => !existingPreloads.has(String(html`${href}`)),
            );
            let links = String(
              html`${preloads.map(
                (href) => html`<link rel="modulepreload" href="${href}" />`,
              )}`,
            );
            value = new TextEncoder().encode(
              insertionIndex === -1
                ? `${links}${documentHtml}`
                : `${documentHtml.slice(0, insertionIndex)}${links}${documentHtml.slice(insertionIndex)}`,
            );
          }
        }

        controller.enqueue(value);
      } catch (error) {
        void reader.cancel(error);
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

async function resolveFrame(
  context: RenderMiddlewareContext,
  src: string,
  target?: string,
  frameContext?: ResolveFrameContext,
): Promise<string | ReadableStream<Uint8Array>> {
  let currentFrameSrc = frameContext?.currentFrameSrc ?? context.request.url;
  let topFrameSrc =
    frameContext?.topFrameSrc ?? getTopFrameSrc(context.request);
  let frameUrl = new URL(src, currentFrameSrc);
  let headers = createFrameRequestHeaders(context.headers, target, topFrameSrc);
  let response = await followFrameRedirects(
    context.router,
    context.request,
    frameUrl,
    headers,
  );

  if (response.body != null) return response.body;
  if (response.ok) return "";

  return String(
    html`<pre>Frame error: ${response.status} ${response.statusText}</pre>`,
  );
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
  for (let name of headers.keys()) {
    if (name.startsWith("sec-fetch-")) headers.delete(name);
  }

  headers.set("accept", "text/html");
  headers.set("accept-encoding", "identity");
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

export async function followFrameRedirects(
  router: Router<RequestContext<any, any>>,
  request: Request,
  initialUrl: URL,
  initialHeaders: Headers,
) {
  let url = initialUrl;
  let headers = initialHeaders;
  let requestOrigin = new URL(request.url).origin;

  for (
    let redirectCount = 0;
    redirectCount <= MAX_FRAME_REDIRECTS;
    redirectCount++
  ) {
    if (url.origin !== requestOrigin) {
      headers = createCrossOriginFrameHeaders(headers);
    }

    let response = await router.fetch(
      new Request(url, {
        method: "GET",
        headers,
        signal: request.signal,
      }),
    );
    let location = response.headers.get("location");

    if (location == null || response.status < 300 || response.status >= 400) {
      return response;
    }
    if (redirectCount === MAX_FRAME_REDIRECTS) {
      throw new Error(
        `Too many frame redirects while resolving ${initialUrl.href}`,
      );
    }

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
  assets: Pick<AssetServer, "getHref">,
  entryId: string,
  component: { readonly name: string },
) {
  let hashIndex = entryId.lastIndexOf("#");
  let sourceId = hashIndex === -1 ? entryId : entryId.slice(0, hashIndex);
  let explicitExportName = hashIndex === -1 ? "" : entryId.slice(hashIndex + 1);
  let exportName = explicitExportName || component.name;

  if (!exportName) {
    throw new Error(
      `clientEntry() requires either an export name in the entry ID (e.g., import.meta.url + "#ExportName") or a named component function. Received "${entryId}".`,
    );
  }

  return {
    href: sourceId.startsWith("file:")
      ? await assets.getHref(sourceId)
      : sourceId,
    exportName,
  };
}
