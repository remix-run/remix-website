import { describe, expect, it } from "vitest";
import { blogPostHandler } from "./blog-post";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { routes } from "../routes";
import { createRouteTestRouter } from "../test-utils/create-route-test-router";

describe("Blog markdown routes", () => {
  it("serves source markdown for a valid slug at /blog/:slug.md", async () => {
    let router = createRouteTestRouter();

    router.map(routes.blogPost, blogPostHandler);

    let response = await router.fetch("http://localhost:3000/blog/remix-v2.md");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let markdown = await response.text();
    expect(markdown).toContain("title:");
    expect(markdown).toContain("summary:");
  });

  it("returns 404 for missing markdown slug", async () => {
    let router = createRouteTestRouter();

    router.map(routes.blogPost, blogPostHandler);

    let response = await router.fetch(
      "http://localhost:3000/blog/this-slug-does-not-exist.md",
    );

    expect(response.status).toBe(404);
  });
});
