import { describe, expect, it } from "vitest";
import { brandHandler } from "./brand";
import { CACHE_CONTROL } from "../utils/cache-control";
import { routes } from "../routes";
import { createRouteTestRouter } from "../../test/create-route-test-router";

describe("Brand route", () => {
  it("renders expected content and metadata", async () => {
    let router = createRouteTestRouter();
    router.map(routes.brand, brandHandler);

    let response = await router.fetch("http://localhost:3000/brand");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("Remix Assets and Branding Guidelines");
    expect(html).toContain("Remix Brand");
    expect(html).toContain("Trademark Usage Agreement");
    expect(html).toContain('href="/_brand/remix-logo-light-mode.svg"');
    expect(html).toContain('href="/_brand/remix-wordmark-color.svg"');
    expect(html).toContain('href="/_brand/remix-run-share-thumbnail.png"');
    expect(html).toContain(
      'content="http://localhost:3000/_brand/remix-run-share-thumbnail.png"',
    );
    expect(html).toContain("#github");
  });
});
