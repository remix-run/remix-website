import { describe, expect, it } from "vitest";
import { blogHandler } from "./controller";
import { CACHE_CONTROL } from "../../utils/cache-control";
import { routes } from "../../routes";
import { createRouteTestRouter } from "../../../test/create-route-test-router";

describe("Blog route", () => {
  it("renders expected content and metadata", async () => {
    let router = createRouteTestRouter();
    router.map(routes.blog, blogHandler);

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
  });
});
