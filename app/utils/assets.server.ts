import * as path from "node:path";
import { createAssetServer } from "remix/assets";

let isDevelopment = process.env.NODE_ENV !== "production";
let rootDir = path.resolve(import.meta.dirname, "../..");
let buildId =
  process.env.ASSET_BUILD_ID ?? process.env.GITHUB_SHA ?? String(Date.now());

export let assetServer = createAppAssetServer({ buildId, isDevelopment });

export function createAppAssetServer({
  buildId,
  isDevelopment,
}: {
  buildId: string;
  isDevelopment: boolean;
}) {
  return createAssetServer({
    rootDir,
    fileMap: {
      "/assets/app/*path": "app/*path",
      "/assets/npm/*path": "node_modules/*path",
    },
    allow: [path.join(rootDir, "app"), path.join(rootDir, "node_modules")],
    deny: [
      "app/**/*.server.*",
      "app/**/*.test.*",
      "app/data/**",
      "app/middleware/**",
    ],
    fingerprint: isDevelopment ? undefined : { buildId },
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
}
