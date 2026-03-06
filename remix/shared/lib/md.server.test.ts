import { describe, expect, it } from "vitest";
import { processMarkdown } from "./md.server";

describe("processMarkdown", () => {
  it("applies per-request href resolvers even after the processor is cached", async () => {
    await processMarkdown("[External](https://remix.run)");

    let { html } = await processMarkdown("[Relative](./next-post)", {
      resolveHref(href) {
        return `/blog/${href.slice(2)}`;
      },
    });

    expect(html).toContain('href="/blog/next-post"');
  });
});
