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

export let renderMiddleware = renderWith((context) =>
  createAppRenderer(context as RenderMiddlewareContext),
);

function createAppRenderer(context: RenderMiddlewareContext): AppRenderer {
  let rootNode = (node: RemixNode) =>
    createElement(AssetEntryProvider, { value: context.assetEntry }, node);

  function renderFrame(node: RemixNode, init?: ResponseInit) {
    let headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/html; charset=utf-8");
    }

    return new Response(
      renderToStream(rootNode(node), {
        frameSrc: context.request.url,
        signal: context.request.signal,
        resolveClientEntry: (entryId, component) =>
          resolveClientEntry(entryId, component.name),
        onError(error) {
          console.error(error);
        },
      }),
      { ...init, headers },
    );
  }

  function renderDocument(node: RemixNode, init?: ResponseInit) {
    let stream = renderToStream(rootNode(node), {
      frameSrc: context.request.url,
      signal: context.request.signal,
      resolveFrame: (src, target, frameContext) =>
        resolveFrame(
          src,
          target,
          frameContext,
          context.router,
          context.request,
        ),
      resolveClientEntry: (entryId, component) =>
        resolveClientEntry(entryId, component.name),
      onError(error) {
        console.error(error);
      },
    });

    return createHtmlResponse(stream, init);
  }

  return function render(node: RemixNode, init?: ResponseInit) {
    return context.request.headers.has("x-remix-target")
      ? renderFrame(node, init)
      : renderDocument(node, init);
  };
}

async function resolveFrame(
  src: string,
  target: string | undefined,
  context: ResolveFrameContext | undefined,
  router: Router<RequestContext<any, any>>,
  request: Request,
) {
  let frameSrc = context?.currentFrameSrc ?? request.url;
  let url = new URL(src, frameSrc);

  let headers = new Headers();
  headers.set("accept", "text/html");
  headers.set("accept-encoding", "identity");
  headers.set("x-remix-frame", "true");
  headers.set("x-remix-ssr-frame", "true");
  if (target) headers.set("x-remix-target", target);
  let cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  try {
    let response = await followFrameRedirects(router, request, url, headers);
    if (!response.ok) {
      return `<pre>Frame error: ${response.status} ${response.statusText}</pre>`;
    }
    if (response.body) return response.body;
    return response.text();
  } catch (error: unknown) {
    let message = error instanceof Error ? error.message : "Unknown error";
    return `<pre>Frame error: ${message}</pre>`;
  }
}

export async function followFrameRedirects(
  router: Router<RequestContext<any, any>>,
  request: Request,
  url: URL,
  headers: Headers,
) {
  let currentUrl = url;
  let redirectsRemaining = 10;

  while (true) {
    let response = await router.fetch(
      new Request(currentUrl, {
        method: "GET",
        headers,
        signal: request.signal,
      }),
    );

    let location = response.headers.get("location");
    if (!location || response.status < 300 || response.status >= 400) {
      return response;
    }

    if (redirectsRemaining-- <= 0) {
      throw new Error("Too many frame redirects");
    }

    currentUrl = new URL(location, currentUrl);
  }
}

async function resolveClientEntry(entryId: string, componentName?: string) {
  let entryUrl = new URL(entryId);
  let exportName = entryUrl.hash.slice(1) || componentName;
  entryUrl.hash = "";

  if (!exportName) {
    throw new Error(
      `Unable to resolve export name for client entry "${entryId}"`,
    );
  }

  return {
    href: await assetServer.getHref(entryUrl.toString()),
    exportName,
  };
}
