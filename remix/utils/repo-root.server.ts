import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Repo root for filesystem reads. Uses `import.meta.url` when available (Node / esbuild);
 * falls back to `process.cwd()` under Vitest’s non-`file:` module URLs.
 */
export function getRepoRoot(): string {
  try {
    let url = import.meta.url;
    if (typeof url === "string" && url.startsWith("file:")) {
      return path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
    }
  } catch {
    // ignore
  }
  return process.cwd();
}
