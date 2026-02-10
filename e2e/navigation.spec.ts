import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigating from homepage to blog", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/blog"]');
    await page.waitForURL("**/blog");
    await expect(page).toHaveTitle(/Blog/i);
  });

  test("navigating from blog back to homepage", async ({ page }) => {
    await page.goto("/blog");
    // Click the logo or home link in the header
    const homeLink = page.locator('header a[href="/"]').first();
    await homeLink.click();
    await page.waitForURL("/");
  });
});
