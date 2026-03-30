import { describe, it, expect, vi } from "vitest";
import { createRouter } from "remix/fetch-router";
import { filteredLogger } from "./filtered-logger.ts";

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
