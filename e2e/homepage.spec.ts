import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders the page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Remix/i);
  });

  test("has a visible header with navigation", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("has a visible footer", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
