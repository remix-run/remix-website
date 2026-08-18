import * as http from "node:http";
import { createFetchProxy } from "remix/fetch-proxy";
import { createHmrReadyFetch, run } from "remix/node-hmr";
import { createRequestListener } from "remix/node-fetch-server";

const hmrProxyPort = Number(process.env.PORT ?? 44100);
const appPort = Number(process.env.APP_PORT ?? hmrProxyPort + 1);
const hmrEventPort = Number(process.env.HMR_EVENT_PORT ?? appPort + 1);

const hmrRunner = run("server.ts", {
  env: {
    ...process.env,
    PORT: String(appPort),
    HMR_PROXY_PORT: String(hmrProxyPort),
  },
  nodeArgs: ["--import", "remix/node-tsx", "--import", "remix/ui-hmr/node"],
  browserHmrChannel: { port: hmrEventPort },
});

const proxyFetch = createFetchProxy(`http://127.0.0.1:${appPort}`, {
  fetch: (input, init) =>
    globalThis.fetch(input, { ...init, redirect: "manual" }),
  xForwardedHeaders: true,
});

const server = http.createServer(
  createRequestListener(createHmrReadyFetch(hmrRunner, proxyFetch)),
);

server.listen(hmrProxyPort, "127.0.0.1", () => {
  console.log(
    `Development proxy listening on http://127.0.0.1:${hmrProxyPort}`,
  );
});

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(() => hmrRunner.close().finally(() => process.exit(0)));
  server.closeAllConnections();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
