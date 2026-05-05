import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { swallowAbortErrors } from "../test/setup.ts";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (window as Window & { __navMarker?: string }).__navMarker = marker;
    return marker;
  });
}

describe("Blog", () => {
  it("blog index loads and shows posts", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/i);
    // Should have at least one blog post link
    const postLinks = page.locator('a[href^="/blog/"]');
    await expect(postLinks.first()).toBeVisible();
  });

  it("clicking a blog post navigates to the post", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/blog");
    const firstPost = page.locator('a[href^="/blog/"]').first();
    const href = await firstPost.getAttribute("href");
    await firstPost.click();
    await page.waitForURL(`**${href}`);
    // Post page should have an article or main content
    await expect(page.locator("main")).toBeVisible();
  });

  it("relative internal links in rendered markdown use client navigation", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/blog/faster-lazy-loading", { waitUntil: "networkidle" });

    let marker = await markPage(page);
    let link = page.locator('main a[href^="/blog/"]').first();
    let href = await link.getAttribute("href");
    await expect(link).toBeVisible();
    expect(href).toBeTruthy();

    await link.click();
    await page.waitForLoadState("networkidle");
    let newMarker = await page.evaluate(
      () => (window as Window & { __navMarker?: string }).__navMarker,
    );
    expect(newMarker).toBe(marker);
    await expect(page.locator("main")).toBeVisible();
  });
});
