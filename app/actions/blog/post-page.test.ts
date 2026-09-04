import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import blogController from "./controller.tsx";
import { getBlogPost } from "../../data/blog.ts";
import {
  getAuthorImageAsset,
  getBlogImageAsset,
} from "../../utils/blog-image-assets.ts";
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
    let html = await response.text();
    expect(html).toContain(`<title>${post.title} | Remix</title>`);
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

    let author = post.authors[0];
    let authorAsset = await getAuthorImageAsset(author.avatar);
    let authorImage = [...html.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g)]
      .map((match) => match[0])
      .find((image) => image.includes(`src="${authorAsset.src}"`));
    expect(authorImage).toContain('srcset="');
    expect(authorImage).toContain('sizes="(min-width: 768px) 56px, 40px"');
    expect(authorImage).toContain(`width="${authorAsset.width}"`);
    expect(authorImage).toContain(`height="${authorAsset.height}"`);
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
