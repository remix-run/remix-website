import { staticFiles } from "remix/middleware/static";
import type { Middleware } from "remix/router";

import { CACHE } from "../utils/cache-control.ts";

/**
 * Serves stable URLs from root `public/` and labels only those responses for
 * targeted Fastly purges. Browser modules live under `/assets/` and are served
 * by the separate asset server, so they never receive this purge tag.
 */
export function rootPublicFiles(): Middleware {
  const serveStaticFiles = staticFiles("public", {
    cacheControl: CACHE.ROOT_PUBLIC_FILE,
    index: false,
  });

  return async (context, next) => {
    let fellThrough = false;
    const response = await serveStaticFiles(context, () => {
      fellThrough = true;
      return next();
    });

    if (!fellThrough && response) {
      response.headers.set("Surrogate-Key", CACHE.STATIC_ASSET_TAG);
    }

    return response;
  };
}
