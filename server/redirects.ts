import fs from "node:fs";
import path from "node:path";
import { route } from "remix/fetch-router/routes";
import { RoutePattern } from "remix/route-pattern";
import { createRedirectResponse } from "remix/response/redirect";

export const defaultRedirectsPath = path.join(process.cwd(), "_redirects");

function getValidRedirectCode(code: string | number | undefined): number {
  const defaultCode = 302;
  if (!code) return defaultCode;
  if (typeof code === "string") {
    try {
      code = parseInt(code.trim(), 10);
    } catch {
      return defaultCode;
    }
  }
  if (!Number.isInteger(code) || code < 300 || code >= 400) {
    return defaultCode;
  }
  return code;
}

/**
 * Converts Netlify-style _redirects pattern to route-pattern format.
 * - /conf/2023/* with :splat in destination -> /conf/2023/*splat
 */
function toFetchRouterPattern(from: string): string {
  if (from.endsWith("/*")) {
    return from.slice(0, -1) + "*splat";
  }
  return from || "/";
}

type RedirectConfig = { from: string; toPattern: RoutePattern; status: number };

export function parseRedirectsFile(
  redirectsFileContents: string,
): RedirectConfig[] {
  const configs: RedirectConfig[] = [];

  for (const line of redirectsFileContents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const [from, to, maybeCode] = trimmed.split(/\s+/);
    if (!from || !to) continue;
    const status = getValidRedirectCode(maybeCode);
    configs.push({
      from,
      toPattern: new RoutePattern(to),
      status,
    });
  }

  return configs;
}

export function loadRedirectsFromFile(
  redirectsPath: string = defaultRedirectsPath,
): RedirectConfig[] {
  const redirectsFileContents = fs.readFileSync(redirectsPath, "utf-8");
  return parseRedirectsFile(redirectsFileContents);
}

function buildRedirectRouteMap(
  configs: RedirectConfig[],
): Record<string, string> {
  return Object.fromEntries(
    configs.map((c, i) => [
      `redirect${i}_${c.from.replaceAll("/", "_").replaceAll("*", "splat")}`,
      toFetchRouterPattern(c.from),
    ]),
  );
}

function buildRedirectController(
  configs: RedirectConfig[],
): Record<
  string,
  (context: { params: Record<string, string | undefined> }) => Response
> {
  return Object.fromEntries(
    configs.map((c, i) => [
      `redirect${i}_${c.from.replaceAll("/", "_").replaceAll("*", "splat")}`,
      ({ params }: { params: Record<string, string | undefined> }) => {
        const url = c.toPattern.href(params);
        return createRedirectResponse(url, { status: c.status });
      },
    ]),
  );
}

export function createRedirectRoutes(configs: RedirectConfig[]) {
  return {
    redirectRoutes: route(buildRedirectRouteMap(configs)),
    redirectController: buildRedirectController(configs),
  };
}
