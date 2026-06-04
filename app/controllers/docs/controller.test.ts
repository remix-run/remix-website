import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";
import { docsController } from "./controller.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";

describe("Docs route", () => {
  it("renders the docs index with chapter and heading links", async () => {
    let router = createRouteTestRouter();
    router.map(routes.docs, docsController);

    let response = await router.fetch("http://localhost:3000/docs");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();
    expect(html).toContain("Learn Remix from the request up.");
    expect(html).toContain('href="/docs/start-here"');
    expect(html).toContain(
      'href="/docs/start-here#the-core-model-request-middleware-router-controller-response"',
    );
    expect(html).toContain('href="/docs/tutorials"');
    expect(html).toContain("api.remix.run");
  });

  it("renders a docs chapter with section headings", async () => {
    let router = createRouteTestRouter();
    router.map(routes.docs, docsController);

    let response = await router.fetch(
      "http://localhost:3000/docs/interactivity",
    );

    expect(response.status).toBe(200);

    let html = await response.text();
    expect(html).toContain("<title>Interactivity | Remix Docs</title>");
    expect(html).toContain("Progressive enhancement");
    expect(html).toContain('id="frames-and-partial-server-rendered-ui"');
    expect(html).toContain("Placeholder for Progressive enhancement.");
    expect(html).toContain('href="/docs/rendering-ui"');
    expect(html).toContain('href="/docs/animation"');
  });

  it("returns 404 for unknown docs chapters", async () => {
    let router = createRouteTestRouter();
    router.map(routes.docs, docsController);

    let response = await router.fetch("http://localhost:3000/docs/not-real");

    expect(response.status).toBe(404);
  });
});
