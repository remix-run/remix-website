import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import remixHistoryController from "./controller.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";

describe("Remix history route", () => {
  it("renders expected content and metadata", async () => {
    let router = createRouteTestRouter();
    router.map(routes.remixHistory, remixHistoryController);

    let response = await router.fetch(
      new URL(routes.remixHistory.index.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain('href="/styles/app.css"');
    expect(html).toContain('class="marketing-remix-history"');
    expect(html).toContain('content="http://localhost:3000/remix-history"');
    expect(html).toContain("#github");
    expect(html).toContain("Stay in the loop");
    expect(html).toContain("Remix Newsletter");
    expect(html).toContain('placeholder="name@example.com"');
    expect(html).toContain('action="/_actions/newsletter"');
    expect(html).toContain("og:title");
    expect(html).toContain("twitter:card");
  });
});
