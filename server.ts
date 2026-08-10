import * as http from "node:http";
import { createRequestListener } from "remix/node-fetch-server";
import { router } from "./app/router.ts";
import { assets } from "./app/utils/assets.ts";

const isHmr = Boolean(
  process.env.NODE_ENV === "development" && process.env.REMIX_NODE_HMR,
);

const port = Number(process.env.PORT ?? 3000);
if (!Number.isFinite(port) || port <= 0) {
  throw new Error(
    `Invalid PORT value "${process.env.PORT ?? ""}". Expected a positive number.`,
  );
}
const hmrProxyPort = process.env.HMR_PROXY_PORT
  ? Number(process.env.HMR_PROXY_PORT)
  : null;
if ((hmrProxyPort !== null && !Number.isFinite(hmrProxyPort)) || port <= 0) {
  throw new Error(
    `Invalid HMR_PROXY_PORT value "${process.env.HMR_PROXY_PORT ?? ""}". Expected a positive number.`,
  );
}

const server = http.createServer(
  createRequestListener(
    async (request) => {
      try {
        return await router.fetch(request);
      } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
      }
    },
    { trustProxy: isHmr },
  ),
);

server.listen(port, () => {
  if (isHmr) {
    import("remix/node-hmr/runtime").then((nodeHmr) =>
      nodeHmr.emitServerReady(),
    );
  }

  console.log(
    `Server listening on port ${port} (http://localhost:${hmrProxyPort ?? port})`,
  );
});

installShutdownHandlers(server);

function installShutdownHandlers(server: http.Server) {
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down HTTP server...`);
    const forceExitTimer = setTimeout(() => {
      console.error("Timed out waiting for HTTP server to close");
      process.exit(1);
    }, 10_000);
    forceExitTimer.unref();

    await assets.close();
    server.close((error) => {
      clearTimeout(forceExitTimer);
      if (error) {
        console.error("Error while closing HTTP server", error);
        process.exit(1);
      }
      process.exit(0);
    });
    server.closeAllConnections();
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}
