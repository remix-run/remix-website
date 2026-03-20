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

async function gotoMobileMenuPage(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  let response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  await page.waitForLoadState("networkidle");
}

test.describe("Mobile menu", () => {
  test("opens and shows navigation links", async ({ page }) => {
    await gotoMobileMenuPage(page);

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
    await gotoMobileMenuPage(page);

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
    await expect(mobileNav).not.toBeVisible();
    await expect(menuToggle).toBeFocused();
  });

  test("mobile menu links navigate", async ({ page }) => {
    await gotoMobileMenuPage(page);

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
