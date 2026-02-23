import { test, expect } from "@playwright/test";

test.describe("Mobile menu", () => {
  test("opens and shows navigation links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto("/remix-home");
    expect(response?.ok()).toBe(true);

    const menuToggle = page.locator("summary").filter({ hasText: "Open menu" });
    await expect(menuToggle).toBeVisible();
    await menuToggle.focus();
    await menuToggle.press("Enter");

    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Jam" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Store" })).toBeVisible();
  });
});
