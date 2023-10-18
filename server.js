const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createRequestHandler } = require("@remix-run/express");
const { broadcastDevReady } = require("@remix-run/node");
const sourceMapSupport = require("source-map-support");
const { installGlobals } = require("@remix-run/node");

sourceMapSupport.install();
installGlobals();

const BUILD_DIR = path.join(process.cwd(), "build");
const build = require(BUILD_DIR);

const app = express();

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", true);
app.use(limiter);

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  }),
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
});
