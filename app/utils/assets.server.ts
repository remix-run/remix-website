import * as path from "node:path";
import { createAssetServer } from "remix/assets";

let isDevelopment = process.env.NODE_ENV !== "production";
let rootDir = path.resolve(import.meta.dirname, "../..");

export let assetServer = createAssetServer({
  rootDir,
  fileMap: {
    "/assets/app/*path": "app/*path",
    "/assets/npm/*path": "node_modules/*path",
  },
  allow: [path.join(rootDir, "app"), path.join(rootDir, "node_modules")],
  deny: ["app/**/*.server.*", "app/**/*.test.*", "app/data/**", "app/middleware/**"],
  scripts: {
    sourceMaps: isDevelopment ? "external" : undefined,
    minify: !isDevelopment,
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "development",
      ),
    },
  },
  watch: false,
});
