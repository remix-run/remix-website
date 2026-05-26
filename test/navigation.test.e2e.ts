import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { swallowAbortErrors } from "../test/setup.ts";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (window as Window & { __navMarker?: string }).__navMarker = marker;
    return marker;
  });
}

async function expectClientNavigation(
  page: Page,
  navigate: () => Promise<void>,
  url: string,
) {
  let marker = await markPage(page);
  await navigate();
  await page.waitForURL(url);
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __navMarker?: string }).__navMarker,
      ),
    )
    .toBe(marker);
}

async function expectLandingNavReady(page: Page) {
  await expect(
    page.locator('nav[aria-label="Primary"] a[href="/blog"]').first(),
  ).toBeVisible();
}

describe("Navigation", () => {
  it("home/blog navigation stays client-side and applies forced dark mode", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "A web framework for building anything",
      }),
    ).toBeVisible();
    await expectLandingNavReady(page);

    await expectClientNavigation(
      page,
      () => page.keyboard.press("b"),
      "**/blog",
    );
    await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
    await expect(page.locator('html[data-theme="light"]')).toHaveCount(0);
    await expect(page.locator("html.dark")).toHaveCount(1);

    await expectClientNavigation(
      page,
      () => page.locator('header a[aria-label="Remix"]').first().click(),
      "**/",
    );

    await expect(page.locator('html[data-theme="dark"]')).toHaveCount(1);
    await expect(page.locator("html.dark")).toHaveCount(1);
  });

  it("Remix 3 active development page to Jam 2026 applies Jam head content", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/remix-3-active-development");

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/jam/2026"]').first().click(),
      "**/jam/2026",
    );

    await expect(page).toHaveTitle("Remix Jam 2026");
    await expect
      .poll(() =>
        page.evaluate(() => {
          return document
            .querySelector('link[rel="canonical"]')
            ?.getAttribute("href");
        }),
      )
      .toBe(`${page.url()}`);
  });

  it("header wordmark context menu uses client navigation for brand", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/blog");

    let remixLink = page.locator('header a[aria-label="Remix"]').first();
    await expectClientNavigation(
      page,
      () => remixLink.click({ button: "right" }),
      "**/brand",
    );

    await expect(
      page.getByRole("heading", { name: "Remix Brand" }),
    ).toBeVisible();
  });
});
