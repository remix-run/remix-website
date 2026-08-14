import * as path from "node:path";
import { createAssetServer } from "remix/assets";
import { uiHmr } from "remix/ui-hmr/assets";

let nodeEnv = process.env.NODE_ENV ?? "development";
let isDevelopment = nodeEnv === "development";
let isProduction = nodeEnv === "production";
let isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR);
let rootDir = path.resolve(import.meta.dirname, "../..");

export let assets = createAssetServer({
  basePath: "/assets",
  rootDir,
  fileMap: {
    "/app/*path": "app/*path",
    "/npm/*path": "node_modules/*path",
  },
  allowFiles: ["app/routes.ts", "app/**/public/**"],
  allowPackages: ["remix", "three", "fathom-client"],
  denyFiles: ["app/**/*.test.*"],
  fingerprint: isProduction ? { buildId: getBuildId() } : undefined,
  sourceMaps: isDevelopment ? "external" : undefined,
  minify: isProduction,
  hmr: isHmr
    ? async () =>
        (await import("remix/node-hmr/runtime")).createBrowserHmrChannel()
    : undefined,
  scripts: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(nodeEnv),
    },
    loaders: isHmr ? [uiHmr()] : undefined,
  },
  watch: isDevelopment,
});

function getBuildId() {
  let buildId = process.env.ASSET_BUILD_ID || process.env.FLY_IMAGE_REF;
  if (!buildId) {
    throw new Error(
      "ASSET_BUILD_ID or FLY_IMAGE_REF is required for production asset fingerprinting",
    );
  }
  return buildId;
}
