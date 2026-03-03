import { test, expect } from "@playwright/test";

test.describe("Jam", () => {
  test("jam root redirects to jam 2025", async ({ page }) => {
    await page.goto("/jam");
    await page.waitForURL("**/jam/2025");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam 2025 page renders", async ({ page }) => {
    await page.goto("/jam/2025");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam ticket page renders", async ({ page }) => {
    await page.goto("/jam/2025/ticket");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam lineup page renders", async ({ page }) => {
    await page.goto("/jam/2025/lineup");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam faq page renders", async ({ page }) => {
    await page.goto("/jam/2025/faq");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam code of conduct page renders", async ({ page }) => {
    await page.goto("/jam/2025/coc");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam gallery page renders", async ({ page }) => {
    await page.goto("/jam/2025/gallery");
    await expect(page.locator("main")).toBeVisible();
  });
});
