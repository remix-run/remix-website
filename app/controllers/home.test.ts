import { describe, expect, it } from "vitest";
import { homeHandler } from "./home";
import { CACHE_CONTROL } from "../utils/cache-control";
import { routes } from "../routes";
import { createRouteTestRouter } from "../../test/create-route-test-router";

describe("home route", () => {
  it("renders the landing document shell", async () => {
    let router = createRouteTestRouter();
    router.map(routes.home, homeHandler);

    let response = await router.fetch("http://localhost:3000/");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("Remix - A Web Framework for Building Anything");
    expect(html).toContain('id="main-content"');
    expect(html).toContain('id="remix-landing-app"');
    expect(html).toContain('src="/landing/remix-runner.gif"');
    expect(html).toContain("Loading Remix homepage");
    expect(html).toContain("@property --brand-cycle");
    expect(html).toContain("color-scheme: dark");
    expect(html).toContain('content="http://localhost:3000/"');
    expect(html).toContain(
      'content="http://localhost:3000/blog-images/social-background.png"',
    );
    expect(html).toContain('content="summary_large_image"');
    expect(html).toContain('href="/landing/favicon-dark-mode.svg"');
    expect(html).toContain(
      'href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&amp;display=swap"',
    );
    expect(html).not.toContain('href="/styles/app.css"');
    expect(html).toContain(
      '<link rel="modulepreload" href="/assets/app/assets/entry.ts"',
    );
    expect(html).toContain(
      '<script type="module" async src="/assets/app/assets/entry.ts"',
    );
  });
});
