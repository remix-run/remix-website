import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { beforeEach, describe, it } from "remix/test";

import { DOCUMENT_REDIRECT_HEADER } from "../app/actions/public/document-redirect.ts";
import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import type { NewsletterRepository } from "../app/actions/newsletter/archive.ts";
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

let newsletterIssueRepository: NewsletterRepository = {
  async listSummaries() {
    return [];
  },
  async getIssue(number) {
    return number === 1
      ? {
          number: 1,
          date: new Date("2024-01-01T00:00:00.000Z"),
          title: "Remix Newsletter #1",
          markdown: "# Remix Newsletter #1\\n\\nThe latest Remix news.",
          image: null,
        }
      : null;
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
        main?.querySelector('a[href^="/blog/"]') &&
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

  it("keeps the shared header link order on desktop and mobile", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.blog.index.href());

    let expectedLinks = [
      "Guides",
      "API",
      "GitHub",
      "Blog",
      "Newsletter",
      "Jam",
      "Store",
    ];
    await expect(page.locator('header nav[aria-label="Main"] a')).toHaveText(
      expectedLinks,
    );
    await expect(page.locator('header nav[aria-label="Mobile"] a')).toHaveText(
      expectedLinks,
    );
  });

  it("marks the current shared section on index and detail pages", async (t) => {
    let handler = swallowAbortErrors(
      createAppRouter({ newsletterRepository: newsletterIssueRepository }),
    );
    let page = await t.serve(await createTestServer(handler));

    for (let [href, sectionHref] of [
      [routes.blog.index.href(), routes.blog.index.href()],
      [routes.blog.post.href({ slug: "remix-v2" }), routes.blog.index.href()],
      [routes.newsletter.index.href(), routes.newsletter.index.href()],
      [
        routes.newsletter.issue.href({ number: 1 }),
        routes.newsletter.index.href(),
      ],
    ] as const) {
      await page.goto(href);
      for (let navLabel of ["Main", "Mobile"]) {
        let nav = page.locator(`header nav[aria-label="${navLabel}"]`);
        let currentLink = nav.locator(`a[href="${sectionHref}"]`);
        await expect(currentLink).toHaveAttribute("aria-current", "page");
        await expect(currentLink).toHaveCSS("color", "rgb(0, 116, 192)");
        await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
      }
    }
  });

  it("does not mark links current when no section is selected", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.brand.href());

    for (let navLabel of ["Main", "Mobile"]) {
      let nav = page.locator(`header nav[aria-label="${navLabel}"]`);
      await expect(nav.locator('a[aria-current="page"]')).toHaveCount(0);
    }
  });

  it("uses the active color without an underline for nav hover", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.blog.index.href());

    let apiLink = page
      .locator('header nav[aria-label="Main"] a')
      .filter({ hasText: "API" });
    await apiLink.hover();

    await expect(apiLink).toHaveCSS("color", "rgb(0, 116, 192)");
    await expect(apiLink).toHaveCSS("text-decoration-line", "none");

    let currentLink = page.locator('header nav[aria-label="Main"] a').filter({
      hasText: "Blog",
    });
    await currentLink.hover();

    await expect(currentLink).toHaveCSS("color", "rgb(0, 116, 192)");
    await expect(currentLink).toHaveCSS("text-decoration-line", "none");
  });

  it("keeps the homepage navigation in the shared order", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.home.href());
    await expectLandingNavReady(page);

    let desktopLinks = page
      .locator('header nav[aria-label="Primary"]')
      .first()
      .locator("a");
    let mobileLinks = page
      .locator('header nav[aria-label="Primary"]')
      .last()
      .locator("a");

    expect(await desktopLinks.allTextContents()).toEqual([
      "[G] guides",
      "[A] api",
      "[H] github",
      "[B] blog",
      "[N] newsletter",
      "[J] jam",
      "[S] store",
    ]);
    expect(await mobileLinks.allTextContents()).toEqual([
      "guides",
      "api",
      "github",
      "blog",
      "newsletter",
      "jam",
      "store",
    ]);
  });

  it("switches to the menu before hiding the homepage scroll hint", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.home.href());

    let desktopNav = page.locator('header nav[aria-label="Primary"]').first();
    let menuButton = page.getByRole("button", { name: "Open menu" });
    let scrollHint = page.getByText("scroll or press ↓ and ↑", { exact: true });

    await page.setViewportSize({ width: 1024, height: 720 });
    await expect(desktopNav).toBeVisible();
    await expect(menuButton).toBeHidden();
    await expect(scrollHint).toBeVisible();

    await page.setViewportSize({ width: 1023, height: 720 });
    await expect(desktopNav).toBeHidden();
    await expect(menuButton).toBeVisible();
    await expect(scrollHint).toBeVisible();

    await page.setViewportSize({ width: 640, height: 720 });
    await expect(scrollHint).toBeVisible();

    await page.setViewportSize({ width: 639, height: 720 });
    await expect(scrollHint).toBeHidden();
  });

  it("activates blog post typography on client navigation", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.blog.index.href());

    let postHref = routes.blog.post.href({ slug: "react-router-v8" });
    await expectClientNavigation(
      page,
      () => page.locator(`main a[href="${postHref}"]`).first().click(),
      `**${postHref}`,
    );

    await expect(page.locator(".md-prose p").first()).toHaveCSS(
      "margin-top",
      "32px",
    );
  });

  it("home/blog navigation stays client-side and syncs document state", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(routes.home.href());
    await expect(
      page.locator("main #fully-stacked-web-framework"),
    ).toBeVisible();
    await expectLandingNavReady(page);
    await trackUnstyledBlogFrames(page);

    await expectClientNavigation(
      page,
      () => page.keyboard.press("b"),
      `**${routes.blog.index.href()}`,
    );
    await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
    let hero = page.locator('main img[src*="/assets/blog-images/"]').first();
    let heroSizes = await hero.getAttribute("sizes");
    let heroSrcSet = await hero.getAttribute("srcset");
    if (!heroSizes || !heroSrcSet) {
      throw new Error("Expected responsive blog hero attributes");
    }
    let heroPreload = page.locator('link[rel="preload"][as="image"]');
    await expect(heroPreload).toHaveAttribute("imagesizes", heroSizes);
    await expect(heroPreload).toHaveAttribute("imagesrcset", heroSrcSet);
    await expect(heroPreload).toHaveAttribute("fetchpriority", "high");
    await expect(page.locator("body")).toHaveCSS("margin", "0px");

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
    await page.route(
      `**${routes.newsletter.subscribe.href()}`,
      async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 204,
          headers: { [DOCUMENT_REDIRECT_HEADER]: routes.brand.href() },
        });
      },
    );
    await page.goto(routes.newsletter.index.href());
    await markPage(page);

    await page.evaluate((newsletterAction) => {
      let form = document.createElement("form");
      form.action = newsletterAction;
      form.method = "post";
      document.body.append(form);
      form.requestSubmit();
    }, routes.newsletter.subscribe.href());

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
