import { test, expect } from "@playwright/test";

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
});
