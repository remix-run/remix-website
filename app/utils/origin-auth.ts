import { createHash, timingSafeEqual } from "node:crypto";

import { CACHE } from "./cache-control.ts";

/**
 * Fastly sets this header on every request it forwards to the origin. A
 * request without the right value reached `*.fly.dev` directly, bypassing the
 * CDN and the client IP it vouches for.
 */
export const ORIGIN_AUTH_HEADER = "X-Origin-Auth";

/**
 * Returns a guard for the network boundary in `server.ts`, where in-process
 * requests (warm-up, frame renders) never pass. The guard returns a 403 for
 * requests that lack the shared secret, or `null` to let them through. Without
 * a secret it lets everything through, so staging and local dev are
 * unaffected and production enforcement starts when the Fly secret is set.
 * Fly's health checks hit machines directly, so `/healthcheck` stays open.
 */
export function createOriginAuth(secret: string | undefined) {
  let expected = secret?.trim() ? digest(secret.trim()) : null;

  return (request: Request): Response | null => {
    if (!expected) return null;
    if (new URL(request.url).pathname === "/healthcheck") return null;

    let provided = request.headers.get(ORIGIN_AUTH_HEADER);
    if (provided && timingSafeEqual(digest(provided), expected)) return null;

    return new Response("Forbidden", {
      status: 403,
      headers: {
        ...CACHE.PRIVATE,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  };
}

// Hashing gives both sides the same length, which `timingSafeEqual` requires,
// without leaking the secret's length through an early mismatch.
function digest(value: string) {
  return createHash("sha256").update(value).digest();
}
