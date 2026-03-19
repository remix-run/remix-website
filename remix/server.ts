import sourceMapSupport from "source-map-support";
import { asyncContext } from "remix/async-context-middleware";
import { compression } from "remix/compression-middleware";
import { createRouter } from "remix/fetch-router";
import { formData } from "remix/form-data-middleware";
import { staticFiles } from "remix/static-middleware";

import { loadScriptEntry } from "./middleware/script-entry.ts";
import { filteredLogger, rateLimit } from "./middleware.ts";
import { createRedirectRoutes, loadRedirectsFromFile } from "./redirects.ts";
import actionsController from "./routes/actions";
import { blogPostHandler } from "./routes/blog-post.tsx";
import { blogRssHandler } from "./routes/blog-rss.ts";
import { blogOgImageHandler } from "./routes/blog-og-image";
import { blogHandler } from "./routes/blog.tsx";
import { brandHandler } from "./routes/brand.tsx";
import { catchallHandler } from "./routes/catchall";
import { homeHandler } from "./routes/home.tsx";
import { jam2025CocHandler } from "./routes/jam-2025-coc.tsx";
import { jam2025FaqHandler } from "./routes/jam-2025-faq.tsx";
import {
  jam2025GalleryDownloadHandler,
  jam2025GalleryHandler,
} from "./routes/jam-2025-gallery.tsx";
import { jam2025LineupHandler } from "./routes/jam-2025-lineup.tsx";
import { jam2025TicketHandler } from "./routes/jam-2025-ticket.tsx";
import { jam2025Handler } from "./routes/jam-2025.tsx";
import { jamHandler } from "./routes/jam.ts";
import { newsletterHandler } from "./routes/newsletter.tsx";
import { routes } from "./routes";
import { scriptServer } from "./utils/script-server.ts";

let isProd = process.env.NODE_ENV === "production";

if (isProd) {
  sourceMapSupport.install();
}

function shouldSkipRateLimit(pathname: string) {
  return (
    pathname === "/healthcheck" ||
    pathname === "/__manifest" ||
    pathname.startsWith("/__manifest/") ||
    pathname.startsWith("/scripts/")
  );
}

let router = createRouter({
  middleware: [
    compression(),
    staticFiles("public", {
      cacheControl: isProd
        ? "public, max-age=3600"
        : "public, max-age=0, must-revalidate",
    }),
    staticFiles("build/static", {
      cacheControl: isProd
        ? "public, max-age=31536000, immutable"
        : "public, max-age=0, must-revalidate",
    }),
    formData(),
    asyncContext(),
    loadScriptEntry(),
    rateLimit({
      windowMs: 2 * 60 * 1000,
      max: 1000,
      skip: (context) => shouldSkipRateLimit(context.url.pathname),
    }),
    filteredLogger(),
  ],
});

let scriptServerHandler = async ({ request }: { request: Request }) => {
  let res = await scriptServer.fetch(request);
  return res ?? new Response("Not Found", { status: 404 });
};

router.map(routes.scriptsRemix, scriptServerHandler);
router.map(routes.scriptsNpm, scriptServerHandler);

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
router.map(routes.newsletter, newsletterHandler);
router.map(routes.jam, jamHandler);
router.map(routes.jam2025, jam2025Handler);
router.map(routes.jam2025Ticket, jam2025TicketHandler);
router.map(routes.jam2025Lineup, jam2025LineupHandler);
router.map(routes.jam2025Faq, jam2025FaqHandler);
router.map(routes.jam2025Coc, jam2025CocHandler);
router.map(routes.jam2025GalleryDownload, jam2025GalleryDownloadHandler);
router.map(routes.jam2025Gallery, jam2025GalleryHandler);
router.map(routes.home, homeHandler);

// Redirects from _redirects (must be before * catchall)
let redirects = loadRedirectsFromFile();
let { redirectRoutes, redirectController } = createRedirectRoutes(redirects);

router.map(redirectRoutes, redirectController);

// All remaining requests are handled by Remix catch-all.
router.map("*", catchallHandler);

export default {
  fetch(request: Request) {
    return router.fetch(request.url, request);
  },
};
