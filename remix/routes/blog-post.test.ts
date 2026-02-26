import { describe, expect, it } from "vitest";
import { blogPostHandler } from "./blog-post";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { getBlogPost } from "../lib/blog.server";
import { routes } from "../routes";
import { createRouteTestRouter } from "../test-utils/create-route-test-router";

describe("Blog post route", () => {
  it("renders a post for a valid slug", async () => {
    let post = await getBlogPost("remix-v2");
    let router = createRouteTestRouter();
    router.map(routes.blogPost, blogPostHandler);

    let response = await router.fetch("http://localhost:3000/blog/remix-v2");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();
    expect(html).toContain(`<title>${post.title} | Remix</title>`);
    expect(html).toContain(post.summary);
    expect(html).toContain('class="md-prose"');
    expect(html).toContain("twitter:card");
    expect(html).toContain('action="/_actions/newsletter"');
    expect(html).toContain('rel="alternate" type="text/markdown"');
    expect(html).toContain(
      `href="${routes.blogPost.href({ slug: "remix-v2", ext: "md" })}"`,
    );
  });

  it("returns 404 for a non-existent slug", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blogPost, blogPostHandler);

    let response = await router.fetch(
      "http://localhost:3000/blog/this-slug-does-not-exist",
    );

    expect(response.status).toBe(404);
  });
});
