import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRouter } from "remix/fetch-router";
import { rateLimit, filteredLogger } from "./middleware.ts";

function createMockContext(
  overrides: {
    forwardedFor?: string;
    method?: string;
    pathname?: string;
    search?: string;
  } = {},
) {
  let { forwardedFor, method = "GET", pathname = "/", search = "" } = overrides;
  let url = new URL(`${pathname}${search}`, "http://localhost");
  let headers = new Headers();
  if (forwardedFor !== undefined) {
    headers.set("x-forwarded-for", forwardedFor);
  }
  let request = new Request(url.toString(), { method, headers });

  return {
    request,
    headers: request.headers,
    url: new URL(request.url),
  };
}

function createNext(responseBody = "OK") {
  return vi.fn(() => Promise.resolve(new Response(responseBody)));
}

type TestContext = ReturnType<typeof createMockContext>;
type TestNext = ReturnType<typeof createNext>;
type RateLimitMiddleware = ReturnType<typeof rateLimit>;

function invokeRateLimit(
  middleware: RateLimitMiddleware,
  context: TestContext,
  next: TestNext,
) {
  return middleware(
    context as unknown as Parameters<RateLimitMiddleware>[0],
    next as unknown as Parameters<RateLimitMiddleware>[1],
  );
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 429 when limit is exceeded", async () => {
    let middleware = rateLimit({ max: 2, windowMs: 60_000 });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "10.0.0.1" }),
      next,
    );
    await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "10.0.0.1" }),
      next,
    );
    let result3 = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "10.0.0.1" }),
      next,
    );

    expect(next).toHaveBeenCalledTimes(2);
    expect(result3?.status).toBe(429);
    let body = await result3?.text();
    expect(body).toContain("Too Many Requests");
  });

  it("sets a deterministic Retry-After header when rate limited", async () => {
    let middleware = rateLimit({ max: 1, windowMs: 60_000 });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "172.16.0.1" }),
      next,
    );
    let immediateResult = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "172.16.0.1" }),
      next,
    );
    vi.advanceTimersByTime(1000);
    let oneSecondLaterResult = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "172.16.0.1" }),
      next,
    );

    expect(immediateResult?.headers.get("Retry-After")).toBe("60");
    expect(oneSecondLaterResult?.headers.get("Retry-After")).toBe("59");
  });

  it("tracks different IPs separately", async () => {
    let middleware = rateLimit({ max: 1, windowMs: 60_000 });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "192.168.1.1" }),
      next,
    );
    let resultIp1 = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "192.168.1.1" }),
      next,
    );
    let resultIp2 = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "192.168.1.2" }),
      next,
    );

    expect(resultIp1?.status).toBe(429);
    expect(resultIp2?.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2); // once per IP
  });

  it("uses first IP when x-forwarded-for has multiple values", async () => {
    let middleware = rateLimit({ max: 1, windowMs: 60_000 });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({
        forwardedFor: "203.0.113.1, 70.41.3.18, 150.172.238.178",
      }),
      next,
    );
    let result = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "203.0.113.1, 203.0.113.99" }),
      next,
    );

    expect(result?.status).toBe(429);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("resets count after window expires", async () => {
    let windowMs = 1000;
    let middleware = rateLimit({ max: 1, windowMs });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "10.0.0.5" }),
      next,
    );
    let blocked = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "10.0.0.5" }),
      next,
    );
    expect(blocked?.status).toBe(429);

    vi.advanceTimersByTime(windowMs + 1);

    let allowed = await invokeRateLimit(
      middleware,
      createMockContext({ forwardedFor: "10.0.0.5" }),
      next,
    );
    expect(allowed?.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("supports skipping selected requests from rate limiting", async () => {
    let middleware = rateLimit({
      max: 1,
      windowMs: 60_000,
      skip: (context) => context.url.pathname === "/healthcheck",
    });
    let next = createNext();

    await invokeRateLimit(
      middleware,
      createMockContext({ pathname: "/healthcheck", forwardedFor: "10.0.0.5" }),
      next,
    );
    let second = await invokeRateLimit(
      middleware,
      createMockContext({ pathname: "/healthcheck", forwardedFor: "10.0.0.5" }),
      next,
    );

    expect(second?.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("rate limits through a real router but skips healthcheck", async () => {
    let router = createRouter({
      middleware: [
        rateLimit({
          max: 1,
          windowMs: 60_000,
          skip: (context) => context.url.pathname === "/healthcheck",
        }),
      ],
    });

    router.map("*", (context) => {
      return new Response(`ok:${context.url.pathname}`);
    });

    let healthcheckFirst = await router.fetch(
      new Request("http://localhost/healthcheck", {
        headers: { "x-forwarded-for": "198.51.100.10" },
      }),
    );
    let healthcheckSecond = await router.fetch(
      new Request("http://localhost/healthcheck", {
        headers: { "x-forwarded-for": "198.51.100.10" },
      }),
    );

    expect(healthcheckFirst.status).toBe(200);
    expect(healthcheckSecond.status).toBe(200);

    let docsFirst = await router.fetch(
      new Request("http://localhost/docs", {
        headers: { "x-forwarded-for": "198.51.100.10" },
      }),
    );
    let docsSecond = await router.fetch(
      new Request("http://localhost/docs", {
        headers: { "x-forwarded-for": "198.51.100.10" },
      }),
    );

    expect(docsFirst.status).toBe(200);
    expect(docsSecond.status).toBe(429);
  });
});

describe("filteredLogger", () => {
  it("logs GET paths that only partially match __manifest", async () => {
    let loggerMiddleware = vi.fn(
      (_context: unknown, next: () => Promise<Response>) => next(),
    );
    let router = createRouter({
      middleware: [filteredLogger({ loggerMiddleware })],
    });
    router.map("*", () => new Response("ok"));

    let response = await router.fetch(
      new Request("http://localhost/__manifestation"),
    );

    expect(response.status).toBe(200);
    expect(loggerMiddleware).toHaveBeenCalledTimes(1);
  });

  it("skips logging for GET /__manifest-prefixed paths", async () => {
    let loggerMiddleware = vi.fn(
      (_context: unknown, next: () => Promise<Response>) => next(),
    );
    let router = createRouter({
      middleware: [filteredLogger({ loggerMiddleware })],
    });
    router.map("*", () => new Response("ok"));

    let response = await router.fetch(
      new Request("http://localhost/__manifest/some-asset.js"),
    );

    expect(response.status).toBe(200);
    expect(loggerMiddleware).not.toHaveBeenCalled();
  });
});
