import { test, expect } from "@playwright/test";

test.describe("Blog", () => {
  test("blog index loads and shows posts", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/i);
    // Should have at least one blog post link
    const postLinks = page.locator('a[href^="/blog/"]');
    await expect(postLinks.first()).toBeVisible();
  });

  test("back and forward preserve blog navigation state", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("heading", { name: "Featured Articles" })).toBeVisible();

    const firstPost = page
      .locator('a[href^="/blog/"]:not([href="/blog/rss.xml"])')
      .first();
    const href = await firstPost.getAttribute("href");
    expect(href).toBeTruthy();

    await firstPost.click();
    await page.waitForURL(`**${href}`);
    await expect(page.locator(".md-prose")).toBeVisible();

    await page.goBack();
    await page.waitForURL("**/blog");
    await expect(page.getByRole("heading", { name: "Featured Articles" })).toBeVisible();

    await page.goForward();
    await page.waitForURL(`**${href}`);
    await expect(page.locator(".md-prose")).toBeVisible();

    await page.goBack();
    await page.waitForURL("**/blog");
    await expect(page.getByRole("heading", { name: "Featured Articles" })).toBeVisible();

    await page.goForward();
    await page.waitForURL(`**${href}`);
    await expect(page.locator(".md-prose")).toBeVisible();
    await expect(page.locator('link[href*="md.css"]')).toHaveCount(1);
  });
});
