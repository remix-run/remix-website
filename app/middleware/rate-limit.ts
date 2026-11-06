import type { Middleware } from "remix/router";

import { CACHE } from "../utils/cache-control.ts";

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyGenerator?: (context: Parameters<Middleware>[0]) => string;
  skip?: (context: Parameters<Middleware>[0]) => boolean;
  skipLocalhost?: boolean;
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
  skipLocalhost = false,
}: RateLimitOptions = {}): Middleware {
  if (windowMs <= 0 || max <= 0) {
    throw new Error("rateLimit options `windowMs` and `max` must be > 0");
  }

  let hits = new Map<string, RateLimitEntry>();
  let requestsSinceCleanup = 0;

  return (context, next) => {
    if (skip?.(context) || (skipLocalhost && isLoopbackRequest(context))) {
      return next();
    }

    let ip = keyGenerator(context).trim() || "unknown";
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
          ...CACHE.PRIVATE,
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": String(retryAfterSeconds),
          "X-Remix-Response": "yes",
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

// Only Fly's proxy is trusted. `Fly-Client-IP` is whoever connected to Fly:
// the visitor on direct `*.fly.dev` traffic, or a Fastly POP in production.
// Fly appends that peer to `X-Forwarded-For` after the visitor address Fastly
// appended, so the entry just left of the rightmost peer is the visitor as
// Fastly saw it. Entries further left are client-supplied and ignored, as are
// headers no proxy here sets (`True-Client-IP`, `CF-Connecting-IP`, ...).
// Until the origin only accepts Fastly traffic, a direct request can still
// pick that left neighbor (see the parity backlog in AGENTS.md).
function getClientIp(context: Parameters<Middleware>[0]) {
  let peer = normalizeClientIp(context.headers.get("fly-client-ip") ?? "");
  if (!peer) return "unknown";

  let forwardedFor = (context.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((value) => normalizeClientIp(value.trim()));
  let peerIndex = forwardedFor.lastIndexOf(peer);
  return (peerIndex > 0 && forwardedFor[peerIndex - 1]) || peer;
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

function isLoopbackRequest(context: Parameters<Middleware>[0]) {
  let hostname = context.url.hostname.toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname.startsWith("127.")
  );
}
