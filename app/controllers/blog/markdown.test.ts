import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { blogPostHandler } from "./post.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/create-route-test-router.ts";

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
    expect(markdown).toContain("title: Remix v2");
    expect(markdown).toContain(
      "summary: The second major release of Remix is stable today.",
    );
    expect(markdown).toContain("We are excited to announce");
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
