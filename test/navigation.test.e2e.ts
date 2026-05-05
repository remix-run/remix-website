import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { afterAll, beforeAll, describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { swallowAbortErrors } from "../test/setup.ts";

let server!: { baseUrl: string; close: () => Promise<void> };
let closeServer: () => Promise<void>;

beforeAll(async () => {
  let handler = swallowAbortErrors(router);
  let realServer = await createTestServer(handler);
  server = { baseUrl: realServer.baseUrl, close: async () => {} };
  closeServer = () => realServer.close();
});

afterAll(async () => {
  await closeServer();
});

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
  await page.waitForLoadState("networkidle");
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
  it("home page renders landing content and keeps the skip target", async (t) => {
    let page = await t.serve(server);
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "A web framework for building anything",
      }),
    ).toBeVisible();
    await expect(page.locator("main#main-content")).toHaveCount(1);
  });

  it("home page blog keyboard shortcut uses client navigation", async (t) => {
    let page = await t.serve(server);
    await page.goto("/", { waitUntil: "networkidle" });
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

  it("home page jam keyboard shortcut uses client navigation", async (t) => {
    let page = await t.serve(server);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", {
        name: "A web framework for building anything",
      }),
    ).toBeVisible();
    await expectLandingNavReady(page);

    await expectClientNavigation(
      page,
      () => page.keyboard.press("j"),
      "**/jam/2025",
    );
    await expect(
      page.getByRole("heading", { level: 1, name: /Remix Jam/i }),
    ).toBeVisible();
  });

  it("active development route header links use client navigation", async (t) => {
    let page = await t.serve(server);
    await page.goto("/remix-3-active-development", {
      waitUntil: "networkidle",
    });

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/blog"]').first().click(),
      "**/blog",
    );

    await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
  });

  it("blog to home page applies forced dark mode", async (t) => {
    let page = await t.serve(server);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/blog", { waitUntil: "networkidle" });

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

  it("blog header jam link uses client navigation", async (t) => {
    let page = await t.serve(server);
    await page.goto("/blog", { waitUntil: "networkidle" });

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/jam/2025"]').first().click(),
      "**/jam/2025",
    );

    await expect(
      page.getByRole("heading", { level: 1, name: /Remix Jam/i }),
    ).toBeVisible();
  });

  it("Remix 3 active development page to jam applies jam head styles and forced dark theme", async (t) => {
    let page = await t.serve(server);
    await page.goto("/remix-3-active-development", {
      waitUntil: "networkidle",
    });

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

  it("header wordmark context menu uses client navigation for brand", async (t) => {
    let page = await t.serve(server);
    await page.goto("/blog", { waitUntil: "networkidle" });

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
