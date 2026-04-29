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

function mobileMenuDetails(page: Page) {
  return page.locator('details:has(nav[aria-label="Mobile"])').first();
}

function mobileMenuToggle(page: Page) {
  // Summary name is only from `.sr-only` text; role/name matching is flaky in
  // Playwright for this client-hydrated `<details>`. Target the disclosure control
  // via the sibling nav the component always renders.
  return mobileMenuDetails(page).locator("> summary");
}

test.describe("Mobile menu", () => {
  test("opens and shows navigation links", async ({ page }) => {
    await gotoMobileMenuPage(page);

    let menuToggle = mobileMenuToggle(page);
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

    let menuToggle = mobileMenuToggle(page);
    await expect(menuToggle).toBeVisible();
    await menuToggle.focus();
    await expect(menuToggle).toBeFocused();
    await menuToggle.click();

    let mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(mobileNav.getByRole("link").first()).toBeFocused();

    await page.keyboard.press("Escape");
    // Prefer the live `open` property over nav visibility: panel nodes can stay
    // in the DOM and still look "visible" to Playwright while the menu is closed.
    await expect(mobileMenuDetails(page)).toHaveJSProperty("open", false);
    await expect(menuToggle).toBeFocused();
  });

  test("mobile menu links navigate", async ({ page }) => {
    await gotoMobileMenuPage(page);

    let marker = await markPage(page);

    let menuToggle = mobileMenuToggle(page);
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
