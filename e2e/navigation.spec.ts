import { test, expect, type Page } from "@playwright/test";

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

test.describe("Navigation", () => {
  test("active development route header links use client navigation", async ({
    page,
  }) => {
    await page.goto("/remix-3-active-development");

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/blog"]').first().click(),
      "**/blog",
    );

    await expect(page).toHaveTitle(/Blog/i);
  });

  test("blog to Remix 3 active development page clears dark mode", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/blog");

    await expect(page.locator('html[data-theme="light"]')).toHaveCount(0);
    await expect(page.locator("html.dark")).toHaveCount(1);

    await expectClientNavigation(
      page,
      () => page.locator('header a[aria-label="Remix"]').first().click(),
      "**/remix-3-active-development",
    );

    await expect(page.locator('html[data-theme="light"]')).toHaveCount(1);
    await expect(page.locator("html.dark")).toHaveCount(0);
  });

  test("blog header jam link uses client navigation", async ({ page }) => {
    await page.goto("/blog");

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/jam/2025"]').first().click(),
      "**/jam/2025",
    );

    await expect(page).toHaveTitle(/Jam/i);
  });

  test("Remix 3 active development page to jam applies jam head styles and forced dark theme", async ({
    page,
  }) => {
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
            element.getAttribute("href")?.includes("jam.css"),
          ),
        ),
      )
      .toBe(true);
  });

  test("header wordmark uses client navigation for root and brand", async ({
    page,
  }) => {
    await page.goto("/blog");

    let remixLink = page.locator('header a[aria-label="Remix"]').first();
    await expectClientNavigation(page, () => remixLink.click(), "**/");
    await expect(page).toHaveURL(/\/$/);

    await expectClientNavigation(
      page,
      () => remixLink.click({ button: "right" }),
      "**/brand",
    );

    await expect(page).toHaveTitle(/Branding Guidelines/i);
  });
});
