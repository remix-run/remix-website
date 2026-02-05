import * as http from "node:http";
import {
  createRequestListener,
  createRequest,
  sendResponse,
} from "remix/node-fetch-server";
import { createRequestHandler } from "react-router";
import { createRouter, type Middleware } from "remix/fetch-router";
import { compression } from "remix/compression-middleware";
import { logger } from "remix/logger-middleware";
import { staticFiles } from "remix/static-middleware";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:react-router/server-build")
  : await import("./build/server/index.js");

// @ts-expect-error - Vite's ssrLoadModule returns Record<string, any>, not ServerBuild
const handleRequest = createRequestHandler(build, process.env.NODE_ENV);

// Simple rate limiter middleware (replaces express-rate-limit)
// 1000 requests per 2 minutes per IP
interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

function rateLimit({
  windowMs = 2 * 60 * 1000,
  max = 1000,
}: RateLimitOptions = {}): Middleware {
  const hits = new Map<string, RateLimitEntry>();

  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits) {
      if (now > data.resetTime) {
        hits.delete(key);
      }
    }
  }, windowMs).unref();

  return (context, next) => {
    const ip =
      context.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const now = Date.now();

    let data = hits.get(ip);
    if (!data || now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMs };
      hits.set(ip, data);
    }

    data.count++;

    if (data.count > max) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((data.resetTime - now) / 1000)),
        },
      });
    }

    return next();
  };
}

// Logger middleware that skips GET requests to /__manifest
const logMiddleware = logger();
function filteredLogger(): Middleware {
  return (context, next) => {
    if (
      context.request.method === "GET" &&
      context.url.pathname.startsWith("/__manifest")
    ) {
      return next();
    }
    return logMiddleware(context, next);
  };
}

const router = createRouter({
  middleware: [
    rateLimit({ windowMs: 2 * 60 * 1000, max: 1000 }),
    compression(),
    // In dev, Vite serves static files via its own middleware.
    // In production, serve static files with appropriate caching.
    ...(viteDevServer
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
    filteredLogger(),
  ],
});

// All requests are handled by React Router
router.map("*", (context) => handleRequest(context.request));

const port = process.env.PORT || 3000;

if (viteDevServer) {
  // In development, Vite's connect middleware handles HMR, module
  // serving, and static files. If Vite doesn't handle the request,
  // we fall through to our fetch-based router.
  const server = http.createServer((req, res) => {
    viteDevServer.middlewares(req, res, async () => {
      try {
        const request = createRequest(req, res);
        const response = await router.fetch(request);
        await sendResponse(res, response);
      } catch (error) {
        viteDevServer.ssrFixStacktrace(error as Error);
        console.error(error);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain" });
        }
        res.end("Internal Server Error");
      }
    });
  });

  server.listen(port, () => {
    console.log(
      `Dev server listening on port ${port} (http://localhost:${port})`,
    );
  });
} else {
  // In production, all requests go through the fetch-based router.
  const server = http.createServer(
    createRequestListener((request) => router.fetch(request)),
  );

  server.listen(port, () => {
    console.log(`Server listening on port ${port} (http://localhost:${port})`);
  });
}
