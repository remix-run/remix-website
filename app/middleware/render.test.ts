import { expect } from "remix/assert";
import { createRouter } from "remix/router";
import { describe, it } from "remix/test";
import { createElement, Frame, type Handle } from "remix/ui";

import { renderMiddleware } from "./render.ts";

function createTestRouter() {
  return createRouter({ middleware: [renderMiddleware] as const });
}

function FrameLocation(handle: Handle) {
  return () =>
    createElement(
      "p",
      {},
      `${handle.frame.src} (top: ${handle.frames.top.src})`,
    );
}

describe("render middleware", () => {
  it("renders a document with the response init", async () => {
    let router = createTestRouter();

    router.get("/", (context) =>
      context.render(createElement("h1", {}, "Hello"), {
        status: 201,
        headers: { "X-Test": "render" },
      }),
    );

    let response = await router.fetch("http://localhost/");

    expect(response.status).toBe(201);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("X-Test")).toBe("render");
    expect(await response.text()).toMatch(/^<!DOCTYPE html><h1>Hello<\/h1>/);
  });

  it("resolves nested and targeted frames through the router", async () => {
    let router = createTestRouter();
    let frameHeaders: Headers[] = [];

    router.get("/", (context) =>
      context.render(createElement(Frame, { name: "outer", src: "/first" })),
    );
    router.get("/first", (context) => {
      frameHeaders.push(context.request.headers);
      return context.render(
        createElement(
          "section",
          {},
          createElement(FrameLocation),
          createElement(Frame, { name: "inner", src: "./second" }),
        ),
      );
    });
    router.get("/second", (context) => {
      frameHeaders.push(context.request.headers);
      return context.render(createElement(FrameLocation));
    });

    let response = await router.fetch(
      new Request("http://localhost/", {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          Cookie: "session=abc",
          "Content-Type": "application/json",
          "Sec-Fetch-Mode": "navigate",
        },
      }),
    );
    let html = await response.text();

    expect(html).toContain("http://localhost/first (top: http://localhost/)");
    expect(html).toContain("http://localhost/second (top: http://localhost/)");
    // Only one doctype: frame bodies are inlined without their own
    expect(html.slice("<!DOCTYPE html>".length)).not.toContain("<!DOCTYPE");

    expect(frameHeaders.length).toBe(2);
    expect(frameHeaders[0]!.get("Accept")).toBe("text/html");
    expect(frameHeaders[0]!.get("Accept-Encoding")).toBe("identity");
    expect(frameHeaders[0]!.get("Cookie")).toBe("session=abc");
    expect(frameHeaders[0]!.get("X-Remix-Frame")).toBe("true");
    expect(frameHeaders[0]!.get("X-Remix-Ssr-Frame")).toBe("true");
    expect(frameHeaders[0]!.get("X-Remix-Target")).toBe("outer");
    expect(frameHeaders[0]!.get("Content-Type")).toBe(null);
    expect(frameHeaders[0]!.get("Sec-Fetch-Mode")).toBe(null);
    expect(frameHeaders[1]!.get("X-Remix-Target")).toBe("inner");
  });

  it("follows frame redirects and preserves frame error content", async () => {
    let router = createTestRouter();

    router.get("/", (context) =>
      context.render(
        createElement(
          "main",
          {},
          createElement(Frame, { src: "/redirect" }),
          createElement(Frame, { src: "/invalid" }),
          createElement(Frame, { src: "/empty" }),
        ),
      ),
    );
    router.get(
      "/redirect",
      () => new Response(null, { status: 302, headers: { Location: "/ok" } }),
    );
    router.get("/ok", () => new Response("<strong>Redirected</strong>"));
    router.get(
      "/invalid",
      () => new Response("<p>Validation failed</p>", { status: 422 }),
    );
    router.get(
      "/empty",
      () => new Response(null, { status: 404, statusText: "Not Found" }),
    );

    let response = await router.fetch("http://localhost/");
    let html = await response.text();

    expect(html).toContain("<strong>Redirected</strong>");
    expect(html).toContain("<p>Validation failed</p>");
    expect(html).toContain("<pre>Frame error: 404 Not Found</pre>");
  });

  it("escapes status text used for empty frame errors", async () => {
    let router = createTestRouter();

    router.get("/", (context) =>
      context.render(createElement(Frame, { src: "/unsafe" })),
    );
    router.get(
      "/unsafe",
      () =>
        new Response(null, {
          status: 500,
          statusText: '<script>alert("xss")</script> & failed',
        }),
    );

    let html = await (await router.fetch("http://localhost/")).text();

    expect(html).not.toContain("<script>alert");
    expect(html).toContain(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; failed",
    );
  });

  it("fails the document render when a frame redirects in a loop", async () => {
    let router = createTestRouter();

    router.get("/", (context) =>
      context.render(createElement(Frame, { src: "/loop" })),
    );
    router.get(
      "/loop",
      () => new Response(null, { status: 302, headers: { Location: "/loop" } }),
    );

    let response = await router.fetch("http://localhost/");

    await expect(response.text()).rejects.toThrow(
      "Too many frame redirects while resolving http://localhost/loop",
    );
  });

  it("does not forward credentials to cross-origin frames", async () => {
    let router = createTestRouter();
    let crossOriginHeaders: Headers | undefined;

    router.get("/", (context) =>
      context.render(
        createElement(Frame, { src: "http://other.example/cross-origin" }),
      ),
    );
    router.get("http://other.example/cross-origin", (context) => {
      crossOriginHeaders = context.request.headers;
      return new Response("<span>Cross origin</span>");
    });

    let response = await router.fetch(
      new Request("http://localhost/", {
        headers: {
          Authorization: "Bearer secret",
          Cookie: "session=abc",
          "X-Api-Key": "api-secret",
        },
      }),
    );
    let html = await response.text();

    expect(html).toContain("<span>Cross origin</span>");
    expect(crossOriginHeaders?.get("X-Remix-Frame")).toBe("true");
    expect(crossOriginHeaders?.get("Authorization")).toBe(null);
    expect(crossOriginHeaders?.get("Cookie")).toBe(null);
    expect(crossOriginHeaders?.get("X-Api-Key")).toBe(null);
    expect(crossOriginHeaders?.get("X-Remix-Top-Frame-Src")).toBe(null);
  });

  it("propagates the top frame src to nested frame renders", async () => {
    let router = createTestRouter();

    router.get("/frame", (context) =>
      context.render(createElement(FrameLocation)),
    );

    let response = await router.fetch(
      new Request("http://localhost/frame", {
        headers: {
          "X-Remix-Frame": "true",
          "X-Remix-Top-Frame-Src": "http://localhost/page",
        },
      }),
    );

    expect(await response.text()).toContain(
      "http://localhost/frame (top: http://localhost/page)",
    );
  });
});
