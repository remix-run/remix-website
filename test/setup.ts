import type { Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import type { Router } from "remix/router";
import { createRouter } from "remix/router";
import { expect } from "remix/assert";

import { requestContextMiddleware } from "../app/middleware/request-context.ts";
import { CACHE } from "../app/utils/cache-control.ts";

export function expectPrefetchableDocument(response: Response) {
  for (let [name, value] of Object.entries(CACHE.PREFETCHABLE_DOCUMENT)) {
    expect(response.headers.get(name)).toBe(value);
  }
}

export function globalSetup() {
  loadEnvFileIfExists(".env");
  loadEnvFileIfExists(".env.test");
}

/**
 * A router with the app's request-context middleware but without its edge
 * middleware (compression, rate limiting, security headers), for testing
 * controllers in isolation.
 */
export function createRouteTestRouter() {
  return createRouter({ middleware: requestContextMiddleware() });
}

// Both helpers rely on the Remix runtime tagging each hydrated client entry's
// boundary comment with a private `$rmx` property. Keep that detail here.

/** Waits until the client entry rendered at `selector` has hydrated. */
export async function waitForClientEntryHydration(
  page: Page,
  selector: string,
) {
  await page.waitForFunction((targetSelector) => {
    let target = document.querySelector(targetSelector);
    let marker = target?.previousSibling;
    return marker instanceof Comment && "$rmx" in marker;
  }, selector);
}

/** Waits until the Remix runtime has hydrated any client entry on the page. */
export async function waitForRuntime(page: Page) {
  await page.waitForFunction(() => {
    let walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
    while (walker.nextNode()) {
      if ("$rmx" in walker.currentNode) return true;
    }
    return false;
  });
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
