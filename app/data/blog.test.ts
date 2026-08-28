import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
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

  it("reloads changed posts outside production", async () => {
    let slug = `test-live-blog-${process.pid}`;
    let postPath = path.join(process.cwd(), "data", "posts", `${slug}.md`);
    let post = (title: string) => `---
title: ${title}
summary: Test post for live blog data.
date: 2026-08-27
draft: true
authors:
  - Brooks Lybrand
image: /blog-images/headers/remix-3-beta-preview.png
imageAlt: Test image
---
`;

    try {
      writeFileSync(postPath, post("Before edit"));
      expect((await getBlogPost(slug)).title).toBe("Before edit");

      writeFileSync(postPath, post("After edit"));
      expect((await getBlogPost(slug)).title).toBe("After edit");
    } finally {
      rmSync(postPath, { force: true });
    }
  });
});
