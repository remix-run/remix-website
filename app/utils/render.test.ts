import { expect } from "remix/assert";
import type { Router } from "remix/router";
import { get } from "remix/routes";
import { describe, it } from "remix/test";
import { clientEntry, createElement, Frame } from "remix/ui";
import { followFrameRedirects } from "../middleware/render.ts";
import { createRouteTestRouter } from "../../test/setup.ts";

type RouterFetch = Router["fetch"];

function requestUrl(request: Parameters<RouterFetch>[0]) {
  return new Request(request).url;
}

describe("render middleware", () => {
  it("preloads a client entry once when the document and a frame both use it", async () => {
    let router = createRouteTestRouter();
    let SharedEntry = clientEntry(
      "/assets/shared-entry.js#SharedEntry",
      function SharedEntry() {
        return () => createElement("p", {}, "Shared entry");
      },
    );

    router.map(get("/"), (context) =>
      context.render(
        createElement(
          "html",
          {},
          createElement("head"),
          createElement(
            "body",
            {},
            createElement(SharedEntry),
            createElement(Frame, { name: "details", src: "/frame" }),
            createElement("script", {
              type: "module",
              async: true,
              src: "/assets/app/assets/entry.ts",
            }),
          ),
        ),
      ),
    );
    router.map(get("/frame"), (context) =>
      context.render(createElement(SharedEntry)),
    );

    let html = await (await router.fetch("https://remix.run/")).text();
    let modulePreloads = [
      ...html.matchAll(/<link rel="modulepreload" href="([^"]+)"/g),
    ].map((match) => match[1]);

    expect(
      modulePreloads.filter((href) => href === "/assets/shared-entry.js"),
    ).toHaveLength(1);
    expect(new Set(modulePreloads).size).toBe(modulePreloads.length);
    expect(modulePreloads).not.toContain("/assets/app/assets/entry.ts");
  });

  it("forwards safe request context to server-rendered frames", async () => {
    let router = createRouteTestRouter();
    let frameHeaders: Headers | undefined;

    router.map(get("/"), (context) =>
      context.render(createElement(Frame, { name: "details", src: "/frame" })),
    );
    router.map(get("/frame"), (context) => {
      frameHeaders = context.headers;
      return context.render(createElement("p", {}, "Frame content"));
    });

    let response = await router.fetch(
      new Request("https://remix.run/", {
        headers: {
          authorization: "Bearer secret",
          cookie: "session=abc",
          "content-type": "application/json",
          "if-none-match": '"cached"',
          "sec-fetch-mode": "navigate",
          "x-session-token": "token",
        },
      }),
    );
    expect(await response.text()).toContain("Frame content");
    expect(frameHeaders?.get("accept")).toBe("text/html");
    expect(frameHeaders?.get("accept-encoding")).toBe("identity");
    expect(frameHeaders?.get("authorization")).toBe("Bearer secret");
    expect(frameHeaders?.get("cookie")).toBe("session=abc");
    expect(frameHeaders?.get("x-session-token")).toBe("token");
    expect(frameHeaders?.get("x-remix-frame")).toBe("true");
    expect(frameHeaders?.get("x-remix-ssr-frame")).toBe("true");
    expect(frameHeaders?.get("x-remix-target")).toBe("details");
    expect(frameHeaders?.get("x-remix-top-frame-src")).toBe(
      "https://remix.run/",
    );
    expect(frameHeaders?.get("content-type")).toBeNull();
    expect(frameHeaders?.get("if-none-match")).toBeNull();
    expect(frameHeaders?.get("sec-fetch-mode")).toBeNull();
  });
});

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

    expect(fetch).toHaveBeenCalledTimes(21);
  });

  it("removes private headers after a cross-origin redirect", async (t) => {
    let redirectedBodyCancelled = false;
    let responses = [
      new Response(
        new ReadableStream({
          cancel() {
            redirectedBodyCancelled = true;
          },
        }),
        {
          status: 302,
          headers: { location: "https://frames.example/content" },
        },
      ),
      new Response("ok"),
    ];
    let fetch = t.mock.fn<RouterFetch>((request) =>
      Promise.resolve(responses.shift() ?? new Response(requestUrl(request))),
    );
    let router = { fetch } as unknown as Router;
    let request = new Request("https://remix.run/start");
    let headers = new Headers({
      accept: "text/html",
      "accept-encoding": "identity",
      authorization: "Bearer secret",
      cookie: "session=abc",
      "x-api-key": "api-secret",
      "x-remix-frame": "true",
      "x-remix-ssr-frame": "true",
      "x-remix-target": "modal",
      "x-remix-top-frame-src": request.url,
    });

    await followFrameRedirects(
      router,
      request,
      new URL("/redirect", request.url),
      headers,
    );

    let redirectedRequest = new Request(fetch.mock.calls[1]!.arguments[0]);
    expect(redirectedRequest.headers.get("accept")).toBe("text/html");
    expect(redirectedRequest.headers.get("accept-encoding")).toBe("identity");
    expect(redirectedRequest.headers.get("x-remix-frame")).toBe("true");
    expect(redirectedRequest.headers.get("x-remix-target")).toBe("modal");
    expect(redirectedRequest.headers.get("authorization")).toBeNull();
    expect(redirectedRequest.headers.get("cookie")).toBeNull();
    expect(redirectedRequest.headers.get("x-api-key")).toBeNull();
    expect(redirectedRequest.headers.get("x-remix-ssr-frame")).toBeNull();
    expect(redirectedRequest.headers.get("x-remix-top-frame-src")).toBeNull();
    expect(redirectedBodyCancelled).toBe(true);
  });
});
