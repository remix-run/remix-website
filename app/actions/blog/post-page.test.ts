import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import blogController from "./controller.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { getBlogPost } from "../../data/blog.ts";
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
    expect(html).toContain(post.summary);
    expect(html).toContain('class="md-prose"');
    expect(html).toContain("twitter:card");
    expect(html).toContain('action="/_actions/newsletter"');
    expect(html).toContain('rel="alternate"');
    expect(html).toContain('href="/styles/md.css"');
    expect(html).toContain('type="text/markdown"');
    expect(html).toContain(
      `href="${routes.blog.post.href({ slug: "remix-v2", ext: "md" })}"`,
    );
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

  it("renders frontmatter date-only values without timezone offset", async () => {
    let post = await getBlogPost("brand-new");

    expect(post.dateDisplay).toBe("May 6, 2026");
  });
});
