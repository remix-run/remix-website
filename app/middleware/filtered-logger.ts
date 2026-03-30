import { logger } from "remix/logger-middleware";
import type { Middleware } from "remix/fetch-router";

interface FilteredLoggerOptions {
  loggerMiddleware?: Middleware;
}

let baseLogger = logger();

export function filteredLogger({
  loggerMiddleware = baseLogger,
}: FilteredLoggerOptions = {}): Middleware {
  return (context, next) => {
    if (
      context.request.method === "GET" &&
      isManifestPath(context.url.pathname)
    ) {
      return next();
    }
    return loggerMiddleware(context, next);
  };
}

function isManifestPath(pathname: string) {
  return pathname === "/__manifest" || pathname.startsWith("/__manifest/");
}
