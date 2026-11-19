import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import blogController from "./controller.tsx";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";

describe("Blog route", () => {
  it("renders the blog index document", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blog, blogController);

    let response = await router.fetch(
      new URL(routes.blog.index.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    let html = await response.text();

    expect(html).toContain("<title>Remix Blog</title>");
    expect(html).toContain('<symbol id="github"');
    expect(html).toContain('href="#github"');

    let activeStylesheetHrefs = [
      ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g),
    ]
      .map((match) => match[0])
      .filter((link) => !link.includes('media="not all"'))
      .map((link) => link.match(/href="([^"]+)"/)?.[1]);
    expect(activeStylesheetHrefs).toEqual([
      "/assets/app/styles/public/global.css",
    ]);
  });

  it("prefetches only links to briefly browser-cacheable pages", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blog, blogController);

    let response = await router.fetch(
      new URL(routes.blog.index.href(), "http://localhost:3000"),
    );
    let prefetchedHrefs = [...(await response.text()).matchAll(/<a\b[^>]*>/g)]
      .map((match) => match[0])
      .filter((tag) => tag.includes('data-rmx-prefetch="intent"'))
      .map((tag) => tag.match(/href="([^"]+)"/)?.[1]);

    expect(prefetchedHrefs).toContain(routes.newsletter.index.href());
    expect(prefetchedHrefs.some((href) => href?.startsWith("/blog/"))).toBe(
      true,
    );
    // These pages are not sent with a short browser max-age.
    expect(prefetchedHrefs).not.toContain(routes.home.href());
    expect(prefetchedHrefs).not.toContain(routes.blog.index.href());
    expect(prefetchedHrefs).not.toContain(routes.jam.y2026.index.href());
    expect(
      prefetchedHrefs.some((href) => /^https?:\/\//.test(href ?? "")),
    ).toBe(false);
  });

  it("prioritizes a responsive hero while deferring other post images", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blog, blogController);

    let response = await router.fetch(
      new URL(routes.blog.index.href(), "http://localhost:3000"),
    );
    let html = await response.text();
    let articleImages = [
      ...html.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g),
    ]
      .map((match) => match[0])
      .filter((image) => image.includes('src="/assets/blog-images/'));
    let heroImage = articleImages[0];
    if (!heroImage) throw new Error("Expected a blog hero image");

    expect(heroImage).toContain('loading="eager"');
    expect(heroImage).toContain('fetchpriority="high"');

    let imagePreload = [...html.matchAll(/<link[^>]+rel="preload"[^>]*>/g)]
      .map((match) => match[0])
      .find((link) => link.includes('as="image"'));
    if (!imagePreload) throw new Error("Expected a blog hero preload");

    let heroSizes = heroImage.match(/\ssizes="([^"]+)"/)?.[1];
    let heroSrcSet = heroImage.match(/\ssrcset="([^"]+)"/)?.[1];
    if (!heroSizes || !heroSrcSet) {
      throw new Error("Expected responsive blog hero attributes");
    }
    expect(imagePreload).toContain('fetchpriority="high"');
    expect(imagePreload).toContain(`imagesizes="${heroSizes}"`);
    expect(imagePreload).toContain(`imagesrcset="${heroSrcSet}"`);
    expect(html.indexOf(imagePreload)).toBeLessThan(
      html.indexOf('rel="stylesheet"'),
    );

    expect(articleImages.length > 1).toBe(true);
    for (let image of articleImages.slice(1)) {
      expect(image).toContain('loading="lazy"');
      expect(image).toContain('decoding="async"');
    }
  });
});
