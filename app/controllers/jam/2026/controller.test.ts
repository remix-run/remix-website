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
      'property="og:image" content="http://localhost:3000/jam/2026/remix-jam-2026-share.jpg"',
    );
    expect(html).toContain(
      'name="twitter:image" content="http://localhost:3000/jam/2026/remix-jam-2026-share.jpg"',
    );
    expect(html).toContain(
      'rel="apple-touch-icon" href="/jam/2026/favicons/apple-touch-icon.png"',
    );
    expect(html).toContain(
      'rel="icon" href="/jam/2026/favicons/favicon-32x32.png" type="image/png" sizes="32x32"',
    );
    expect(html).toContain(
      'aria-label="Remix Jam starts October 1, 2026 at 9:00 AM Eastern time"',
    );
    expect(html).toContain('href="https://shopify.com"');
    expect(html).toContain('src="/jam/2026/landing-assets/shopify-glyph.svg"');
    expect(html).toContain(
      'src="/jam/2026/remix-jam-2026-horizontal-lockup.svg"',
    );
    expect(html).toContain("Remix Jam 2026");
    expect(html).toContain("October 1-2, 2026");
    expect(html).toContain("Toronto - Ontario, Canada");
    expect(html).toContain("annual conference returns to Toronto");
    expect(html).toContain("show off Remix 3");
    expect(html).toContain("main Remix showcase");
    expect(html).toContain("hands-on workshop");
    expect(html).toContain("Light");
    expect(html).toContain("Dark");
    expect(html).toContain('href="/icons.svg#sun"');
    expect(html).toContain('href="/icons.svg#moon"');
    expect(html).toContain('href="#faq"');
    expect(html).toContain('href="/jam/2026/tickets"');
    expect(html).toContain(">Get Remix Jam 2026 tickets</span>");
    expect(html).toContain(
      'src="/jam/2026/landing-assets/floating-ticket-cta.svg"',
    );
    expect(html).toContain(
      'src="/jam/2026/landing-assets/remix-keyring-workshop.webp"',
    );
    expect(html).toContain("Will there be a CFP?");
    expect(html).toContain("Where should I stay?");
    expect(html).toContain("What airport should I fly into?");
    expect(html).toContain('id="event-hosted"');
    expect(html).toContain('id="where-to-stay"');
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
      'property="og:image" content="http://localhost:3000/jam/2026/remix-jam-2026-share.jpg"',
    );
    expect(html).toContain(
      'rel="icon" href="/jam/2026/favicons/favicon.ico" sizes="any"',
    );
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
