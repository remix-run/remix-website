import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import rootController from "./controller.tsx";
import { routes } from "../routes.ts";
import { createRouteTestRouter } from "../../test/setup.ts";

describe("Brand route", () => {
  it("renders an HTML document with downloadable brand assets", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);

    let response = await router.fetch(
      new URL(routes.brand.href(), "http://localhost:3000"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    let html = await response.text();
    expect(html).toContain('href="/_brand/remix-brand-assets.zip"');
  });
});
