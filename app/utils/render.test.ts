import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import type { Router } from "remix/fetch-router";
import { followFrameRedirects } from "./render.ts";

type RouterFetch = Router["fetch"];

function requestUrl(request: Parameters<RouterFetch>[0]) {
  return new Request(request).url;
}

describe("followFrameRedirects", () => {
  it("follows internal redirects until a non-redirect response is reached", async (t) => {
    let responses = [
      new Response(null, {
        status: 302,
        headers: { location: "/jam/2025" },
      }),
      new Response("ok", { status: 200 }),
    ];
    let fetch = t.mock.fn<RouterFetch>((request) =>
      Promise.resolve(responses.shift() ?? new Response(requestUrl(request))),
    );

    let router = { fetch } as unknown as Router;
    let request = new Request("http://localhost/jam", { method: "GET" });
    let response = await followFrameRedirects(
      router,
      request,
      new URL("/jam", request.url),
      new Headers({ accept: "text/html" }),
    );

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(requestUrl(fetch.mock.calls[0]!.arguments[0])).toBe(
      "http://localhost/jam",
    );
    expect(requestUrl(fetch.mock.calls[1]!.arguments[0])).toBe(
      "http://localhost/jam/2025",
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  it("throws after too many redirects", async (t) => {
    let fetch = t.mock.fn<RouterFetch>(() =>
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
