import { compression } from "remix/middleware/compression";
import { cop } from "remix/middleware/cop";
import { createRouter, type RequestContext } from "remix/router";
import { formData } from "remix/middleware/form-data";
import { logger } from "remix/middleware/logger";
import { staticFiles } from "remix/middleware/static";

import { rateLimit } from "./middleware/rate-limit.ts";
import { loadAssetEntry } from "./middleware/asset-entry.ts";
import { renderMiddleware, type AppContext } from "./middleware/render.ts";
import { createRedirectRoutes, loadRedirectsFromFile } from "./redirects.ts";
import { routes } from "./routes.ts";
import { assetServer } from "./utils/assets.server.ts";

import actionsController from "./controllers/actions/controller.tsx";
import { blogHandler } from "./controllers/blog/controller.tsx";
import { blogOgImageHandler } from "./controllers/blog-og-image.tsx";
import { blogPostHandler } from "./controllers/blog/post.tsx";
import { blogRssHandler } from "./controllers/blog/rss.ts";
import { brandHandler } from "./controllers/brand.tsx";
import { catchallHandler } from "./controllers/catchall.tsx";
import { remix3ActiveDevelopmentHandler } from "./controllers/remix3-active-development/controller.tsx";
import { homeHandler } from "./controllers/home/controller.tsx";
import {
  jam2025Controller,
  jam2025GalleryController,
  jam2025TicketController,
  jam2026Controller,
  jam2026TicketController,
  jamRedirectHandler,
} from "./controllers/jam/controller.ts";
import { newsletterHandler } from "./controllers/newsletter.tsx";

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
    middleware.push((context: RequestContext) => {
      if (
        context.request.method === "GET" &&
        context.url.pathname ===
          "/.well-known/appspecific/com.chrome.devtools.json"
      ) {
        return new Response(null, { status: 204 });
      }
    });
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

  router.map(routes.assets, async ({ request }) => {
    return (
      (await assetServer.fetch(request)) ??
      new Response("Not found", { status: 404 })
    );
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
  router.map(routes.blogOgImage, blogOgImageHandler);
  router.map(routes.blogPost, blogPostHandler);
  router.map(routes.blog, blogHandler);
  router.map(routes.actions, actionsController);
  router.map(routes.brand, brandHandler);
  router.map(routes.home, homeHandler);
  router.map(routes.newsletter, newsletterHandler);
  router.map(routes.jam.index, jamRedirectHandler);
  router.map(routes.jam.y2025.gallery, jam2025GalleryController);
  router.map(routes.jam.y2025.ticket, jam2025TicketController);
  router.map(routes.jam.y2025, jam2025Controller);
  router.map(routes.jam.y2026.ticket, jam2026TicketController);
  router.map(routes.jam.y2026, jam2026Controller);
  router.map(routes.remix3ActiveDevelopment, remix3ActiveDevelopmentHandler);

  // Redirects from _redirects (must be before * catchall)
  let redirects = loadRedirectsFromFile();
  let { redirectRoutes, redirectController } = createRedirectRoutes(redirects);

  router.map(redirectRoutes, redirectController);

  // All remaining requests are handled by Remix catch-all.
  router.map("*", catchallHandler);

  return router;
}

export let router = createAppRouter();
