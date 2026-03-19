import { test, expect, type Page } from "@playwright/test";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (
      window as Window & { __mobileMenuNavMarker?: string }
    ).__mobileMenuNavMarker = marker;
    return marker;
  });
}

test.describe("Mobile menu", () => {
  test("opens and shows navigation links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    await expect(
      page.locator('[data-mobile-menu-ready="true"]').first(),
    ).toHaveCount(1);

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

  test("escapes back to toggle", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    await expect(
      page.locator('[data-mobile-menu-ready="true"]').first(),
    ).toHaveCount(1);

    let menuToggle = page.locator('summary[aria-label="Open menu"]').first();
    await expect(menuToggle).toBeVisible();
    await menuToggle.focus();
    await expect(menuToggle).toBeFocused();
    await menuToggle.click();

    let mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(mobileNav.getByRole("link", { name: "Blog" })).toBeFocused();

    await page.keyboard.press("Escape");
    // Hydration / keysEvents can lag briefly on CI; menu stays visible until escape is handled.
    await expect(mobileNav).not.toBeVisible({ timeout: 15_000 });
    await expect(menuToggle).toBeFocused();
  });

  test("mobile menu links navigate", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    let marker = await markPage(page);

    let menuToggle = page.locator('summary[aria-label="Open menu"]').first();
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    await page
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("link", {
        name: "Blog",
      })
      .click();

    await page.waitForURL("**/blog");
    await expect(page).toHaveTitle(/Blog/i);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { __mobileMenuNavMarker?: string })
              .__mobileMenuNavMarker,
        ),
      )
      .toBe(marker);
  });
});
