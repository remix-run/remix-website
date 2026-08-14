import { expect } from "remix/assert";
import { beforeEach, describe, it } from "remix/test";

import { createAppRouter } from "./router.ts";
import { routes } from "./routes.ts";

describe("app router", () => {
  let router: ReturnType<typeof createAppRouter>;

  beforeEach(() => {
    router = createAppRouter();
  });

  it("serves the healthcheck route", async () => {
    let response = await router.fetch(
      new URL(routes.healthcheck.href(), "http://localhost"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("OK");
  });

  it("serves the blog RSS route", async () => {
    let response = await router.fetch(
      new URL(routes.blog.rss.href(), "http://localhost"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/xml");

    let xml = await response.text();
    expect(xml).toContain("<rss");
    expect(xml).toContain("<title>Remix Blog</title>");
    expect(xml).toContain("<link>https://remix.run/blog</link>");
  });

  it("redirects the Jam index to the 2026 archive", async () => {
    let response = await router.fetch(
      new URL(routes.jam.index.href(), "http://localhost"),
      { redirect: "manual" },
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      routes.jam.y2026.index.href(),
    );
  });

  it("maps legacy redirects from the redirects file", async () => {
    let response = await router.fetch("http://localhost/login", {
      redirect: "manual",
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://remix-run.web.app/login",
    );
  });

  it("renders the branded fallback for unmatched routes", async () => {
    let response = await router.fetch("http://localhost/not-a-route");

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")?.toLowerCase()).toBe(
      "text/html; charset=utf-8",
    );
    expect(await response.text()).toMatch(/<main[ >]/);
  });

  it("allows same-origin browser form posts", async () => {
    let formData = new FormData();
    formData.set("theme", "dark");

    let response = await router.fetch(
      new Request(new URL(routes.jam.y2026.theme.href(), "http://localhost"), {
        body: formData,
        headers: {
          "Sec-Fetch-Site": "same-origin",
        },
        method: "POST",
        redirect: "manual",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("Set-Cookie")).toContain(
      "remix_jam_2026_theme",
    );
  });

  it("allows non-browser form posts without provenance headers", async () => {
    let formData = new FormData();
    formData.set("theme", "dark");

    let response = await router.fetch(
      new Request(new URL(routes.jam.y2026.theme.href(), "http://localhost"), {
        body: formData,
        method: "POST",
        redirect: "manual",
      }),
    );

    expect(response.status).toBe(303);
  });

  it("rejects cross-site browser form posts", async () => {
    let formData = new FormData();
    formData.set("theme", "dark");

    let response = await router.fetch(
      new Request(new URL(routes.jam.y2026.theme.href(), "http://localhost"), {
        body: formData,
        headers: {
          "Sec-Fetch-Site": "cross-site",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(403);
  });

  it("rejects old-browser cross-origin form posts", async () => {
    let formData = new FormData();
    formData.set("theme", "dark");

    let response = await router.fetch(
      new Request(new URL(routes.jam.y2026.theme.href(), "http://localhost"), {
        body: formData,
        headers: {
          Origin: "https://example.com",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(403);
  });
});
