import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { createRouter } from "remix/router";

import { rateLimit } from "./rate-limit.ts";

describe("rateLimit", () => {
  it("blocks a client after its quota and reports the deterministic reset", async (t) => {
    let now = new Date("2026-01-01T00:00:00.000Z").getTime();
    t.mock.method(Date, "now", () => now);
    let router = createRateLimitedRouter({ max: 2, windowMs: 60_000 });

    expect((await request(router, "10.0.0.1")).status).toBe(200);
    expect((await request(router, "10.0.0.1")).status).toBe(200);

    let blocked = await request(router, "10.0.0.1");
    expect(blocked.status).toBe(429);
    expect(await blocked.text()).toBe("Too Many Requests");
    expect(blocked.headers.get("Retry-After")).toBe("60");
    expect(blocked.headers.get("Cache-Control")).toBe("private, no-store");

    now += 1_000;
    expect((await request(router, "10.0.0.1")).headers.get("Retry-After")).toBe(
      "59",
    );
  });

  it("keys proxied requests by the visitor Fastly saw, not the POP", async () => {
    let sameVisitor: Array<[Record<string, string>, Record<string, string>]> = [
      // Different POPs and a forged leftmost entry still map to one visitor.
      [
        {
          "fly-client-ip": "151.101.1.1",
          "x-forwarded-for": "203.0.113.1, 151.101.1.1, 66.241.124.1",
        },
        {
          "fly-client-ip": "151.101.2.2",
          "x-forwarded-for":
            "198.51.100.99, 203.0.113.1, 151.101.2.2, 66.241.124.1",
        },
      ],
      // Addresses are normalized before comparing.
      [
        {
          "fly-client-ip": "151.101.1.1",
          "x-forwarded-for": "[2001:db8::1]:443, 151.101.1.1",
        },
        {
          "fly-client-ip": "::ffff:151.101.1.1",
          "x-forwarded-for": "2001:db8::1, 151.101.1.1",
        },
      ],
    ];

    for (let [firstHeaders, equivalentHeaders] of sameVisitor) {
      let router = createRateLimitedRouter({ max: 1, windowMs: 60_000 });
      expect((await request(router, undefined, firstHeaders)).status).toBe(200);
      expect((await request(router, undefined, equivalentHeaders)).status).toBe(
        429,
      );
    }

    let router = createRateLimitedRouter({ max: 1, windowMs: 60_000 });
    for (let visitor of ["203.0.113.10", "203.0.113.11"]) {
      let response = await request(router, undefined, {
        "fly-client-ip": "151.101.1.1",
        "x-forwarded-for": `${visitor}, 151.101.1.1, 66.241.124.1`,
      });
      expect(response.status).toBe(200);
    }
  });

  it("ignores client-settable IP headers on direct requests", async () => {
    let router = createRateLimitedRouter({ max: 1, windowMs: 60_000 });
    expect((await request(router, "192.0.2.10")).status).toBe(200);

    let forged = await request(router, "192.0.2.10", {
      "cf-connecting-ip": "198.51.100.1",
      "fastly-client-ip": "198.51.100.2",
      "true-client-ip": "198.51.100.3",
      "x-real-ip": "198.51.100.4",
    });
    expect(forged.status).toBe(429);

    expect((await request(router, "192.0.2.11")).status).toBe(200);
  });

  it("opens a fresh quota window after the reset time", async (t) => {
    let now = 1_000;
    t.mock.method(Date, "now", () => now);
    let router = createRateLimitedRouter({ max: 1, windowMs: 1_000 });

    expect((await request(router, "10.0.0.5")).status).toBe(200);
    expect((await request(router, "10.0.0.5")).status).toBe(429);

    now += 1_001;
    expect((await request(router, "10.0.0.5")).status).toBe(200);
  });

  it("skips configured paths and loopback requests only", async () => {
    let router = createRateLimitedRouter({
      max: 1,
      windowMs: 60_000,
      skip: (context) => context.url.pathname === "/healthcheck",
      skipLocalhost: true,
    });

    expect((await request(router, "10.0.0.5", {}, "/healthcheck")).status).toBe(
      200,
    );
    expect((await request(router, "10.0.0.5", {}, "/healthcheck")).status).toBe(
      200,
    );
    expect(
      (await request(router, undefined, {}, "/", "localhost")).status,
    ).toBe(200);
    expect(
      (await request(router, undefined, {}, "/", "localhost")).status,
    ).toBe(200);
    expect(
      (await request(router, undefined, {}, "/", "example.com")).status,
    ).toBe(200);
    expect(
      (await request(router, undefined, {}, "/", "example.com")).status,
    ).toBe(429);
  });

  it("rejects unusable limits", () => {
    expect(() => rateLimit({ max: 0 })).toThrow();
    expect(() => rateLimit({ windowMs: 0 })).toThrow();
  });
});

function createRateLimitedRouter(options: Parameters<typeof rateLimit>[0]) {
  let router = createRouter({ middleware: [rateLimit(options)] });
  router.map("*", (context) => new Response(`ok:${context.url.pathname}`));
  return router;
}

function request(
  router: ReturnType<typeof createRateLimitedRouter>,
  flyClientIp?: string,
  extraHeaders: Record<string, string> = {},
  pathname = "/",
  hostname = "example.com",
) {
  let headers = new Headers(extraHeaders);
  if (flyClientIp) headers.set("fly-client-ip", flyClientIp);
  return router.fetch(
    new Request(`http://${hostname}${pathname}`, { headers }),
  );
}
