import { renderToStream } from "remix/component/server";
import type { RemixNode } from "remix/component/jsx-runtime";
import { createHtmlResponse } from "remix/response/html";
import { getRequestContext } from "./request-context";

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
  router: ReturnType<typeof getRequestContext>["router"],
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
    let response = await router.fetch(
      new Request(url, {
        method: "GET",
        headers,
        signal: request.signal,
      }),
    );
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

function getTopFrameSrc(request: Request) {
  return request.headers.get("x-remix-top-frame-src") ?? request.url;
}
