import { describe, expect, it, vi } from "vitest";
import type { Router } from "remix/fetch-router";
import { followFrameRedirects } from "./render";

describe("followFrameRedirects", () => {
  it("follows internal redirects until a non-redirect response is reached", async () => {
    let fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: "/jam/2025" },
        }),
      )
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));

    let router = { fetch } as unknown as Router;
    let request = new Request("http://localhost/jam", { method: "GET" });
    let response = await followFrameRedirects(
      router,
      request,
      new URL("/jam", request.url),
      new Headers({ accept: "text/html" }),
    );

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0]?.[0].url).toBe("http://localhost/jam");
    expect(fetch.mock.calls[1]?.[0].url).toBe("http://localhost/jam/2025");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  it("throws after too many redirects", async () => {
    let fetch = vi.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 302,
          headers: { location: "/loop" },
        }),
      ),
    );

    let router = { fetch } as unknown as Router;
    let request = new Request("http://localhost/start", { method: "GET" });

    await expect(
      followFrameRedirects(
        router,
        request,
        new URL("/start", request.url),
        new Headers({ accept: "text/html" }),
      ),
    ).rejects.toThrow("Too many frame redirects");

    expect(fetch).toHaveBeenCalledTimes(11);
  });
});
