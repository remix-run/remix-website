import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import remixHistoryController from "./controller.tsx";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";
import { routes } from "../../routes.ts";
import { createRouteTestRouter } from "../../../test/setup.ts";

describe("Remix history route", () => {
  it("renders the history document and newsletter form", async () => {
    let router = createRouteTestRouter();
    router.map(routes.remixHistory, remixHistoryController);

    let response = await router.fetch(
      new URL(routes.remixHistory.index.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();
    expect(html).toContain('id="main-content"');
    expect(html).toContain(`action="${routes.newsletter.subscribe.href()}"`);
  });
});
