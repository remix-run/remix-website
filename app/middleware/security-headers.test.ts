import { expect } from "remix/assert";
import { createRouter } from "remix/router";
import { describe, it } from "remix/test";

import { securityHeaders } from "./security-headers.ts";

describe("securityHeaders", () => {
  it("applies the baseline policy and production transport security", async () => {
    let router = createSecurityHeadersRouter(true);
    let response = await router.fetch("https://remix.run/");

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("Permissions-Policy")).toBe(
      "camera=(), geolocation=(), microphone=()",
    );
    expect(response.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000",
    );
  });

  it("omits transport security outside production", async () => {
    let router = createSecurityHeadersRouter(false);
    let response = await router.fetch("http://localhost/");

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.has("Strict-Transport-Security")).toBe(false);
  });
});

function createSecurityHeadersRouter(enableStrictTransportSecurity: boolean) {
  return createRouter({
    defaultHandler: () => new Response("OK"),
    middleware: [securityHeaders({ enableStrictTransportSecurity })],
  });
}
