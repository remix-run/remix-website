import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { asyncContext } from "remix/middleware/async-context";
import { formData } from "remix/middleware/form-data";
import type { Router } from "remix/router";
import { createRouter } from "remix/router";

import { getBlogPostListings } from "../app/data/blog.ts";
import { loadAssetEntry } from "../app/middleware/asset-entry.ts";
import { renderMiddleware, type AppContext } from "../app/middleware/render.ts";

export function globalSetup() {
  loadEnvFileIfExists(".env");
  loadEnvFileIfExists(".env.test");
}

export function createRouteTestRouter(): Router<AppContext> {
  let router = createRouter<AppContext>({
    middleware: [
      formData(),
      asyncContext(),
      loadAssetEntry(),
      renderMiddleware,
    ],
  });

  return router;
}

/**
 * Renders every blog post's markdown into the server's post cache.
 *
 * The blog index renders each post through Shiki on the first request, which
 * takes ~1s locally and several seconds on CI. Client navigation updates the
 * URL before that render resolves, so asserting on the listing right after the
 * URL change otherwise races the cold render instead of the navigation.
 */
export async function warmBlogPostListings() {
  await getBlogPostListings();
}

export function swallowAbortErrors(r: Router) {
  return async (request: Request) => {
    try {
      return await r.fetch(request);
    } catch (e) {
      if (
        e instanceof DOMException &&
        e.name === "AbortError" &&
        e.message === "This operation was aborted"
      ) {
        // Don't log expected abort errors
        return new Response(null, { status: 499 });
      }
      throw e;
    }
  };
}

function loadEnvFileIfExists(path: string) {
  if (existsSync(path)) loadEnvFile(path);
}
