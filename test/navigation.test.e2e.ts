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
  it("home page blog keyboard shortcut uses client navigation", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
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
  });

  it("blog to home page applies forced dark mode", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/blog");

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

  it("Remix 3 active development page to jam applies jam head styles and forced dark theme", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/remix-3-active-development");

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/jam/2025"]').first().click(),
      "**/jam/2025",
    );

    await expect(page.locator('html[data-theme="dark"]')).toHaveCount(1);
    await expect(page.locator("html.dark")).toHaveCount(1);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(
            document.head.querySelectorAll('link[rel="stylesheet"]'),
          ).some((element) =>
            element.getAttribute("href")?.includes("jam-2025.css"),
          ),
        ),
      )
      .toBe(true);
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
