import { renderToStream } from "remix/component/server";
import type { RemixNode } from "remix/component/jsx-runtime";

export function render(node: RemixNode, init?: ResponseInit) {
  const stream = renderToStream(node, {
    onError(error) {
      console.error(error);
    },
  });

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "text/html; charset=utf-8");
  }

  return new Response(stream, { ...init, headers });
}
