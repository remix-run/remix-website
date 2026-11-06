import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import {
  getBlogPost,
  getBlogPostListings,
  getRawBlogPostMarkdown,
} from "./blog.ts";

describe("blog data", () => {
  it("formats date-only frontmatter in UTC", async () => {
    expect((await getBlogPost("brand-new"))?.dateDisplay).toBe("May 6, 2026");
  });

  it("lists published posts newest first", () => {
    let timestamps = getBlogPostListings().map(({ date }) => date.getTime());

    expect(timestamps.length).toBeGreaterThan(1);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("returns null for unknown slugs", async () => {
    expect(await getBlogPost("does-not-exist")).toBe(null);
    expect(getRawBlogPostMarkdown("does-not-exist")).toBe(null);
  });

  it("reloads changed posts outside production", async () => {
    let slug = `test-live-blog-${process.pid}`;
    let postPath = path.join(process.cwd(), "data", "posts", `${slug}.md`);

    try {
      writeFileSync(postPath, testPost({ title: "Before edit" }));
      expect((await getBlogPost(slug))?.title).toBe("Before edit");

      writeFileSync(postPath, testPost({ title: "After edit" }));
      expect((await getBlogPost(slug))?.title).toBe("After edit");
    } finally {
      rmSync(postPath, { force: true });
    }
  });

  it("rejects posts with invalid frontmatter", async () => {
    let slug = `test-invalid-blog-${process.pid}`;
    let postPath = path.join(process.cwd(), "data", "posts", `${slug}.md`);

    try {
      writeFileSync(postPath, testPost({ title: "Missing date", date: "" }));
      await expect(getBlogPost(slug)).rejects.toThrow(
        `Invalid post frontmatter in ${slug}`,
      );
    } finally {
      rmSync(postPath, { force: true });
    }
  });
});

function testPost({
  title,
  date = "date: 2026-08-27",
}: {
  title: string;
  date?: string;
}) {
  return `---
title: ${title}
summary: Test post for live blog data.
${date}
draft: true
authors:
  - Brooks Lybrand
image: /blog-images/headers/remix-3-beta-preview.png
imageAlt: Test image
---
`;
}
