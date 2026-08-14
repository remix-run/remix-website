import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { getBlogPost, getBlogPostListings } from "./blog.ts";

describe("blog data", () => {
  it("formats date-only frontmatter in UTC", async () => {
    expect((await getBlogPost("brand-new")).dateDisplay).toBe("May 6, 2026");
  });

  it("lists published posts newest first", () => {
    let timestamps = getBlogPostListings().map(({ dateDisplay }) =>
      Date.parse(`${dateDisplay} UTC`),
    );

    expect(timestamps.length).toBeGreaterThan(1);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });
});
