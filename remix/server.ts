import sourceMapSupport from "source-map-support";
import { createRequestHandler } from "react-router";
import { asyncContext } from "remix/async-context-middleware";
import { compression } from "remix/compression-middleware";
import { createRouter } from "remix/fetch-router";
import { formData } from "remix/form-data-middleware";
import { staticFiles } from "remix/static-middleware";

// @ts-expect-error - react-router server build is not typed
import * as build from "virtual:react-router/server-build";

import { filteredLogger, rateLimit } from "./middleware.ts";
import { createRedirectRoutes, loadRedirectsFromFile } from "./redirects.ts";
import actionsController from "./routes/actions";
import blogPostRoute from "./routes/blog-post.tsx";
import blogRssHandler from "./routes/blog-rss.ts";
import blogRoute from "./routes/blog.tsx";
import brandRoute from "./routes/brand.tsx";
import homeRoute from "./routes/home.tsx";
import newsletterRoute from "./routes/newsletter.tsx";
import { routes } from "./routes";
import { ROUTER_STORAGE_KEY } from "./utils/request-context";

if (import.meta.env.PROD) {
  sourceMapSupport.install();
}

let handleRequest = createRequestHandler(build, process.env.NODE_ENV);
let isDev = import.meta.env.DEV;

function shouldSkipRateLimit(pathname: string) {
  return (
    pathname === "/healthcheck" ||
    pathname === "/__manifest" ||
    pathname.startsWith("/__manifest/")
  );
}

let router = createRouter({
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
    asyncContext(),
    (context, next) => {
      context.storage.set(ROUTER_STORAGE_KEY, router);
      return next();
    },
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
router.map(routes.blogPost, blogPostRoute);
router.map(routes.blog, blogRoute);
router.map(routes.actions, actionsController);
router.map(routes.brand, brandRoute);
router.map(routes.newsletter, newsletterRoute);
router.map(routes.home, homeRoute);

// Redirects from _redirects (must be before * catchall)
let redirects = loadRedirectsFromFile();
let { redirectRoutes, redirectController } = createRedirectRoutes(redirects);

router.map(redirectRoutes, redirectController);

// All remaining requests are handled by React Router
router.map("*", (context) => handleRequest(context.request));

// vite fullstack plugin
export default {
  fetch(request: Request) {
    return router.fetch(request.url, request);
  },
};
