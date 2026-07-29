import { asyncContext } from "remix/middleware/async-context";
import { compression } from "remix/middleware/compression";
import { cop } from "remix/middleware/cop";
import { createRouter, type Middleware } from "remix/router";
import { formData } from "remix/middleware/form-data";
import { logger } from "remix/middleware/logger";
import { staticFiles } from "remix/middleware/static";

import { rateLimit } from "./middleware/rate-limit.ts";
import { loadAssetEntry } from "./middleware/asset-entry.ts";
import { renderMiddleware, type AppContext } from "./middleware/render.ts";
import { createRedirectRoutes, loadRedirectsFromFile } from "./redirects.ts";
import { routes } from "./routes.ts";

import rootController from "./actions/controller.tsx";
import apiController from "./actions/api/controller.tsx";
import blogController from "./actions/blog/controller.tsx";
import { catchallHandler } from "./actions/catchall.tsx";
import jamController from "./actions/jam/controller.ts";
import jam2025Controller from "./actions/jam/y2025/controller.tsx";
import jam2025GalleryController from "./actions/jam/y2025/gallery/controller.tsx";
import jam2025TicketController from "./actions/jam/y2025/ticket/controller.tsx";
import jam2026Controller from "./actions/jam/y2026/controller.tsx";
import jam2026TicketController from "./actions/jam/y2026/ticket/controller.tsx";
import remix3ActiveDevelopmentController from "./actions/remix3-active-development/controller.tsx";

let isDev = process.env.NODE_ENV !== "production";
let isTest = process.env.NODE_ENV === "test";
let shouldBypassLoopbackRateLimit = isDev;

function shouldSkipRateLimit(pathname: string) {
  return (
    pathname === "/healthcheck" ||
    pathname === "/assets" ||
    pathname.startsWith("/assets/")
  );
}

function createAppRouter() {
  let middleware = [];

  middleware.push(compression());

  if (isDev) {
    let ignoreChromeDevToolsRequest: Middleware = (context, next) => {
      if (
        context.request.method === "GET" &&
        context.url.pathname ===
          "/.well-known/appspecific/com.chrome.devtools.json"
      ) {
        return new Response(null, { status: 204 });
      }
      return next();
    };

    middleware.push(ignoreChromeDevToolsRequest);
  }

  middleware.push(
    staticFiles("public", {
      cacheControl: isDev
        ? "no-store, must-revalidate"
        : "public, max-age=3600",
    }),
  );

  middleware.push(cop());
  middleware.push(formData());
  middleware.push(asyncContext());
  middleware.push(loadAssetEntry());
  middleware.push(renderMiddleware);
  middleware.push(
    rateLimit({
      windowMs: 2 * 60 * 1000,
      max: 1000,
      skipLocalhost: shouldBypassLoopbackRateLimit,
      skip: (context) => shouldSkipRateLimit(context.url.pathname),
    }),
  );
  if (!isTest) {
    middleware.push(logger());
  }

  let router = createRouter<AppContext>({ middleware });

  router.map(routes, rootController);
  router.map(routes.api, apiController);
  router.map(routes.blog, blogController);
  router.map(routes.remix3ActiveDevelopment, remix3ActiveDevelopmentController);
  router.map(routes.jam, jamController);
  router.map(routes.jam.y2025, jam2025Controller);
  router.map(routes.jam.y2025.gallery, jam2025GalleryController);
  router.map(routes.jam.y2025.ticket, jam2025TicketController);
  router.map(routes.jam.y2026, jam2026Controller);
  router.map(routes.jam.y2026.ticket, jam2026TicketController);

  // Redirects from _redirects (must be before * catchall)
  let redirects = loadRedirectsFromFile();
  let { redirectRoutes, redirectController } = createRedirectRoutes(redirects);

  router.map(redirectRoutes, redirectController);

  // All remaining requests are handled by Remix catch-all.
  router.map("*", catchallHandler);

  return router;
}

export let router = createAppRouter();
