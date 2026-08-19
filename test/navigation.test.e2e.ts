import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { beforeEach, describe, it } from "remix/test";

import { DOCUMENT_REDIRECT_HEADER } from "../app/actions/public/document-redirect.ts";
import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import type { NewsletterRepository } from "../app/data/newsletters.ts";
import { swallowAbortErrors } from "../test/setup.ts";

let emptyNewsletterRepository: NewsletterRepository = {
  async listSummaries() {
    return [];
  },
  async getIssue() {
    return null;
  },
  async getImage() {
    return null;
  },
};

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

async function trackUnstyledBlogFrames(page: Page) {
  await page.evaluate(() => {
    let navigationState = window as Window & {
      __sawUnstyledBlogFrame?: boolean;
    };
    navigationState.__sawUnstyledBlogFrame = false;

    let checkBlogStyles = () => {
      let main = document.querySelector("main");
      if (
        main?.classList.contains("flex") &&
        getComputedStyle(main).display !== "flex"
      ) {
        navigationState.__sawUnstyledBlogFrame = true;
      }
      requestAnimationFrame(checkBlogStyles);
    };
    requestAnimationFrame(checkBlogStyles);
  });
}

describe("Navigation", () => {
  let router: ReturnType<typeof createAppRouter>;

  beforeEach(() => {
    router = createAppRouter({
      newsletterRepository: emptyNewsletterRepository,
    });
  });

  it("home/blog navigation stays client-side and applies forced dark mode", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(routes.home.href());
    await expect(
      page.getByRole("heading", {
        name: "A web framework for building anything",
      }),
    ).toBeVisible();
    await expectLandingNavReady(page);
    await trackUnstyledBlogFrames(page);

    await expectClientNavigation(
      page,
      () => page.keyboard.press("b"),
      `**${routes.blog.index.href()}`,
    );
    await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
    expect(
      await page.evaluate(
        () =>
          (window as Window & { __sawUnstyledBlogFrame?: boolean })
            .__sawUnstyledBlogFrame,
      ),
    ).toBe(false);
    await expect(page.locator('html[data-theme="light"]')).toHaveCount(0);
    await expect(page.locator("html.dark")).toHaveCount(1);

    await expectClientNavigation(
      page,
      () => page.locator('header a[aria-label="Remix"]').first().click(),
      `**${routes.home.href()}`,
    );

    await expect(page.locator('html[data-theme="dark"]')).toHaveCount(1);
    await expect(page.locator("html.dark")).toHaveCount(1);
  });

  it("hands enhanced document redirects back to the browser", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.route(`**${routes.api.newsletter.href()}`, async (route) => {
      await route.fulfill({
        status: 204,
        headers: { [DOCUMENT_REDIRECT_HEADER]: routes.brand.href() },
      });
    });
    await page.goto(routes.newsletter.index.href());
    await markPage(page);

    await page.evaluate((newsletterAction) => {
      let form = document.createElement("form");
      form.action = newsletterAction;
      form.method = "post";
      document.body.append(form);
      form.requestSubmit();
    }, routes.api.newsletter.href());

    await page.waitForURL(`**${routes.brand.href()}`);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as Window & { __navMarker?: string }).__navMarker,
      ),
    ).toBe(undefined);
  });

  it("Remix history page to Jam 2026 applies Jam head content", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.remixHistory.index.href());

    await expectClientNavigation(
      page,
      () => page.locator('header a[href="/jam/2026"]').first().click(),
      `**${routes.jam.y2026.index.href()}`,
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

  it("landing nav to Jam 2026 stays client-side and Back restores the landing page", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.home.href());
    await expectLandingNavReady(page);

    await expectClientNavigation(
      page,
      () =>
        page
          .locator('nav[aria-label="Primary"] a[href="/jam/2026"]')
          .first()
          .click(),
      `**${routes.jam.y2026.index.href()}`,
    );
    await expect(page).toHaveTitle("Remix Jam 2026");

    await expectClientNavigation(
      page,
      async () => {
        await page.goBack();
      },
      `**${routes.home.href()}`,
    );
    await expectLandingNavReady(page);

    // The restored landing page is still interactive.
    await expectClientNavigation(
      page,
      () => page.keyboard.press("b"),
      `**${routes.blog.index.href()}`,
    );
  });

  it("header wordmark context menu uses client navigation for brand", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.blog.index.href());

    let remixLink = page.locator('header a[aria-label="Remix"]').first();
    await expectClientNavigation(
      page,
      () => remixLink.click({ button: "right" }),
      `**${routes.brand.href()}`,
    );

    await expect(
      page.getByRole("heading", { name: "Remix Brand" }),
    ).toBeVisible();
  });
});
