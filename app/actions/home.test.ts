import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import rootController from "./controller.tsx";
import { routes } from "../routes.ts";
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
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Surrogate-Control")).toBe(null);
    expect(response.headers.get("Surrogate-Key")).toBe(null);
    let html = await response.text();
    expect(html).toContain('data-rmx-target="newsletter-subscribe"');
    expect(html).toContain('data-rmx-reset-scroll="false"');
    expect(html).toContain("Got it! Please check your email");
  });

  it("renders the landing document with its critical resources", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);

    let response = await router.fetch(
      new URL(routes.home.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=0, must-revalidate",
    );
    expect(response.headers.get("Surrogate-Control")).toBe(
      "max-age=300, stale-while-revalidate=604800",
    );
    expect(response.headers.get("Surrogate-Key")).toBe("documents");

    let html = await response.text();
    expect(html).toContain(
      'name="description" content="The fully-stacked web framework"',
    );
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
      [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)]
        .map((match) => match[0])
        .find((style) => style.includes("inter-roman-latin-var.woff2")) ?? "";
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
