import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
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
  let response = await page.goto(routes.remixHistory.index.href());
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
  it("keeps the shared header responsive and inside the viewport", async (t) => {
    let handler = swallowAbortErrors(createAppRouter());
    let page = await t.serve(await createTestServer(handler));
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(routes.blog.index.href());

    let details = mobileMenuDetails(page);
    let menuToggle = mobileMenuToggle(page);
    let mobileNavigation = details.getByRole("navigation", { name: "Mobile" });
    let desktopNavigation = page.getByRole("navigation", { name: "Main" });

    for (let width of [320, 720, 768, 880, 899]) {
      await page.setViewportSize({ width, height: 844 });
      await expect(details).toHaveJSProperty("open", false);
      await expect(menuToggle).toBeVisible();
      await expect(desktopNavigation).toBeHidden();
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
        )
        .toBe(true);

      await menuToggle.click();
      await expect(details).toHaveJSProperty("open", true);
      let bounds = await mobileNavigation.evaluate((element) => {
        let rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          viewportWidth: document.documentElement.clientWidth,
        };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth);
    }

    await page.setViewportSize({ width: 900, height: 844 });
    await expect(details).toHaveJSProperty("open", false);
    await expect(menuToggle).toBeHidden();
    await expect(desktopNavigation).toBeVisible();
  });

  it("mobile menu links navigate", async (t) => {
    let handler = swallowAbortErrors(createAppRouter());
    let page = await t.serve(await createTestServer(handler));
    await gotoMobileMenuPage(page);

    let marker = await markPage(page);

    let menuToggle = mobileMenuToggle(page);
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();
    await expect(mobileMenuDetails(page)).toHaveJSProperty("open", true);

    await mobileMenuDetails(page)
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("link", {
        name: "Blog",
      })
      .click();

    await page.waitForURL(`**${routes.blog.index.href()}`);
    await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
    await expect(mobileMenuDetails(page)).toHaveJSProperty("open", false);
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
