import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import blogController from "./controller.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";

describe("Blog route", () => {
  it("renders expected content and metadata", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blog, blogController);

    let response = await router.fetch("http://localhost:3000/blog");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("<title>Remix Blog</title>");
    expect(html).toContain(
      "Thoughts about building excellent user experiences with Remix.",
    );
    expect(html).toContain("Featured Articles");
    expect(html).toContain('action="/_actions/newsletter"');

    let mainNavigation = html.match(/<nav aria-label="Main".*?<\/nav>/s)?.[0];
    if (!mainNavigation) throw new Error("Missing main navigation");

    let navigationLinks = [
      ...mainNavigation.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g),
    ].map((match) => ({ href: match[1], label: match[2] }));

    expect(navigationLinks).toEqual([
      { href: "https://guides.remix.run", label: "Guides" },
      { href: "https://api.remix.run", label: "API" },
      { href: routes.blog.index.href(), label: "Blog" },
      { href: routes.jam.y2026.index.href(), label: "Jam" },
      { href: "https://shop.remix.run", label: "Store" },
      { href: "https://github.com/remix-run/remix", label: "GitHub" },
    ]);
  });

  it("lists post links newest first", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blog, blogController);

    let response = await router.fetch("http://localhost:3000/blog");
    let html = await response.text();

    let main = html.match(/<main[^>]*>.*<\/main>/s)?.[0];
    if (!main) throw new Error("Missing main content");

    let postLinks = [...main.matchAll(/href="\/blog\/[^"]+"/g)];
    expect(postLinks.length).toBeGreaterThan(1);

    let dates = [
      ...main.matchAll(/<p class="rmx-page-meta">([^<]+)<\/p>/g),
    ].map((match) => new Date(match[1]).getTime());
    expect(dates.length).toBeGreaterThan(1);
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });
});
