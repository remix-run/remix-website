import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { DOCUMENT_REDIRECT_HEADER } from "../../public/document-redirect.ts";
import { routes } from "../../../routes.ts";
import { createRouteTestRouter } from "../../../../test/setup.ts";
import jam2026Controller from "./controller.tsx";
import jam2026TicketController from "./ticket/controller.tsx";
import { remixJam2026Ticket } from "./public/ticket-data.ts";
import { ticketModalConfig } from "./public/tickets-modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.ts";
import {
  getJam2026DiscountCode,
  serializeJam2026DiscountCode,
} from "./discount-code.ts";

describe("Remix Jam 2026 routes", () => {
  it("renders the livestream before the schedule without ticket navigation or scattered photos", async () => {
    let response = await createJam2026TestRouter().fetch(
      appUrl(routes.jam.y2026.index),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");
    let html = await response.text();
    expect(html).toContain("<title>Remix Jam 2026</title>");
    expect(html).toContain(
      'data-remix-managed-head="true" rel="canonical" href="http://localhost:3000/jam/2026"',
    );
    expect(html).toContain('aria-label="Page navigation"');
    expect(html).toContain(
      'src="https://www.youtube.com/embed/TaKBQnYm9tM?si=jdVAJ6fS6hWvoLTG"',
    );
    expect(html.indexOf("<iframe")).toBeLessThan(html.indexOf('id="schedule"'));
    expect(html).toContain('id="schedule"');
    expect(html).toContain('id="faq"');
    expect(html.indexOf('id="schedule"')).toBeLessThan(
      html.indexOf('id="faq"'),
    );
    expect(html).not.toContain('href="/jam/2026/ticket"');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('src="/jam/2026/photos/');
  });

  it("renders the newsletter signup fragment", async () => {
    let response = await createJam2026TestRouter().fetch(
      appUrl(routes.jam.y2026.newsletterSignup, "?subscription=success"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    let html = await response.text();
    expect(html).toContain('data-rmx-target="newsletter-subscribe"');
    expect(html).toContain('data-rmx-reset-scroll="false"');
    expect(html).toContain("You're on the list");
  });

  it("does not reflect untrusted request hosts into social head tags", async () => {
    let response = await createJam2026TestRouter().fetch(
      new URL(routes.jam.y2026.index.href(), "https://example.com"),
    );
    expect(response.status).toBe(200);
    let html = await response.text();
    expect(html).toContain(
      'data-remix-managed-head="true" rel="canonical" href="https://remix.run/jam/2026"',
    );
    expect(html).not.toContain("example.com");
  });

  it("keeps the ticket document and frame accessible with checkout disabled", async () => {
    for (let frame of [false, true]) {
      let response = await createJam2026TestRouter().fetch(
        new Request(appUrl(routes.jam.y2026.ticket.index), {
          headers: frame
            ? { "x-remix-target": ticketModalConfig.frameName }
            : {},
        }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Vary")).toContain("x-remix-target");
      let html = await response.text();
      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('aria-label="Close tickets"');
      expect(html).toContain('href="/jam/2026"');
      expect(html).toContain(`rmx-target="${ticketModalConfig.frameName}"`);
      // The native disabled attribute protects checkout even before hydration.
      expect(html).toMatch(/<button[^>]*disabled[^>]*type="submit"/);
      if (frame) {
        expect(html).not.toContain('aria-label="Page navigation"');
      } else {
        expect(html).toContain("<title>Remix Jam 2026 Tickets</title>");
        expect(html).toContain('aria-label="Page navigation"');
      }
    }
  });

  it("renders the homepage route as closed modal frame content", async () => {
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.index), {
        headers: { "x-remix-target": ticketModalConfig.frameName },
      }),
    );
    expect(response.status).toBe(200);
    let html = await response.text();
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('aria-label="Page navigation"');
  });

  it("renders the saved theme on the first document paint", async () => {
    let cookie = await serializeJam2026ThemePreference("dark");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.index), {
        headers: { cookie: cookie.split(";")[0] },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Vary")).toContain("cookie");
    let html = await response.text();
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain('style="color-scheme: dark;"');
  });

  it("sets the theme preference through the server action", async () => {
    let formData = new FormData();
    formData.set("theme", "dark");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.theme), {
        body: formData,
        method: "POST",
        redirect: "manual",
      }),
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Location")).toBe(
      routes.jam.y2026.index.href(),
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
    let formData = new FormData();
    formData.set("theme", "system");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.theme), {
        body: formData,
        method: "POST",
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects invalid ticket submissions with no-store modal errors", async () => {
    let formData = new FormData();
    formData.set("ticketType", "side-stage");
    formData.set("productId", "not-the-ticket");
    formData.set("quantity", "1");
    let response = await createJam2026TestRouter().fetch(
      new Request(appUrl(routes.jam.y2026.ticket.action), {
        body: formData,
        method: "POST",
      }),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    let html = await response.text();
    expect(html).toContain("Invalid ticket request");
    expect(html).toContain('role="alert"');
  });

  it("blocks stale and enhanced checkout submissions without contacting Shopify, even with a discount", async (t) => {
    let originalFetch = globalThis.fetch;
    let requests: string[] = [];
    globalThis.fetch = async (input) => {
      requests.push(String(input));
      throw new Error("Closed ticket sales must not contact Shopify");
    };
    t.after(() => {
      globalThis.fetch = originalFetch;
    });
    let cookie = await serializeJam2026DiscountCode("PARTNER-2026");
    for (let enhanced of [false, true]) {
      let formData = new FormData();
      formData.set("ticketType", remixJam2026Ticket.type);
      formData.set("productId", "gid://shopify/ProductVariant/2026");
      formData.set("quantity", "2");
      let response = await createJam2026TestRouter().fetch(
        new Request(appUrl(routes.jam.y2026.ticket.action), {
          body: formData,
          headers: {
            cookie: cookie.split(";")[0],
            ...(enhanced
              ? {
                  "X-Remix-Frame": "true",
                  "x-remix-target": ticketModalConfig.frameName,
                }
              : {}),
          },
          method: "POST",
          redirect: "manual",
        }),
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      expect(response.headers.get("Location")).toBe(null);
      expect(response.headers.get(DOCUMENT_REDIRECT_HEADER)).toBe(null);
      let html = await response.text();
      expect(html).toContain("Ticket sales are closed");
      expect(html).toMatch(/<button[^>]*disabled[^>]*type="submit"/);
    }
    expect(requests).toEqual([]);
  });

  it("preserves discount cookies without validating carts or offering discounted checkout", async () => {
    let response = await createJam2026TestRouter().fetch(
      appUrl(routes.jam.y2026.ticket.index, "?discount=partner-2026"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    let setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).not.toBe(null);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/jam/2026");
    expect(await getJam2026DiscountCode(setCookie!.split(";")[0])).toBe(
      "PARTNER-2026",
    );
    let html = await response.text();
    expect(html).not.toContain("will be applied at checkout");
    expect(html).toMatch(/<button[^>]*disabled[^>]*type="submit"/);
  });
});

function appUrl(route: { href(): string }, search = "") {
  return new URL(`${route.href()}${search}`, "http://localhost:3000");
}

function createJam2026TestRouter() {
  let router = createRouteTestRouter();
  router.map(routes.jam.y2026.ticket, jam2026TicketController);
  router.map(routes.jam.y2026, jam2026Controller);
  return router;
}
