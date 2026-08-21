import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import blogController from "./controller.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
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
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<title>Remix Blog</title>");
    expect(html).toContain('id="main-content"');
    expect(html).toContain(`action="${routes.api.newsletter.href()}"`);
    expect(html).toContain(
      'data-remix-icons-sprite="/assets/app/ui/public/icons.svg"',
    );
    expect(html).toContain('href="/assets/app/ui/public/icons.svg#github"');

    let activeStylesheetHrefs = [
      ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g),
    ]
      .map((match) => match[0])
      .filter((link) => !link.includes('media="not all"'))
      .map((link) => link.match(/href="([^"]+)"/)?.[1]);
    expect(activeStylesheetHrefs).toEqual([
      "/assets/app/styles/public/generated/app.css",
      "/assets/app/styles/public/global.css",
    ]);

    let articleImages = [
      ...html.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g),
    ]
      .map((match) => match[0])
      .filter((image) => image.includes('src="/assets/blog-images/'));
    expect(articleImages.length > 1).toBe(true);
    expect(articleImages[0]).toContain('loading="eager"');
    expect(articleImages[0]).toContain('fetchpriority="high"');
    for (let image of articleImages.slice(1)) {
      expect(image).toContain('loading="lazy"');
      expect(image).toContain('decoding="async"');
    }
  });
});
