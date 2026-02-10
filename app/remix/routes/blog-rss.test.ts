import { describe, it, expect } from "vitest";

describe("/blog/rss.xml", () => {
  it("returns a valid RSS XML response", async () => {
    const { default: handler } = await import("./blog-rss");
    const response = await handler();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/xml");
    expect(response.headers.get("Cache-Control")).toBeTruthy();

    const xml = await response.text();
    expect(xml).toContain("<rss");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("<title>Remix Blog</title>");
    expect(xml).toContain("https://remix.run/blog");
  });

  it("includes blog posts with links", async () => {
    const { default: handler } = await import("./blog-rss");
    const response = await handler();
    const xml = await response.text();

    // Should have at least one item
    expect(xml).toContain("<item>");
    expect(xml).toContain("<link>");
  });
});
