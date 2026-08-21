import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import rootController from "./controller.tsx";
import { routes } from "../routes.ts";
import { CACHE_CONTROL } from "../utils/cache-control.ts";
import { createRouteTestRouter } from "../../test/setup.ts";

describe("home route", () => {
  it("renders the newsletter signup fragment", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);

    let response = await router.fetch(
      new URL(
        `${routes.homeNewsletterSignup.href()}?subscription=success`,
        "http://localhost:3000",
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    let html = await response.text();
    expect(html).toContain('data-rmx-target="newsletter-subscribe"');
    expect(html).toContain('data-rmx-reset-scroll="false"');
    expect(html).toContain("Got it! Please check your email");
  });

  it("renders the accessible landing document", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);

    let response = await router.fetch(
      new URL(routes.home.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();
    expect(html).toContain('id="main-content"');
    expect(html).toContain('id="remix-landing-app"');
    expect(html).toContain(
      '<source media="(prefers-reduced-motion: reduce)" srcset="/landing/remix-runner-static.png" type="image/png"',
    );

    let stylesheetHrefs: string[] = [];
    for (let match of html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)) {
      if (match[0].includes('media="not all"')) continue;
      let href = match[0].match(/href="([^"]+)"/)?.[1];
      if (href) stylesheetHrefs.push(href);
    }
    expect(stylesheetHrefs).toEqual(["/assets/app/styles/public/home.css"]);
    expect(html).toContain("data-remix-global-styles");
  });
});
