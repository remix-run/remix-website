import { describe, expect, it } from "vitest";
import { createRouter } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";
import { asyncContext } from "remix/async-context-middleware";
import BlogPostRoute from "./blog-post";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { getBlogPost } from "../lib/blog.server";
import { routes } from "../routes";
import { ROUTER_STORAGE_KEY } from "../utils/request-context";

describe("Blog post route", () => {
  it("renders a post for a valid slug", async () => {
    let post = await getBlogPost("remix-v2");
    let router: Router;
    router = createRouter({
      middleware: [
        asyncContext(),
        (context, next) => {
          context.storage.set(ROUTER_STORAGE_KEY, router);
          return next();
        },
      ],
    });
    router.map(routes.blogPost, BlogPostRoute);

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
  });

  it("returns 404 for a non-existent slug", async () => {
    let router: Router;
    router = createRouter({
      middleware: [
        asyncContext(),
        (context, next) => {
          context.storage.set(ROUTER_STORAGE_KEY, router);
          return next();
        },
      ],
    });
    router.map(routes.blogPost, BlogPostRoute);

    let response = await router.fetch(
      "http://localhost:3000/blog/this-slug-does-not-exist",
    );

    expect(response.status).toBe(404);
  });
});
