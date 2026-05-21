import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import { jam2026Controller } from "../controller.ts";
import { ticketModalConfig } from "./tickets-modal-contract.ts";

describe("Remix Jam 2026 routes", () => {
  it("renders the homepage as the full Jam page with ticket frame navigation", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);

    let response = await router.fetch("http://localhost:3000/jam/2026");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");
    expect(response.headers.get("Vary")).toContain("x-remix-reduced-motion");

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026</title>");
    expect(html).toContain('aria-label="Page navigation"');
    expect(html).toContain("Remix Jam 2026");
    expect(html).toContain("October 1-2, 2026");
    expect(html).toContain('href="/jam/2026/ticket"');
    expect(html).toContain(`rmx-target="${ticketModalConfig.frameName}"`);
    expect(html).not.toContain('role="dialog"');
  });

  it("renders the ticket route as the full Jam page with the ticket modal open", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);

    let response = await router.fetch("http://localhost:3000/jam/2026/ticket");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");
    expect(response.headers.get("Vary")).toContain("x-remix-reduced-motion");

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026 Tickets</title>");
    expect(html).toContain('aria-label="Page navigation"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-animate-entrance="false"');
    expect(html).toContain("TICKETS.TS");
    expect(html).toContain("Remix Jam 2026 Ticket");
    expect(html).toContain("October 2, 2026 in Toronto");
    expect(html).toContain("Early bird discount applied");
    expect(html).toContain("$299");
    expect(html).toContain('aria-label="Close tickets"');
    expect(html).toContain('href="/jam/2026"');
    expect(html).toContain(`rmx-target="${ticketModalConfig.frameName}"`);
  });

  it("renders the ticket route as modal-only frame content for the tickets frame", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);

    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2026/ticket", {
        headers: {
          "x-remix-target": ticketModalConfig.frameName,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");
    expect(response.headers.get("Vary")).toContain("x-remix-reduced-motion");

    let html = await response.text();

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-animate-entrance="true"');
    expect(html).toContain("TICKETS.TS");
    expect(html).toContain("Remix Jam 2026 Ticket");
    expect(html).toContain("Conference and afterparty");
    expect(html).not.toContain("<title>Remix Jam 2026 Tickets</title>");
    expect(html).not.toContain('aria-label="Page navigation"');
  });

  it("skips ticket modal entrance animation for reduced-motion frame requests", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);

    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2026/ticket", {
        headers: {
          "x-remix-reduced-motion": "true",
          "x-remix-target": ticketModalConfig.frameName,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Vary")).toContain("x-remix-reduced-motion");

    let html = await response.text();

    expect(html).toContain('role="dialog"');
    expect(html).toContain('data-animate-entrance="false"');
  });

  it("renders the homepage route as closed modal frame content for the tickets frame", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);

    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2026", {
        headers: {
          "x-remix-target": ticketModalConfig.frameName,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe(CACHE_CONTROL.DEFAULT);
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");
    expect(response.headers.get("Vary")).toContain("x-remix-reduced-motion");

    let html = await response.text();

    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain("TICKETS.TS");
    expect(html).not.toContain('aria-label="Page navigation"');
  });
});
