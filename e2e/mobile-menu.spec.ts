import { test, expect } from "@playwright/test";

test.describe("Mobile menu", () => {
  test("opens and shows navigation links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    let menuToggle = page.locator('summary[aria-label="Open menu"]').first();
    await expect(menuToggle).toBeVisible();
    await menuToggle.focus();
    await menuToggle.press("Enter");

    let mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Jam" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Store" })).toBeVisible();
  });


});
