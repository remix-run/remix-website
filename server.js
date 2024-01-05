const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createRequestHandler } = require("@remix-run/express");
const sourceMapSupport = require("source-map-support");
const { installGlobals } = require("@remix-run/node");

sourceMapSupport.install();
installGlobals();

// Wrap file in an async function so we can import Vite's ESM build
// since the CJS build is deprecated and logs a warning
(async () => {
  const vite =
    process.env.NODE_ENV === "production"
      ? undefined
      : await import("vite").then(({ createServer }) =>
          createServer({
            server: {
              middlewareMode: true,
            },
          }),
        );

  const BUILD_DIR = path.join(process.cwd(), "build", "server");

  const app = express();

  const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.set("trust proxy", true);
  app.use(limiter);

  app.get("/ip", (request, response) => response.send(request.ip));

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  if (vite) {
    app.use(vite.middlewares);
  } else {
    // Vite fingerprints its assets so we can cache forever.
    app.use(
      "/assets",
      express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
    );
  }

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("build/client", { maxAge: "1h" }));

  app.use(morgan("tiny"));

  app.all(
    "*",
    createRequestHandler({
      build: vite
        ? () => vite.ssrLoadModule("virtual:remix/server-build")
        : require(BUILD_DIR),
      mode: process.env.NODE_ENV,
    }),
  );
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(
      `Express server listening on port ${port} (http://localhost:${port})`,
    );
  });
})();
