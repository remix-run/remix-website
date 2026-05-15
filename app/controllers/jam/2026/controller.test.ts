import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import { jamController } from "../controller.ts";

describe("Remix Jam 2026 routes", () => {
  it("renders the homepage with the Jam 2026 header controls and Jam footer", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam, jamController);

    let response = await router.fetch("http://localhost:3000/jam/2026");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026</title>");
    expect(html).toContain(
      'aria-label="Remix Jam starts October 1, 2026 at 9:00 AM Eastern time"',
    );
    expect(html).toContain('href="https://shopify.com"');
    expect(html).toContain('src="/jam/2026/landing-assets/shopify-glyph.svg"');
    expect(html).toContain(
      'src="/jam/2026/remix-jam-2026-horizontal-lockup.svg"',
    );
    expect(html).toContain('aria-label="Color theme"');
    expect(html).toContain("Light");
    expect(html).toContain("Dark");
    expect(html).toContain('href="/icons.svg#sun"');
    expect(html).toContain('href="/icons.svg#moon"');
    expect(html).toContain('href="#faq"');
    expect(html).toContain('href="/jam/2026/tickets"');
    expect(html).toContain('aria-label="Site footer"');
    expect(html).toContain("https://github.com/remix-run");
    expect(html).toContain("docs and examples licensed under mit");
    expect(html).toContain("2026 Shopify, Inc.");
  });

  it("renders the ticket page with the shared Jam header and footer", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam, jamController);

    let response = await router.fetch("http://localhost:3000/jam/2026/tickets");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026 Tickets</title>");
    expect(html).toContain(
      'aria-label="Remix Jam starts October 1, 2026 at 9:00 AM Eastern time"',
    );
    expect(html).toContain('data-lockup-visible="false"');
    expect(html).toContain('aria-label="Shopify"');
    expect(html).toContain('href="#faq"');
    expect(html).toContain('href="/jam/2026/tickets"');
    expect(html).toContain('aria-label="Site footer"');
    expect(html).toContain("https://youtube.com/remix_run");
    expect(html).toContain("docs and examples licensed under mit");
    expect(html).toContain("2026 Shopify, Inc.");
  });
});
