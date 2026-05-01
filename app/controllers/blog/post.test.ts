import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { blogPostHandler } from "./post.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { getBlogPost } from "../../data/blog.server.ts";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/create-route-test-router.ts";

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
    expect(html).toContain('rel="alternate"');
    expect(html).toContain('href="/styles/md.css"');
    expect(html).toContain('type="text/markdown"');
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
