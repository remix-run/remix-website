import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import rootController from "./controller.tsx";
import { CACHE_CONTROL } from "../utils/cache-control.ts";
import { routes } from "../routes.ts";
import { createRouteTestRouter } from "../../test/setup.ts";

describe("Brand route", () => {
  it("renders expected content and metadata", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);

    let response = await router.fetch(
      new URL(routes.brand.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("Remix Assets and Branding Guidelines");
    expect(html).toContain("Remix Brand");
    expect(html).toContain("Trademark Usage Agreement");
    expect(html).toContain('href="/_brand/remix-brand-assets.zip"');
    expect(html).toContain('href="/_brand/remix-logo-light-mode.svg"');
    expect(html).toContain('href="/_brand/remix-wordmark-color.svg"');
    expect(html).toContain(
      'content="http://localhost:3000/marketing/remix-run-share-thumbnail.png"',
    );
    expect(html).toContain("#github");
  });
});
