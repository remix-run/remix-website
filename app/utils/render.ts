import type { Router } from "remix/fetch-router";
import { renderToStream } from "remix/ui/server";
import type { RemixNode } from "remix/ui";
import { createHtmlResponse } from "remix/response/html";
import { getRequestContext } from "./request-context.ts";
import { assetServer } from "./assets.server.ts";

type FrameRenderContext = {
  currentFrameSrc?: string;
  topFrameSrc?: string;
};

export let render = {
  frame(node: RemixNode, init?: ResponseInit) {
    let { request } = getRequestContext();
    let headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/html; charset=utf-8");
    }
    return new Response(
      renderToStream(node, {
        frameSrc: request.url,
        topFrameSrc: getTopFrameSrc(request),
        onError(error) {
          console.error(error);
        },
      }),
      { ...init, headers },
    );
  },

  document(node: RemixNode, init?: ResponseInit) {
    let { request, router } = getRequestContext();
    let stream = renderToStream(node, {
      frameSrc: request.url,
      topFrameSrc: getTopFrameSrc(request),
      resolveFrame: (src, target, context) =>
        resolveFrame(src, target, context, router, request),
      resolveClientEntry: (entryId, component) =>
        resolveClientEntry(entryId, component.name),
      onError(error) {
        console.error(error);
      },
    });
    return createHtmlResponse(stream, init);
  },
};

async function resolveFrame(
  src: string,
  target: string | undefined,
  context: FrameRenderContext | undefined,
  router: Router,
  request: Request,
) {
  let frameSrc = context?.currentFrameSrc ?? request.url;
  let topFrameSrc = context?.topFrameSrc ?? getTopFrameSrc(request);
  let url = new URL(src, frameSrc);

  let headers = new Headers();
  headers.set("accept", "text/html");
  headers.set("accept-encoding", "identity");
  headers.set("x-remix-frame", "true");
  headers.set("x-remix-top-frame-src", topFrameSrc);
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
  router: Router,
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

function getTopFrameSrc(request: Request) {
  return request.headers.get("x-remix-top-frame-src") ?? request.url;
}
