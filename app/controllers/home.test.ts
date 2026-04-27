import { describe, expect, it } from "vitest";
import { homeHandler } from "./home";
import { CACHE_CONTROL } from "../utils/cache-control";
import { routes } from "../routes";
import { createRouteTestRouter } from "../../test/create-route-test-router";

describe("home route", () => {
  it("renders the landing page document and mount point", async () => {
    let router = createRouteTestRouter();
    router.map(routes.home, homeHandler);

    let response = await router.fetch("http://localhost:3000/");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("Remix - A Web Framework for Building Anything");
    expect(html).toContain('id="remix-landing-app"');
    expect(html).toContain('aria-label="Loading Remix landing page"');
    expect(html).toContain('src="/landing/remix-runner.gif"');
    expect(html).toContain('content="http://localhost:3000/"');
    expect(html).toContain('href="/styles/app.css"');
  });
});
