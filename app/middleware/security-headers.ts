import type { Middleware } from "remix/router";
import { isProduction } from "../utils/node-env.ts";

interface SecurityHeadersOptions {
  enableStrictTransportSecurity?: boolean;
}

export function securityHeaders({
  enableStrictTransportSecurity = isProduction,
}: SecurityHeadersOptions = {}): Middleware {
  return async (_context, next) => {
    let response = await next();

    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), geolocation=(), microphone=()",
    );

    if (enableStrictTransportSecurity) {
      response.headers.set("Strict-Transport-Security", "max-age=31536000");
    }

    return response;
  };
}
