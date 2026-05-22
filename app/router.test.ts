import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { router } from "./router.ts";

describe("app router", () => {
  it("serves the healthcheck route", async () => {
    let response = await router.fetch("http://localhost/healthcheck");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).toBe("OK");
  });

  it("serves the blog RSS route", async () => {
    let response = await router.fetch("http://localhost/blog/rss.xml");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/xml");

    let xml = await response.text();
    expect(xml).toContain("<rss");
    expect(xml).toContain("<title>Remix Blog</title>");
    expect(xml).toContain("<link>https://remix.run/blog</link>");
  });

  it("allows same-origin browser form posts", async () => {
    let formData = new FormData();
    formData.set("theme", "dark");

    let response = await router.fetch(
      new Request("http://localhost/jam/2026/theme", {
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
      new Request("http://localhost/jam/2026/theme", {
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
      new Request("http://localhost/jam/2026/theme", {
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
      new Request("http://localhost/jam/2026/theme", {
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
