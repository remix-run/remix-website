import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import type { BlogPostListing } from "../../data/blog.ts";
import { buildBlogRssResponse } from "./rss.ts";

describe("buildBlogRssResponse", () => {
  it("lists posts in order with canonical links", async () => {
    let response = buildBlogRssResponse(
      [
        post("newer", new Date("2026-02-01T00:00:00Z")),
        post("older", new Date("2026-01-01T00:00:00Z")),
      ],
      new URL("https://remix-website-staging.fly.dev/blog/rss.xml"),
    );

    expect(response.headers.get("Content-Type")).toBe("application/xml");
    let xml = await response.text();
    let links = [...xml.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>/g)].map(
      (match) => match[1],
    );
    expect(links).toEqual([
      "https://remix.run/blog/newer",
      "https://remix.run/blog/older",
    ]);
    // The feed's last-updated date is the newest post's date.
    expect(xml).toContain(
      `<lastBuildDate>${new Date("2026-02-01T00:00:00Z").toUTCString()}</lastBuildDate>`,
    );
  });

  it("builds an empty feed when there are no posts", async () => {
    let response = buildBlogRssResponse(
      [],
      new URL("http://localhost:3000/blog/rss.xml"),
    );

    let xml = await response.text();
    expect(xml).toContain("<link>http://localhost:3000/blog</link>");
    expect(xml).not.toContain("<item>");
  });
});

function post(slug: string, date: Date): BlogPostListing {
  return {
    slug,
    title: `Post ${slug}`,
    summary: `Summary for ${slug}`,
    date,
    dateDisplay: date.toDateString(),
    image: "/blog-images/example.png",
    imageAlt: "",
  };
}
