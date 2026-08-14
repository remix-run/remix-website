import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import { swallowAbortErrors } from "../test/setup.ts";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (window as Window & { __navMarker?: string }).__navMarker = marker;
    return marker;
  });
}

describe("Blog", () => {
  it("relative internal links in rendered markdown use client navigation", async (t) => {
    let handler = swallowAbortErrors(createAppRouter());
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.blog.post.href({ slug: "faster-lazy-loading" }));

    let marker = await markPage(page);
    let link = page.locator('main a[href^="/blog/"]').first();
    await expect(link).toBeVisible();
    let href = await link.getAttribute("href");
    if (!href) throw new Error("Expected an internal blog link");

    await link.click();
    await page.waitForURL(`**${href}`);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as Window & { __navMarker?: string }).__navMarker,
      ),
    ).toBe(marker);
  });
});
