// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";
import { createRequestHandler } from "react-router";
import { createRouter } from "remix/fetch-router";
import { route } from "remix/fetch-router/routes";
import { compression } from "remix/compression-middleware";
import { staticFiles } from "remix/static-middleware";
import { rateLimit, filteredLogger } from "./middleware.ts";
import blogRssHandler from "./routes/blog-rss.ts";
import { createRedirectRoutes, loadRedirectsFromFile } from "./redirects.ts";
import sourceMapSupport from "source-map-support";

if (import.meta.env.PROD) {
  sourceMapSupport.install();
}

// const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 3000);
if (!Number.isFinite(port) || port <= 0) {
  throw new Error(
    `Invalid PORT value "${process.env.PORT ?? ""}". Expected a positive number.`,
  );
}

const handleRequest = createRequestHandler(build, process.env.NODE_ENV);

function shouldSkipRateLimit(pathname: string) {
  return (
    pathname === "/healthcheck" ||
    pathname === "/__manifest" ||
    pathname.startsWith("/__manifest/")
  );
}

const router = createRouter({
  middleware: [
    compression(),
    // In dev, Vite serves static files via its own middleware.
    // In production, serve static files with appropriate caching.
    ...(import.meta.env.DEV
      ? []
      : [
          // Vite fingerprints its assets so we can cache forever.
          staticFiles("build/client/assets", {
            cacheControl: "public, max-age=31536000, immutable",
          }),
          // Everything else (like favicon.ico) is cached for an hour.
          staticFiles("build/client", {
            cacheControl: "public, max-age=3600",
          }),
        ]),
    rateLimit({
      windowMs: 2 * 60 * 1000,
      max: 1000,
      skip: (context) => shouldSkipRateLimit(context.url.pathname),
    }),
    filteredLogger(),
  ],
});

// ---------------------------------------------------------------------------
// Remix 3 routes (remix/component) — explicit patterns win over the catch-all
// ---------------------------------------------------------------------------
const remixRoutes = route({
  healthcheck: "/healthcheck",
  blogRss: "/blog/rss.xml",
});

// Keep healthcheck on a stable path during migration so deploy checks never
// depend on the in-progress Remix route asset strategy.
router.map(remixRoutes.healthcheck, () => {
  return new Response("OK", {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
});

router.map(remixRoutes.blogRss, blogRssHandler);

// if (import.meta.env.DEV) {
const devRemixRoutes = route({
  remixTest: "/remix-test",
});

router.map(devRemixRoutes, {
  async remixTest() {
    const mod = await import("../app/remix/test-route.tsx");
    return mod.default();
  },
});
// }

// Redirects from _redirects (must be before * catchall)
const redirects = loadRedirectsFromFile();
const { redirectRoutes, redirectController } = createRedirectRoutes(redirects);

router.map(redirectRoutes, redirectController);

// All remaining requests are handled by React Router
router.map("*", (context) => handleRequest(context.request));

export default {
  fetch(request: Request) {
    return router.fetch(request.url, request);
  },
};
