import { describe, expect, it } from "vitest";
import { brandHandler } from "./brand";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { routes } from "../routes";
import { createRouteTestRouter } from "../test-utils/create-route-test-router";

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
    expect(html).toContain('href="/_brand/remix-light.svg"');
    expect(html).toContain("#github");
  });
});
