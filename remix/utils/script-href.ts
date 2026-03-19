import { routes } from "../routes.ts";

/**
 * Build a script-server URL for a repo-root-relative module path
 * (`remix/...` or `node_modules/...`).
 */
export function scriptModuleHref(rootRelativePath: string): string {
  if (rootRelativePath.startsWith("remix/")) {
    return routes.scriptsRemix.href({
      path: rootRelativePath.slice("remix/".length),
    });
  }
  if (rootRelativePath.startsWith("node_modules/")) {
    return routes.scriptsNpm.href({
      path: rootRelativePath.slice("node_modules/".length),
    });
  }
  throw new Error(
    `scriptModuleHref: expected path starting with remix/ or node_modules/, got "${rootRelativePath}"`,
  );
}
