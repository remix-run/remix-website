import * as path from "node:path";
import { createAssetServer } from "remix/assets";
import { applyTemporaryPnpmAssetDuplicationFix } from "./temporary-pnpm-asset-duplication-fix.server.ts";

let isDevelopment = process.env.NODE_ENV !== "production";
let rootDir = path.resolve(import.meta.dirname, "../..");

let rawAssetServer = createAssetServer({
  basePath: "/assets",
  rootDir,
  fileMap: {
    "/app/*path": "app/*path",
    "/npm/*path": "node_modules/*path",
  },
  allow: [path.join(rootDir, "app"), path.join(rootDir, "node_modules")],
  deny: [
    "app/**/*.server.*",
    "app/**/*.test.*",
    "app/data/**",
    "app/middleware/**",
  ],
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

/*
 * TEMPORARY REMIX BUG WORKAROUND.
 *
 * Delete this wrapper after upgrading to a Remix release that fixes:
 * https://github.com/remix-run/remix/issues/11458
 */
export let assetServer = applyTemporaryPnpmAssetDuplicationFix(rawAssetServer, {
  basePath: "/assets",
  packagePathPrefix: "/npm",
  rootDir,
});
