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
