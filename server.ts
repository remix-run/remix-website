import * as http from "node:http";
import {
  createRequestListener,
  createRequest,
  sendResponse,
} from "remix/node-fetch-server";
import { createRequestHandler } from "react-router";
import { createRouter } from "remix/fetch-router";
import { compression } from "remix/compression-middleware";
import { staticFiles } from "remix/static-middleware";
import { rateLimit, filteredLogger } from "./server/middleware.ts";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install();

const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? 3000);
if (!Number.isFinite(port) || port <= 0) {
  throw new Error(
    `Invalid PORT value "${process.env.PORT ?? ""}". Expected a positive number.`,
  );
}

const viteDevServer = isProduction
  ? undefined
  : await import("vite").then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
    );

// Variable import path so TypeScript doesn't try to resolve the build
// output at typecheck time (it only exists after `pnpm run build`).
const serverBuildPath = "./build/server/index.js";
const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:react-router/server-build")
  : await import(serverBuildPath);

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
async function loadRemixModule(path: string) {
  if (viteDevServer) {
    return viteDevServer.ssrLoadModule(path);
  }
  // Production: modules will be pre-compiled (TBD — see asset-strategy)
  return import(path);
}

router.map("/remix-test", async () => {
  const mod = await loadRemixModule("./app/remix/test-route.tsx");
  return mod.default();
});

router.map("/healthcheck", async (context) => {
  const mod = await loadRemixModule("./app/remix/routes/healthcheck.ts");
  return mod.default(context);
});

// All remaining requests are handled by React Router
router.map("*", (context) => handleRequest(context.request));

async function handleNodeRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  const request = createRequest(req, res);
  const response = await router.fetch(request);
  await sendResponse(res, response);
}

function installShutdownHandlers(server: http.Server) {
  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`${signal} received, shutting down HTTP server...`);
    const forceExitTimer = setTimeout(() => {
      console.error("Timed out waiting for HTTP server to close");
      process.exit(1);
    }, 10_000);
    forceExitTimer.unref();

    server.close((error) => {
      clearTimeout(forceExitTimer);
      if (error) {
        console.error("Error while closing HTTP server", error);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

if (viteDevServer) {
  // In development, Vite's connect middleware handles HMR, module
  // serving, and static files. If Vite doesn't handle the request,
  // we fall through to our fetch-based router.
  const server = http.createServer((req, res) => {
    viteDevServer.middlewares(req, res, async () => {
      try {
        await handleNodeRequest(req, res);
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
  installShutdownHandlers(server);
} else {
  // In production, all requests go through the fetch-based router.
  const server = http.createServer(
    createRequestListener((request) => router.fetch(request)),
  );

  server.listen(port, () => {
    console.log(`Server listening on port ${port} (http://localhost:${port})`);
  });
  installShutdownHandlers(server);
}
