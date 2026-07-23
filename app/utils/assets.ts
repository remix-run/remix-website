import * as path from "node:path";
import { createAssetServer } from "remix/assets";

let isDevelopment = process.env.NODE_ENV !== "production";
let rootDir = path.resolve(import.meta.dirname, "../..");

export let assetServer = createAssetServer({
  basePath: "/assets",
  rootDir,
  fileMap: {
    "/app/*path": "app/*path",
    "/npm/*path": "node_modules/*path",
  },
  // Browser-reachable source lives in `public/` directories inside `app/`,
  // colocated with the code that owns it. The shared `app/routes.ts` route
  // contract is browser-readable so modules can build type-safe hrefs; allowed
  // packages are the other exception.
  allowFiles: ["app/routes.ts", "app/**/public/**"],
  allowPackages: ["remix", "three", "fathom-client"],
  // Test files colocate with their subjects but are not browser runtime source.
  denyFiles: ["app/**/*.test.*"],
  fingerprint: isDevelopment ? undefined : { buildId: getBuildId() },
  sourceMaps: isDevelopment ? "external" : undefined,
  minify: !isDevelopment,
  scripts: {
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "development",
      ),
    },
  },
  watch: false,
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
