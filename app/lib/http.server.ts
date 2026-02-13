import { redirect } from "react-router";

// Re-export from the standalone module so existing consumers aren't affected.
// Remix 3 routes should import directly from ~/lib/cache-control to avoid
// pulling in react-router (and its global JSX types) transitively.
export { CACHE_CONTROL } from "./cache-control";

export function requirePost(request: Request) {
  if (request.method.toLowerCase() !== "post") {
    throw new Response("", {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }
}

export function removeTrailingSlashes(request: Request) {
  let url = new URL(request.url);
  if (url.pathname.endsWith("/") && url.pathname !== "/") {
    url.pathname = url.pathname.slice(0, -1);
    throw redirect(url.toString());
  }
}

export function isProductionHost(request: Request) {
  return "remix.run" === request.headers.get("host");
}
