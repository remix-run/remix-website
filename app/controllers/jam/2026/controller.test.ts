import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import { jamController } from "../controller.ts";

describe("Remix Jam 2026 routes", () => {
  it("renders the homepage with the Jam 2026 footer", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam, jamController);

    let response = await router.fetch("http://localhost:3000/jam/2026");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026</title>");
    expect(html).toContain('aria-label="Site footer"');
    expect(html).toContain("https://github.com/remix-run");
    expect(html).toContain("docs and examples licensed under mit");
    expect(html).toContain("2026 Shopify, Inc.");
  });

  it("renders the ticket page with the Jam 2026 footer", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam, jamController);

    let response = await router.fetch("http://localhost:3000/jam/2026/tickets");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026 Tickets</title>");
    expect(html).toContain('aria-label="Site footer"');
    expect(html).toContain("https://youtube.com/remix_run");
    expect(html).toContain("docs and examples licensed under mit");
    expect(html).toContain("2026 Shopify, Inc.");
  });
});
