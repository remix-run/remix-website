import { redirect } from "react-router";
import redirectsFileContents from "../../_redirects?raw";

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

// relative to where we're built, build/index.js
type Redirect = [string, string, number?];
let redirects: null | Redirect[] = null;

// TODO: add support with pathToRegexp to redirect with * and stuff
export function handleRedirects(pathname: string) {
  if (redirects === null) {
    redirects = [];

    for (let line of redirectsFileContents.split("\n")) {
      line = line.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }
      let [from, to, maybeCode] = line.split(/\s+/);
      redirects.push([from, to, getValidRedirectCode(maybeCode)]);
    }
  }

  let foundRedirect = redirects.find(([from]) => pathname === from);
  if (foundRedirect) {
    throw redirect(foundRedirect[1], { status: foundRedirect[2] });
  }

  return null;
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

function getValidRedirectCode(code: string | number | undefined) {
  let defaultCode = 302;
  if (!code) return defaultCode;
  if (typeof code === "string") {
    try {
      code = parseInt(code.trim(), 10);
    } catch {
      return defaultCode;
    }
  }
  if (!Number.isInteger(code) || code < 300 || code >= 400) {
    return defaultCode;
  }
  return code;
}
