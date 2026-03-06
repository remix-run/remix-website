import { renderToStream } from "remix/component/server";
import type { RemixNode } from "remix/component/jsx-runtime";
import { createHtmlResponse } from "remix/response/html";
import { APP_FRAME_HEADER, APP_FRAME_NAME } from "../shared/app-navigation";
import { getRequestContext } from "./request-context";

export let render = {
  frame(node: RemixNode, init?: ResponseInit) {
    let headers = new Headers(init?.headers);
    appendVary(headers, APP_FRAME_HEADER);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/html; charset=utf-8");
    }
    return new Response(renderToStream(node), { ...init, headers });
  },

  document(node: RemixNode, init?: ResponseInit) {
    let { request, router } = getRequestContext();
    let stream = renderToStream(node, {
      resolveFrame: (src) => resolveFrame(src, router, request),
      onError(error) {
        console.error(error);
      },
    });
    let headers = new Headers(init?.headers);
    appendVary(headers, APP_FRAME_HEADER);
    return createHtmlResponse(stream, { ...init, headers });
  },
};

export function isAppFrameRequest(request: Request) {
  return request.headers.get(APP_FRAME_HEADER) === APP_FRAME_NAME;
}

function appendVary(headers: Headers, name: string) {
  let vary = headers.get("Vary");
  if (!vary) {
    headers.set("Vary", name);
    return;
  }

  let names = vary
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!names.includes(name.toLowerCase())) {
    headers.set("Vary", `${vary}, ${name}`);
  }
}

async function resolveFrame(
  src: string,
  router: ReturnType<typeof getRequestContext>["router"],
  request: Request,
) {
  let url = new URL(src, request.url);

  let headers = new Headers();
  headers.set("accept", "text/html");
  headers.set("accept-encoding", "identity");
  headers.set(APP_FRAME_HEADER, APP_FRAME_NAME);
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
