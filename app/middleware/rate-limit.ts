import type { Middleware } from "remix/fetch-router";

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyGenerator?: (context: Parameters<Middleware>[0]) => string;
  skip?: (context: Parameters<Middleware>[0]) => boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function rateLimit({
  windowMs = 2 * 60 * 1000,
  max = 1000,
  keyGenerator = getClientIp,
  skip,
}: RateLimitOptions = {}): Middleware {
  if (windowMs <= 0 || max <= 0) {
    throw new Error("rateLimit options `windowMs` and `max` must be > 0");
  }

  let hits = new Map<string, RateLimitEntry>();
  let requestsSinceCleanup = 0;

  return (context, next) => {
    if (skip?.(context)) {
      return next();
    }

    let ip = keyGenerator(context)?.trim() || "unknown";
    let now = Date.now();
    requestsSinceCleanup++;
    if (requestsSinceCleanup >= 100) {
      cleanupExpiredEntries(hits, now);
      requestsSinceCleanup = 0;
    }

    let data = hits.get(ip);
    if (!data || now > data.resetTime) {
      data = { count: 0, resetTime: now + windowMs };
      hits.set(ip, data);
    }

    data.count++;

    if (data.count > max) {
      let retryAfterSeconds = Math.max(
        1,
        Math.ceil((data.resetTime - now) / 1000),
      );
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
        },
      });
    }

    return next();
  };
}

function cleanupExpiredEntries(hits: Map<string, RateLimitEntry>, now: number) {
  for (let [key, data] of hits) {
    if (now > data.resetTime) {
      hits.delete(key);
    }
  }
}

function getClientIp(context: Parameters<Middleware>[0]) {
  let headers = [
    "cf-connecting-ip",
    "true-client-ip",
    "x-real-ip",
    "x-forwarded-for",
  ];

  for (let headerName of headers) {
    let rawValue = context.headers.get(headerName);
    if (!rawValue) continue;

    let firstValue = rawValue.split(",")[0]?.trim();
    if (!firstValue) continue;

    let normalizedValue = normalizeClientIp(firstValue);
    if (normalizedValue) return normalizedValue;
  }

  return "unknown";
}

function normalizeClientIp(ip: string) {
  let unquotedIp = ip.replace(/^"(.*)"$/, "$1").trim();
  if (!unquotedIp) return "";

  if (unquotedIp.startsWith("[") && unquotedIp.includes("]")) {
    return unquotedIp.slice(1, unquotedIp.indexOf("]"));
  }

  if (unquotedIp.startsWith("::ffff:")) {
    return unquotedIp.slice("::ffff:".length);
  }

  if (unquotedIp.includes(".") && unquotedIp.includes(":")) {
    return unquotedIp.split(":")[0];
  }

  return unquotedIp;
}
