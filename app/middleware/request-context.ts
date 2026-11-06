import { asyncContext } from "remix/middleware/async-context";
import { formData } from "remix/middleware/form-data";
import { logger } from "remix/middleware/logger";
import { createMiddleware } from "remix/router";

import { isTest } from "../utils/node-env.ts";
import { loadAssetEntry } from "./asset-entry.ts";
import { renderMiddleware } from "./render.ts";

/**
 * The middleware that gives actions their request context (`formData`,
 * `render`, the asset entry) and logs requests. The app router runs it after
 * its edge middleware (security headers, compression, rate limiting); route
 * tests run it alone so controllers see the same context as in production.
 */
export function requestContextMiddleware() {
  return createMiddleware(
    formData(),
    asyncContext(),
    loadAssetEntry(),
    renderMiddleware,
    isTest ? logger({ log() {} }) : logger(),
  );
}
