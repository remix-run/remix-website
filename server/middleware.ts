import { logger } from "remix/logger-middleware";
import type { Middleware } from "remix/fetch-router";

// Simple rate limiter middleware (replaces express-rate-limit)
// 1000 requests per 2 minutes per IP
export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function rateLimit({
  windowMs = 2 * 60 * 1000,
  max = 1000,
}: RateLimitOptions = {}): Middleware {
  const hits = new Map<string, RateLimitEntry>();

  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits) {
      if (now > data.resetTime) {
        hits.delete(key);
      }
    }
  }, windowMs).unref();

  return (context, next) => {
    const ip =
      context.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const now = Date.now();

    let data = hits.get(ip);
    if (!data || now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMs };
      hits.set(ip, data);
    }

    data.count++;

    if (data.count > max) {
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((data.resetTime - now) / 1000)),
        },
      });
    }

    return next();
  };
}

// Logger middleware that skips GET requests to /__manifest
const baseLogger = logger();

export function filteredLogger(): Middleware {
  return (context, next) => {
    if (
      context.request.method === "GET" &&
      context.url.pathname.startsWith("/__manifest")
    ) {
      return next();
    }
    return baseLogger(context, next);
  };
}
