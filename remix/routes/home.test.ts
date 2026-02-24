import { describe, expect, it } from "vitest";
import { createRouter } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";
import { asyncContext } from "remix/async-context-middleware";
import HomeRoute from "./home";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { routes } from "../routes";
import { ROUTER_STORAGE_KEY } from "../utils/request-context";

describe("Home route", () => {
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
    router.map(routes.home, HomeRoute);

    const response = await router.fetch("http://localhost:3000/");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    const html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("Remix - A Full Stack Framework Built on Web APIs");
    expect(html).toContain("Remix 3 is under active development.");
    expect(html).toContain('class="marketing-home"');
    expect(html).toContain('content="http://localhost:3000/"');
    expect(html).toContain("#github");
    expect(html).toContain("og:title");
    expect(html).toContain("twitter:card");
  });
});
