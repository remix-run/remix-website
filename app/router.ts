import { asyncContext } from "remix/async-context-middleware";
import { compression } from "remix/compression-middleware";
import { createRouter, type RequestContext } from "remix/fetch-router";
import { formData } from "remix/form-data-middleware";
import { logger } from "remix/logger-middleware";
import { staticFiles } from "remix/static-middleware";

import { rateLimit } from "./middleware/rate-limit.ts";
import { loadAssetEntry } from "./middleware/asset-entry.ts";
import { createRedirectRoutes, loadRedirectsFromFile } from "./redirects.ts";
import { routes } from "./routes.ts";
import { assetServer } from "./utils/assets.server.ts";

import actionsController from "./controllers/actions/controller.tsx";
import { blogHandler } from "./controllers/blog/controller.tsx";
import { blogOgImageHandler } from "./controllers/blog-og-image.tsx";
import { blogPostHandler } from "./controllers/blog/post.tsx";
import { blogRssHandler } from "./controllers/blog/rss.ts";
import { brandHandler } from "./controllers/brand.tsx";
import { catchallHandler } from "./controllers/catchall.ts";
import { remix3ActiveDevelopmentHandler } from "./controllers/remix3-active-development/controller.tsx";
import { homeHandler } from "./controllers/home.tsx";
import { jam2025CocHandler } from "./controllers/jam/2025-coc.tsx";
import { jam2025FaqHandler } from "./controllers/jam/2025-faq.tsx";
import { jam2025GalleryHandler } from "./controllers/jam/2025-gallery/controller.tsx";
import { jam2025GalleryDownloadHandler } from "./controllers/jam/2025-gallery/download.ts";
import { jam2025LineupHandler } from "./controllers/jam/2025-lineup.tsx";
import { jam2025TicketHandler } from "./controllers/jam/2025-ticket.tsx";
import { jam2025Handler } from "./controllers/jam/2025.tsx";
import { jamHandler } from "./controllers/jam/controller.ts";
import { newsletterHandler } from "./controllers/newsletter.tsx";

let isDev = process.env.NODE_ENV !== "production";
let shouldBypassLoopbackRateLimit =
  isDev || process.env.PLAYWRIGHT_TEST === "1";

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

  if (!isDev) {
    middleware.push(
      staticFiles("public", {
        cacheControl: "public, max-age=3600",
      }),
    );
  } else {
    middleware.push(
      staticFiles("public", {
        cacheControl: "no-store, must-revalidate",
      }),
    );
  }

  middleware.push(formData());
  middleware.push(asyncContext());
  middleware.push(loadAssetEntry());
  middleware.push(
    rateLimit({
      windowMs: 2 * 60 * 1000,
      max: 1000,
      skipLocalhost: shouldBypassLoopbackRateLimit,
      skip: (context) => shouldSkipRateLimit(context.url.pathname),
    }),
  );
  middleware.push(logger());

  let router = createRouter({ middleware });

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
  router.map(routes.jam.index, jamHandler);
  router.map(routes.jam.y2025.index, jam2025Handler);
  router.map(routes.jam.y2025.ticket, jam2025TicketHandler);
  router.map(routes.jam.y2025.lineup, jam2025LineupHandler);
  router.map(routes.jam.y2025.faq, jam2025FaqHandler);
  router.map(routes.jam.y2025.coc, jam2025CocHandler);
  router.map(routes.jam.y2025.gallery.download, jam2025GalleryDownloadHandler);
  router.map(routes.jam.y2025.gallery.index, jam2025GalleryHandler);
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
