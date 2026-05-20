import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { swallowAbortErrors } from "../test/setup.ts";

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
  let response = await page.goto("/remix-3-active-development");
  expect(response?.ok()).toBe(true);
  await expect(mobileMenuToggle(page)).toBeVisible();
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

describe("Mobile menu", () => {
  it("opens, shows navigation links, and escapes back to toggle", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
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

    await page.keyboard.press("Tab");
    await expect(mobileNav.getByRole("link").first()).toBeFocused();

    await page.keyboard.press("Escape");
    // Prefer the live `open` property over nav visibility: panel nodes can stay
    // in the DOM and still look "visible" to Playwright while the menu is closed.
    await expect(mobileMenuDetails(page)).toHaveJSProperty("open", false);
    await expect(menuToggle).toBeFocused();
  });

  it("mobile menu links navigate", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
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
    await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
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
