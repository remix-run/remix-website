import * as http from "node:http";
import { createRequestListener } from "remix/node-fetch-server";
import build from "./remix/server.ts";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isFinite(port) || port <= 0) {
  throw new Error(
    `Invalid PORT value "${process.env.PORT ?? ""}". Expected a positive number.`,
  );
}

const server = http.createServer(createRequestListener(build.fetch));

server.on("error", (err) => {
  if (err && "code" in err && err.code === "EADDRINUSE") {
    console.error(
      `[dev] Port ${port} is already in use. Stop the other process or run with PORT=3001 (etc.).`,
    );
  } else {
    console.error("[dev] HTTP server error:", err);
  }
  process.exit(1);
});

server.listen(port, () => {
  console.log(
    `[dev] Server listening on port ${port} (http://localhost:${port})`,
  );
});

process.once("SIGINT", () => process.exit(0));
process.once("SIGTERM", () => process.exit(0));
