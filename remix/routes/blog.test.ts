import { describe, expect, it } from "vitest";
import { createRouter } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";
import { asyncContext } from "remix/async-context-middleware";
import BlogRoute from "./blog";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { routes } from "../routes";
import { ROUTER_STORAGE_KEY } from "../utils/request-context";

describe("Blog route", () => {
  it("renders expected content and metadata", async () => {
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
    router.map(routes.blog, BlogRoute);

    let response = await router.fetch("http://localhost:3000/blog");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("<title>Remix Blog</title>");
    expect(html).toContain(
      "Thoughts about building excellent user experiences with Remix.",
    );
    expect(html).toContain("Featured Articles");
    expect(html).toContain('action="/_actions/newsletter"');
  });
});
