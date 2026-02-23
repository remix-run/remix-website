import * as http from "node:http";
import { createRequestListener } from "remix/node-fetch-server";

// @ts-expect-error - generated build artifact is not typed
import build from "./build/server/index.js";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isFinite(port) || port <= 0) {
  throw new Error(
    `Invalid PORT value "${process.env.PORT ?? ""}". Expected a positive number.`,
  );
}

const server = http.createServer(createRequestListener(build.fetch));

server.listen(port, () => {
  console.log(`Server listening on port ${port} (http://localhost:${port})`);
});

installShutdownHandlers(server);

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
