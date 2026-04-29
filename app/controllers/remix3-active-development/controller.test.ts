import { describe, expect, it } from "vitest";
import { remix3ActiveDevelopmentHandler } from "./controller";
import { CACHE_CONTROL } from "../../utils/cache-control";
import { routes } from "../../routes";
import { createRouteTestRouter } from "../../../test/create-route-test-router";

describe("Remix 3 active development route", () => {
  it("renders expected content and metadata", async () => {
    let router = createRouteTestRouter();
    router.map(routes.remix3ActiveDevelopment, remix3ActiveDevelopmentHandler);

    let response = await router.fetch("http://localhost:3000/");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain('href="/styles/app.css"');
    expect(html).toContain('class="marketing-remix3-active-development"');
    expect(html).toContain('content="http://localhost:3000/"');
    expect(html).toContain("#github");
    expect(html).toContain("og:title");
    expect(html).toContain("twitter:card");
  });
});
