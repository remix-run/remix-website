import { renderToStream } from "remix/component/server";
import type { RemixNode } from "remix/component/jsx-runtime";
import { createHtmlResponse } from "remix/response/html";

export const render = {
  frame(node: RemixNode, init?: ResponseInit) {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/html; charset=utf-8");
    }
    return new Response(renderToStream(node), { ...init, headers });
  },

  document(node: RemixNode, init?: ResponseInit, request?: Request) {
    const stream = renderToStream(node, {
      resolveFrame: request ? (src) => resolveFrame(src, request) : undefined,
      onError(error) {
        console.error(error);
      },
    });
    return createHtmlResponse(stream, init);
  },
};

async function resolveFrame(src: string, request: Request) {
  const url = new URL(src, request.url);

  const headers = new Headers();
  headers.set("accept", "text/html");
  headers.set("accept-encoding", "identity");
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: request.signal,
    });
    if (!response.ok) {
      return `<pre>Frame error: ${response.status} ${response.statusText}</pre>`;
    }
    if (response.body) return response.body;
    return response.text();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return `<pre>Frame error: ${message}</pre>`;
  }
}
