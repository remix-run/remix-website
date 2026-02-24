import { describe, it, expect } from "vitest";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { buildBlogRssResponse } from "./blog-rss";

describe("blog RSS route handler", () => {
  it("returns an RSS XML response with cache headers", async () => {
    let response = buildBlogRssResponse([
      {
        slug: "hello-world",
        title: "Hello World",
        summary: "A first post",
        date: new Date("2025-01-01T00:00:00.000Z"),
      },
    ]);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/xml");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let xml = await response.text();
    expect(xml).toContain("<rss");
    expect(xml).toContain("<title>Remix Blog</title>");
    expect(xml).toContain(
      "<description>Thoughts about building excellent user experiences with Remix.</description>",
    );
    expect(xml).toContain("<link>https://remix.run/blog/hello-world</link>");
  });
});
