import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit, filteredLogger } from "./middleware.ts";

function createMockContext(overrides: {
  forwardedFor?: string;
  method?: string;
  pathname?: string;
} = {}) {
  const { forwardedFor, method = "GET", pathname = "/" } = overrides;
  return {
    request: new Request("http://localhost/", { method }),
    headers: {
      get: (name: string) =>
        name === "x-forwarded-for" ? forwardedFor ?? null : null,
    },
    url: new URL(pathname, "http://localhost"),
  };
}

function createNext(responseBody = "OK") {
  return vi.fn(() => Promise.resolve(new Response(responseBody)));
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit to pass through", async () => {
    const middleware = rateLimit({ max: 2, windowMs: 60_000 });
    const next = createNext();
    const context = createMockContext({ forwardedFor: "192.168.1.1" });

    const result1 = await middleware(context as never, next);
    const result2 = await middleware(context as never, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(result1?.status).toBe(200);
    expect(result2?.status).toBe(200);
  });

  it("returns 429 when limit is exceeded", async () => {
    const middleware = rateLimit({ max: 2, windowMs: 60_000 });
    const next = createNext();
    const context = createMockContext({ forwardedFor: "10.0.0.1" });

    await middleware(context as never, next);
    await middleware(context as never, next);
    const result3 = await middleware(context as never, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(result3?.status).toBe(429);
    const body = await result3?.text();
    expect(body).toContain("Too Many Requests");
  });

  it("sets Retry-After header when rate limited", async () => {
    const middleware = rateLimit({ max: 1, windowMs: 60_000 });
    const next = createNext();
    const context = createMockContext({ forwardedFor: "172.16.0.1" });

    await middleware(context as never, next);
    const result = await middleware(context as never, next);

    expect(result?.headers.get("Retry-After")).toBeDefined();
    const retryAfter = Number(result?.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it("tracks different IPs separately", async () => {
    const middleware = rateLimit({ max: 1, windowMs: 60_000 });
    const next = createNext();

    const ip1 = createMockContext({ forwardedFor: "192.168.1.1" });
    const ip2 = createMockContext({ forwardedFor: "192.168.1.2" });

    await middleware(ip1 as never, next);
    const resultIp1 = await middleware(ip1 as never, next);
    const resultIp2 = await middleware(ip2 as never, next);

    expect(resultIp1?.status).toBe(429);
    expect(resultIp2?.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2); // once per IP
  });

  it("uses 'unknown' when x-forwarded-for is missing", async () => {
    const middleware = rateLimit({ max: 1, windowMs: 60_000 });
    const next = createNext();
    const context = createMockContext(); // no forwardedFor

    await middleware(context as never, next);
    const result = await middleware(context as never, next);

    expect(result?.status).toBe(429);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("uses first IP when x-forwarded-for has multiple values", async () => {
    const middleware = rateLimit({ max: 1, windowMs: 60_000 });
    const next = createNext();
    const context = createMockContext({
      forwardedFor: " 203.0.113.1 , 70.41.3.18 ",
    });

    await middleware(context as never, next);
    const result = await middleware(context as never, next);

    expect(result?.status).toBe(429);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("resets count after window expires", async () => {
    const windowMs = 1000;
    const middleware = rateLimit({ max: 1, windowMs });
    const next = createNext();
    const context = createMockContext({ forwardedFor: "10.0.0.5" });

    await middleware(context as never, next);
    const blocked = await middleware(context as never, next);
    expect(blocked?.status).toBe(429);

    vi.advanceTimersByTime(windowMs + 1);

    const allowed = await middleware(context as never, next);
    expect(allowed?.status).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });
});

describe("filteredLogger", () => {
  it("passes through non-GET requests", async () => {
    const middleware = filteredLogger();
    const next = createNext();
    const context = createMockContext({ method: "POST", pathname: "/api" });

    await middleware(context as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("passes through GET requests to non-__manifest paths", async () => {
    const middleware = filteredLogger();
    const next = createNext();
    const context = createMockContext({ pathname: "/blog" });

    await middleware(context as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("skips logging for GET /__manifest requests", async () => {
    const middleware = filteredLogger();
    const next = createNext();
    const context = createMockContext({ pathname: "/__manifest" });

    const result = await middleware(context as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(result?.status).toBe(200);
  });
});
