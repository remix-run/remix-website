import { describe, expect, it } from "vitest";
import { homeHandler } from "./home";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { routes } from "../routes";
import { createRouteTestRouter } from "../test-utils/create-route-test-router";

describe("Home route", () => {
  it("renders expected content and metadata", async () => {
    let router = createRouteTestRouter();
    router.map(routes.home, homeHandler);

    let response = await router.fetch("http://localhost:3000/");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

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
