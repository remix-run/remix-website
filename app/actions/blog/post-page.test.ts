import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import blogController from "./controller.tsx";
import { getBlogPost } from "../../data/blog.ts";
import { getBlogImageAsset } from "../../utils/blog-image-assets.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";

describe("Blog post route", () => {
  it("renders a post for a valid slug", async () => {
    let post = await getBlogPost("remix-v2");
    let router = createRouteTestRouter();
    router.map(routes.blog, blogController);

    let response = await router.fetch(
      new URL(
        routes.blog.post.href({ slug: "remix-v2" }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();
    expect(html).toContain(`<title>${post.title} | Remix</title>`);
    expect(html).toContain('id="main-content"');
    expect(html).toContain('rel="alternate"');
    expect(html).toContain('type="text/markdown"');
    expect(html).toContain(
      `href="${routes.blog.post.href({ slug: "remix-v2", ext: "md" })}"`,
    );

    let heroAsset = await getBlogImageAsset(post.image);
    let heroImage = [...html.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g)]
      .map((match) => match[0])
      .find((image) => image.includes(`src="${heroAsset.src}"`));
    expect(heroImage).toContain('loading="eager"');
    expect(heroImage).toContain('fetchpriority="high"');
  });

  it("returns 404 for a non-existent slug", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blog, blogController);

    let response = await router.fetch(
      new URL(
        routes.blog.post.href({ slug: "this-slug-does-not-exist" }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(404);
  });
});
