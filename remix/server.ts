// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";
import { createRequestHandler } from "react-router";
import { createRouter } from "remix/fetch-router";
import { compression } from "remix/compression-middleware";
import { formData } from "remix/form-data-middleware";
import { staticFiles } from "remix/static-middleware";
import { rateLimit, filteredLogger } from "./middleware.ts";
import blogRssHandler from "./routes/blog-rss.ts";
import homeRoute from "./routes/home.tsx";
import { createRedirectRoutes, loadRedirectsFromFile } from "./redirects.ts";
import sourceMapSupport from "source-map-support";
import { routes } from "./routes";
import actionsController from "./routes/actions";

if (import.meta.env.PROD) {
  sourceMapSupport.install();
}

const handleRequest = createRequestHandler(build, process.env.NODE_ENV);
const isDev = import.meta.env.DEV;

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
    ...(isDev
      ? []
      : [
          staticFiles("build/client/assets", {
            cacheControl: "public, max-age=31536000, immutable",
          }),
          staticFiles("build/client", {
            cacheControl: "public, max-age=3600",
          }),
        ]),
    formData(),
    rateLimit({
      windowMs: 2 * 60 * 1000,
      max: 1000,
      skip: (context) => shouldSkipRateLimit(context.url.pathname),
    }),
    filteredLogger(),
  ],
});

// Keep healthcheck on a stable path during migration so deploy checks never
// depend on the in-progress Remix route asset strategy.
router.map(routes.healthcheck, () => {
  return new Response("OK", {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
});

router.map(routes.blogRss, blogRssHandler);
router.map(routes.actions, actionsController);
router.map(routes.home, homeRoute);

if (isDev) {
  router.map(routes.dev, {
    async remixTest() {
      const mod = await import("./routes/test-route.tsx");
      return mod.default();
    },
  });
}

// Redirects from _redirects (must be before * catchall)
const redirects = loadRedirectsFromFile();
const { redirectRoutes, redirectController } = createRedirectRoutes(redirects);

router.map(redirectRoutes, redirectController);

// All remaining requests are handled by React Router
router.map("*", (context) => handleRequest(context.request));

// vite fullstack plugin
export default {
  fetch(request: Request) {
    return router.fetch(request.url, request);
  },
};
