import { describe, expect, it } from "vitest";
import { homeHandler } from "./controller";
import { routes } from "../../routes";
import { CACHE_CONTROL } from "../../utils/cache-control";
import { createRouteTestRouter } from "../../../test/create-route-test-router";

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
    expect(html).toContain(
      "Remix is a batteries-included, ultra-productive, zero dependencies and bundler-free framework, ready to develop with in a agent-first world.",
    );
    expect(html).toContain('id="main-content"');
    expect(html).toContain('id="remix-landing-app"');
    expect(html).toContain("A web framework for building anything");
    expect(html).toContain("Closing the gap between the initial spark");
    expect(html).toContain("High-performance components in plain");
    expect(html).toContain(
      'rel="preload" href="/landing/remix-runner.gif" type="image/gif" as="image" fetchpriority="high"',
    );
    expect(html).toContain('src="/landing/remix-runner.gif"');
    expect(html).toContain('width="384"');
    expect(html).toContain('height="384"');
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchpriority="high"');
    expect(html).toContain("Loading Remix homepage");
    expect(html).toContain('content="http://localhost:3000/"');
    expect(html).toContain(
      'content="http://localhost:3000/blog-images/social-background.png"',
    );
    expect(html).toContain('content="summary_large_image"');
    expect(html).toContain('rel="icon" href="/favicon.ico" sizes="32x32"');
    expect(html).toContain(
      'rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any"',
    );
    expect(html).toContain('rel="preload" as="style" href="/styles/app.css"');
    expect(html).toContain('rel="preload" as="style" href="/styles/home.css"');
    expect(html).toContain('rel="preload" as="style" href="/styles/md.css"');
    expect(html).toContain('rel="preload" as="style" href="/styles/jam.css"');
    expect(html).toContain('rel="stylesheet" href="/styles/home.css"');
    expect(html).not.toContain('rel="stylesheet" href="/styles/app.css"');
    expect(html).not.toContain("fonts.googleapis.com");
    expect(html).not.toContain("fonts.gstatic.com");
    expect(html).toContain(
      '<link rel="modulepreload" href="/assets/app/assets/entry.ts"',
    );
    expect(html).toContain(
      '<script type="module" async src="/assets/app/assets/entry.ts"',
    );

    expect(html).toMatch(/class="loading-screen-overlay\b/);
    expect(html).not.toContain("@keyframes loading-screen-dismiss");
  });
});
