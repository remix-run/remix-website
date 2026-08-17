import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import rootController from "./controller.tsx";
import { routes } from "../routes.ts";
import { CACHE_CONTROL } from "../utils/cache-control.ts";
import { createRouteTestRouter } from "../../test/setup.ts";

describe("home route", () => {
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
    for (let match of html.matchAll(
      /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g,
    )) {
      stylesheetHrefs.push(match[1]!);
    }
    expect(stylesheetHrefs).toEqual([
      "/assets/app/styles/public/global.css",
      "/assets/app/styles/public/home.css",
    ]);
  });
});
