import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import blogController from "./controller.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";

describe("Blog markdown routes", () => {
  it("serves source markdown for a valid slug at /blog/:slug.md", async () => {
    let router = createRouteTestRouter();

    router.map(routes.blog, blogController);

    let response = await router.fetch(
      new URL(
        routes.blog.post.href({ slug: "remix-v2", ext: "md" }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let markdown = await response.text();
    expect(markdown.startsWith("---\n")).toBe(true);
  });

  it("returns 404 for missing markdown slug", async () => {
    let router = createRouteTestRouter();

    router.map(routes.blog, blogController);

    let response = await router.fetch(
      new URL(
        routes.blog.post.href({
          slug: "this-slug-does-not-exist",
          ext: "md",
        }),
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(404);
  });
});
