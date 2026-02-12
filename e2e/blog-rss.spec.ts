import { test, expect } from "@playwright/test";

test.describe("Blog RSS endpoint", () => {
  test("returns XML with expected feed metadata", async ({ request }) => {
    const response = await request.get("/blog/rss.xml");

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/xml");

    const xml = await response.text();
    expect(xml).toContain("<rss");
    expect(xml).toContain("<title>Remix Blog</title>");
    expect(xml).toContain("<link>https://remix.run/blog</link>");
  });
});
