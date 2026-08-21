import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import rootController from "./controller.tsx";
import { routes } from "../routes.ts";
import { CACHE_CONTROL } from "../utils/cache-control.ts";
import { createRouteTestRouter } from "../../test/setup.ts";

describe("home route", () => {
  it("renders the landing document with its critical resources", async () => {
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

    let fontPreloadLinks = [...html.matchAll(/<link[^>]+>/g)]
      .map((match) => match[0])
      .filter(
        (link) => link.includes('rel="preload"') && link.includes('as="font"'),
      );
    expect(
      fontPreloadLinks.map((link) => link.match(/href="([^"]+)"/)?.[1]),
    ).toEqual(["/assets/app/styles/public/font/inter-roman-latin-var.woff2"]);
    expect(fontPreloadLinks[0]).toContain('type="font/woff2"');
    expect(fontPreloadLinks[0]).toContain('crossorigin="anonymous"');

    let fontDeclarations =
      html.match(
        /<style[^>]+data-remix-fonts=""[^>]*>[\s\S]*?<\/style>/,
      )?.[0] ?? "";
    for (let filename of [
      "inter-roman-latin-var.woff2",
      "inter-italic-latin-var.woff2",
      "jet-brains-mono.woff2",
    ]) {
      expect(fontDeclarations).toContain(
        `/assets/app/styles/public/font/${filename}`,
      );
    }
    expect(html.indexOf(fontDeclarations)).toBeLessThan(
      html.indexOf('rel="stylesheet"'),
    );

    let stylesheetHrefs: string[] = [];
    for (let match of html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)) {
      if (match[0].includes('media="not all"')) continue;
      let href = match[0].match(/href="([^"]+)"/)?.[1];
      if (href) stylesheetHrefs.push(href);
    }
    expect(stylesheetHrefs).toEqual([
      "/assets/app/styles/public/global.css",
      "/assets/app/styles/public/home.css",
    ]);
  });
});
