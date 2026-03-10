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
  test("homepage header links use client navigation", async ({ page }) => {
    await page.goto("/");

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/blog"]').first().click(),
      "**/blog",
    );

    await expect(page).toHaveTitle(/Blog/i);
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

  test("header wordmark uses client navigation for home and brand", async ({ page }) => {
    await page.goto("/blog");

    let homeLink = page.locator('header a[aria-label="Remix"]').first();
    await expectClientNavigation(page, () => homeLink.click(), "**/");
    await expect(page).toHaveURL(/\/$/);

    await expectClientNavigation(
      page,
      () => homeLink.click({ button: "right" }),
      "**/brand",
    );

    await expect(page).toHaveTitle(/Branding Guidelines/i);
  });
});
