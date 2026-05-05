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
});
