import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import { jam2026Controller } from "../controller.ts";
import { ticketModalConfig } from "./tickets-modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.server.ts";

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

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026</title>");
    expect(html).toContain(
      'data-remix-managed-head="true" rel="canonical" href="http://localhost:3000/jam/2026"',
    );
    expect(html).toContain('aria-label="Page navigation"');
    expect(html).toContain("data-jam-2026-cloud-backdrop");
    expect(html).toContain("data-jam-2026-performance-tools");
    expect(html).toContain('id="faq"');
    expect(html).toContain('id="newsletter"');
    expect(html).toContain('href="/jam/2026/ticket"');
    expect(html).toContain(`rmx-target="${ticketModalConfig.frameName}"`);
    expect(html).not.toContain('role="dialog"');
    expect(html.indexOf('id="newsletter"')).toBeGreaterThan(
      html.indexOf('id="faq"'),
    );
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

    let html = await response.text();

    expect(html).toContain("<title>Remix Jam 2026 Tickets</title>");
    expect(html).toContain(
      'data-remix-managed-head="true" rel="canonical" href="http://localhost:3000/jam/2026/ticket"',
    );
    expect(html).toContain('aria-label="Page navigation"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-animate-entrance="false"');
    expect(html).toContain('aria-label="Close tickets"');
    expect(html).toContain('href="/jam/2026"');
    expect(html).toContain(`rmx-target="${ticketModalConfig.frameName}"`);
  });

  it("renders the saved theme on the first document paint", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);
    let cookie = await serializeJam2026ThemePreference("dark");

    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2026", {
        headers: {
          cookie: cookie.split(";")[0],
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Vary")).toContain("cookie");

    let html = await response.text();

    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('style="color-scheme: dark;"');
  });

  it("sets the theme preference through the server action", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);
    let formData = new FormData();
    formData.set("theme", "dark");

    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2026/theme", {
        body: formData,
        method: "POST",
        redirect: "manual",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Location")).toBe(
      "http://localhost:3000/jam/2026",
    );

    let setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).not.toBe(null);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/jam/2026");
    expect(setCookie).toContain("SameSite=Lax");
    expect(await getJam2026ThemePreference(setCookie!.split(";")[0])).toBe(
      "dark",
    );
  });

  it("rejects invalid theme preference submissions", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);
    let formData = new FormData();
    formData.set("theme", "system");

    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2026/theme", {
        body: formData,
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
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

    let html = await response.text();

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-animate-entrance="true"');
    expect(html).not.toContain("<title>Remix Jam 2026 Tickets</title>");
    expect(html).not.toContain('aria-label="Page navigation"');
  });

  it("skips ticket modal entrance animation for server-resolved frame requests", async () => {
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);

    let response = await router.fetch(
      new Request("http://localhost:3000/jam/2026/ticket", {
        headers: {
          "x-remix-ssr-frame": "true",
          "x-remix-target": ticketModalConfig.frameName,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");

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

    let html = await response.text();

    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('aria-label="Page navigation"');
  });
});
