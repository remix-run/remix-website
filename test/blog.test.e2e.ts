import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import { swallowAbortErrors } from "../test/setup.ts";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (window as Window & { __navMarker?: string }).__navMarker = marker;
    return marker;
  });
}

describe("Blog", () => {
  it("delivers one correctly sized priority hero request on mobile", async (t) => {
    let handler = swallowAbortErrors(createAppRouter());
    let page = await t.serve(await createTestServer(handler));
    let cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 412,
      height: 823,
      deviceScaleFactor: 1.75,
      mobile: true,
    });

    await page.goto(routes.blog.index.href());
    let hero = page.locator('main img[src*="/assets/blog-images/"]').first();
    await expect(hero).toBeVisible();
    await expect
      .poll(() => hero.evaluate((image) => image.complete))
      .toBe(true);

    let delivery = await page.evaluate(() => {
      let hero = document.querySelector<HTMLImageElement>(
        'main img[src*="/assets/blog-images/"]',
      );
      let preload = document.querySelector<HTMLLinkElement>(
        'link[rel="preload"][as="image"]',
      );
      if (!hero || !preload) throw new Error("Expected hero preload and image");

      let heroPathname = new URL(hero.currentSrc).pathname;

      return {
        currentSrc: hero.currentSrc,
        heroSizes: hero.getAttribute("sizes"),
        heroSrcSet: hero.getAttribute("srcset"),
        preloadPriority: preload.fetchPriority,
        preloadSizes: preload.getAttribute("imagesizes"),
        preloadSrcSet: preload.getAttribute("imagesrcset"),
        resourceNames: performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((name) => new URL(name).pathname === heroPathname),
      };
    });

    expect(new URL(delivery.currentSrc).searchParams.get("transform")).toBe(
      "webp-640",
    );
    expect(delivery.preloadPriority).toBe("high");
    expect(delivery.preloadSizes).toBe(delivery.heroSizes);
    expect(delivery.preloadSrcSet).toBe(delivery.heroSrcSet);
    expect(delivery.resourceNames).toEqual([delivery.currentSrc]);
  });

  it("relative internal links in rendered markdown use client navigation", async (t) => {
    let handler = swallowAbortErrors(createAppRouter());
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.blog.post.href({ slug: "faster-lazy-loading" }), {
      timeout: 30_000,
    });

    let marker = await markPage(page);
    let link = page.locator('main a[href^="/blog/"]').first();
    await expect(link).toBeVisible();
    let href = await link.getAttribute("href");
    if (!href) throw new Error("Expected an internal blog link");

    await link.click();
    await page.waitForURL(`**${href}`);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as Window & { __navMarker?: string }).__navMarker,
      ),
    ).toBe(marker);
  });
});
