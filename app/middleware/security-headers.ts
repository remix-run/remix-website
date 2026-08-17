import type { Middleware } from "remix/router";

interface SecurityHeadersOptions {
  enableStrictTransportSecurity?: boolean;
}

export function securityHeaders({
  enableStrictTransportSecurity = process.env.NODE_ENV === "production",
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
