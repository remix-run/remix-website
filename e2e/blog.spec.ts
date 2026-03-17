import { test, expect, type Page } from "@playwright/test";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (window as Window & { __navMarker?: string }).__navMarker = marker;
    return marker;
  });
}

test.describe("Blog", () => {
  test("blog index loads and shows posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/i);
    // Should have at least one blog post link
    const postLinks = page.locator('a[href^="/blog/"]');
    await expect(postLinks.first()).toBeVisible();
  });

  test("clicking a blog post navigates to the post", async ({ page }) => {
    await page.goto("/blog");
    const firstPost = page.locator('a[href^="/blog/"]').first();
    const href = await firstPost.getAttribute("href");
    await firstPost.click();
    await page.waitForURL(`**${href}`);
    // Post page should have an article or main content
    await expect(page.locator("main")).toBeVisible();
  });

  test("relative internal links in rendered markdown use client navigation", async ({
    page,
  }) => {
    await page.goto("/blog/faster-lazy-loading");

    let marker = await markPage(page);
    let link = page.locator('main a[href^="/blog/"]').first();
    let href = await link.getAttribute("href");
    await expect(link).toBeVisible();
    expect(href).toBeTruthy();

    await link.click();
    await page.waitForURL(`**${href}`);
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as Window & { __navMarker?: string }).__navMarker,
        ),
      )
      .toBe(marker);
    await expect(page.locator("main")).toBeVisible();
  });
});
