import { asyncContext } from "remix/middleware/async-context";
import { compression } from "remix/middleware/compression";
import { cop } from "remix/middleware/cop";
import {
  createMiddleware,
  createRouter,
  type Middleware,
  type MiddlewareContext,
} from "remix/router";
import { formData } from "remix/middleware/form-data";
import { logger } from "remix/middleware/logger";
import { staticFiles } from "remix/middleware/static";

import { rateLimit } from "./middleware/rate-limit.ts";
import { loadAssetEntry } from "./middleware/asset-entry.ts";
import { renderMiddleware } from "./middleware/render.ts";
import { securityHeaders } from "./middleware/security-headers.ts";
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
import { createNewsletterController } from "./actions/newsletter/controller.tsx";
import {
  getLiveNewsletterRepository,
  type NewsletterRepository,
} from "./data/newsletters.ts";
import remixHistoryController from "./actions/remix-history/controller.tsx";

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

let ignoreChromeDevToolsRequest: Middleware = (context, next) => {
  if (
    isDev &&
    context.request.method === "GET" &&
    context.url.pathname === "/.well-known/appspecific/com.chrome.devtools.json"
  ) {
    return new Response(null, { status: 204 });
  }
  return next();
};

function createAppMiddleware() {
  return createMiddleware(
    securityHeaders(),
    compression(),
    ignoreChromeDevToolsRequest,
    staticFiles("public", {
      cacheControl: isDev
        ? "no-store, must-revalidate"
        : "public, max-age=3600",
      index: false,
    }),
    cop(),
    rateLimit({
      windowMs: 2 * 60 * 1000,
      max: 1000,
      skipLocalhost: shouldBypassLoopbackRateLimit,
      skip: (context) => shouldSkipRateLimit(context.url.pathname),
    }),
    formData(),
    asyncContext(),
    loadAssetEntry(),
    renderMiddleware,
    isTest ? logger({ log() {} }) : logger(),
  );
}

export type AppContext = MiddlewareContext<
  ReturnType<typeof createAppMiddleware>
>;

declare module "remix/router" {
  interface RouterTypes {
    context: AppContext;
  }
}

export function createAppRouter(
  options: {
    newsletterRepository?: NewsletterRepository;
  } = {},
) {
  let appRouter = createRouter({
    middleware: createAppMiddleware(),
    defaultHandler: catchallHandler,
  });

  appRouter.map(routes, rootController);
  appRouter.map(routes.api, apiController);
  appRouter.map(routes.blog, blogController);
  appRouter.map(routes.remixHistory, remixHistoryController);
  appRouter.map(routes.jam, jamController);
  appRouter.map(routes.jam.y2025, jam2025Controller);
  appRouter.map(routes.jam.y2025.gallery, jam2025GalleryController);
  appRouter.map(routes.jam.y2025.ticket, jam2025TicketController);
  appRouter.map(routes.jam.y2026, jam2026Controller);
  appRouter.map(routes.jam.y2026.ticket, jam2026TicketController);
  appRouter.map(
    routes.newsletter,
    createNewsletterController(
      options.newsletterRepository ?? getLiveNewsletterRepository(),
    ),
  );

  let redirects = loadRedirectsFromFile();
  let { redirectRoutes, redirectController } = createRedirectRoutes(redirects);
  appRouter.map(redirectRoutes, redirectController);

  return appRouter;
}

export let router = createAppRouter();
