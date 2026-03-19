import * as os from "node:os";
import * as path from "node:path";
import { createFsFileStorage } from "remix/file-storage/fs";
import { createScriptServer } from "remix/script-server";

import { getRepoRoot } from "./repo-root.server.ts";

let root = getRepoRoot();
let isProd = process.env.NODE_ENV === "production";

/** Fly/Docker images often cannot mkdir under the app root; `/tmp` is always writable. */
function scriptServerCachePath(): string {
  let override = process.env.SCRIPT_SERVER_CACHE_DIR;
  if (override) return path.resolve(override);
  if (isProd) return path.join(os.tmpdir(), "remix-script-server");
  return path.join(root, ".cache/script-server");
}

/**
 * With production `fingerprint: "source"`, only entry points may omit the `.@hash`
 * suffix. Hydration loads `clientEntry` modules at stable `/scripts/remix/assets/…`
 * URLs, so every file in `remix/assets/` that can be requested that way must match
 * an entry glob (see Remix script-server `entryPoints` + `createFileMatcher`).
 */
let scriptServerEntryGlobs = ["remix/assets/*.{ts,tsx}"];

export let scriptServer = createScriptServer({
  root,
  routes: [
    { urlPattern: "/scripts/remix/*path", filePattern: "remix/*path" },
    { urlPattern: "/scripts/npm/*path", filePattern: "node_modules/*path" },
  ],
  // `node_modules/**` matches most installs but not pnpm’s nested store paths
  // (`node_modules/.pnpm/.../node_modules/...`) under Node’s path glob rules.
  allow: ["remix/**", "node_modules/**", "node_modules/.pnpm/**"],
  minify: isProd,
  cacheStrategy: isProd
    ? {
        fingerprint: "source",
        entryPoints: scriptServerEntryGlobs,
        buildId: process.env.GITHUB_SHA ?? `local-${Date.now()}`,
        fileStorage: createFsFileStorage(scriptServerCachePath()),
      }
    : undefined,
  sourceMaps: isProd ? undefined : "inline",
});
