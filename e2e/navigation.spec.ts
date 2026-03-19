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
  // Native <a> clicks get a full document load, but programmatic `navigate()`
  // (Navigation API) does not fire `window` "load" again — default waitUntil
  // would time out (e.g. wordmark right-click → /brand).
  await page.waitForURL(url, { waitUntil: "commit" });
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __navMarker?: string }).__navMarker,
      ),
    )
    .toBe(marker);
}

test.describe("Navigation", () => {
  test("homepage header links use client navigation", async ({ page }) => {
    await page.goto("/");

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/blog"]').first().click(),
      "**/blog",
    );

    await expect(page).toHaveTitle(/Blog/i);
  });

  test("blog to home clears dark mode when home forces light theme", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/blog");

    await expect(page.locator('html[data-theme="light"]')).toHaveCount(0);
    await expect(page.locator("html.dark")).toHaveCount(1);

    await expectClientNavigation(
      page,
      () => page.locator('header a[aria-label="Remix"]').first().click(),
      "**/",
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

  test("home to jam applies jam head styles and forced dark theme", async ({
    page,
  }) => {
    await page.goto("/");

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

  test("header wordmark uses client navigation for home and brand", async ({
    page,
  }) => {
    await page.goto("/blog");

    let homeLink = page.locator('header a[aria-label="Remix"]').first();
    await expectClientNavigation(page, () => homeLink.click(), "**/");

    await expectClientNavigation(
      page,
      () =>
        homeLink.evaluate((el: HTMLElement) => {
          el.dispatchEvent(
            new MouseEvent("contextmenu", {
              bubbles: true,
              cancelable: true,
              view: window,
              button: 2,
              buttons: 2,
            }),
          );
        }),
      "**/brand",
    );

    await expect(page).toHaveTitle(/Branding Guidelines/i);
  });
});
