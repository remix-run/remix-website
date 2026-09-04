import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { DOCUMENT_REDIRECT_HEADER } from "../../public/document-redirect.ts";
import { routes } from "../../../routes.ts";
import { env } from "../../../utils/env.ts";
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
  it("renders the homepage as the full Jam page with ticket frame navigation", async () => {
    let router = createJam2026TestRouter();

    let response = await router.fetch(appUrl(routes.jam.y2026.index));

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
    expect(html).toContain('id="faq"');
    expect(html).toContain('href="/jam/2026/ticket"');
    expect(html).toContain(`rmx-target="${ticketModalConfig.frameName}"`);
    expect(html).not.toContain('role="dialog"');
  });

  it("renders the newsletter signup fragment", async () => {
    let router = createJam2026TestRouter();

    let response = await router.fetch(
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
    let router = createJam2026TestRouter();

    let response = await router.fetch(
      new URL(routes.jam.y2026.index.href(), "https://example.com"),
    );

    expect(response.status).toBe(200);

    let html = await response.text();

    expect(html).toContain(
      'data-remix-managed-head="true" rel="canonical" href="https://remix.run/jam/2026"',
    );
    expect(html).not.toContain("example.com");
  });

  it("renders the ticket route as the full Jam page with the ticket modal open", async () => {
    let router = createJam2026TestRouter();

    let response = await router.fetch(appUrl(routes.jam.y2026.ticket.index));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
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
    expect(html).toContain('aria-label="Close tickets"');
    expect(html).toContain('href="/jam/2026"');
    expect(html).toContain(`rmx-target="${ticketModalConfig.frameName}"`);
  });

  it("renders the saved theme on the first document paint", async () => {
    let router = createJam2026TestRouter();
    let cookie = await serializeJam2026ThemePreference("dark");

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.index), {
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
    let router = createRouteTestRouter();
    router.map(routes.jam.y2026, jam2026Controller);
    let formData = new FormData();
    formData.set("theme", "system");

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.theme), {
        body: formData,
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("renders the ticket route as modal-only frame content for the tickets frame", async () => {
    let router = createJam2026TestRouter();

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.ticket.index), {
        headers: {
          "x-remix-target": ticketModalConfig.frameName,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");

    let html = await response.text();

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).not.toContain("<title>Remix Jam 2026 Tickets</title>");
    expect(html).not.toContain('aria-label="Page navigation"');
  });

  it("renders the homepage route as closed modal frame content for the tickets frame", async () => {
    let router = createJam2026TestRouter();

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.index), {
        headers: {
          "x-remix-target": ticketModalConfig.frameName,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Vary")).toContain("x-remix-target");
    expect(response.headers.get("Vary")).toContain("x-remix-ssr-frame");

    let html = await response.text();

    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('aria-label="Page navigation"');
  });

  it("rejects invalid ticket submissions with no-store modal errors", async () => {
    let router = createJam2026TestRouter();
    let formData = new FormData();
    formData.set("ticketType", "side-stage");
    formData.set("productId", "not-the-ticket");
    formData.set("quantity", "1");

    let response = await router.fetch(
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

  it("creates a Shopify cart and redirects to checkout", async (t) => {
    mockStorefront(t);
    let router = createJam2026TestRouter();
    let formData = new FormData();
    formData.set("ticketType", remixJam2026Ticket.type);
    formData.set("productId", "gid://shopify/ProductVariant/2026");
    formData.set("quantity", "2");

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.ticket.action), {
        body: formData,
        method: "POST",
        redirect: "manual",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Location")).toBe(
      "https://jam.remix.run/checkouts/2026",
    );
  });

  it("hands an enhanced checkout off to document navigation", async (t) => {
    mockStorefront(t);
    let router = createJam2026TestRouter();

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.ticket.action), {
        body: createTicketFormData(),
        headers: { "X-Remix-Frame": "true" },
        method: "POST",
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Location")).toBe(null);
    expect(response.headers.get(DOCUMENT_REDIRECT_HEADER)).toBe(
      "https://jam.remix.run/checkouts/2026",
    );
  });

  it("shows the regular price when no discount code is supplied", async (t) => {
    mockStorefront(t);
    let router = createJam2026TestRouter();

    let response = await router.fetch(appUrl(routes.jam.y2026.ticket.index));

    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toBe(null);

    let html = await response.text();

    expect(html).toContain("$399");
    expect(html).not.toContain("will be applied at checkout");
    expect(html).not.toContain("$299");
  });

  it("stores a discount code from the URL and shows it in the ticket modal", async (t) => {
    mockStorefront(t);
    let router = createJam2026TestRouter();

    let response = await router.fetch(
      appUrl(routes.jam.y2026.ticket.index, "?discount=partner-2026"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");

    let setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).not.toBe(null);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/jam/2026");
    expect(setCookie).not.toContain("Max-Age");
    expect(await getJam2026DiscountCode(setCookie!.split(";")[0])).toBe(
      "PARTNER-2026",
    );

    let html = await response.text();

    expect(html).toContain("Code PARTNER-2026 will be applied at checkout");
    expect(html).toContain("$399");
  });

  it("reads the stored discount code on tickets frame requests", async (t) => {
    mockStorefront(t);
    let router = createJam2026TestRouter();
    let cookie = await serializeJam2026DiscountCode("PARTNER-2026");

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.ticket.index), {
        headers: {
          cookie: cookie.split(";")[0],
          "x-remix-target": ticketModalConfig.frameName,
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toBe(null);
    expect(response.headers.get("Vary")).toContain("cookie");

    let html = await response.text();

    expect(html).toContain("Code PARTNER-2026 will be applied at checkout");
  });

  it("ignores malformed discount codes", async (t) => {
    mockStorefront(t);
    let router = createJam2026TestRouter();

    let response = await router.fetch(
      appUrl(routes.jam.y2026.ticket.index, "?discount=not%20a%20code"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toBe(null);

    let html = await response.text();

    expect(html).toContain("$399");
    expect(html).not.toContain("will be applied at checkout");
  });

  it("silently clears an inapplicable discount code", async (t) => {
    mockStorefront(t, { applicableDiscountCode: false });
    let router = createJam2026TestRouter();
    let cookie = await serializeJam2026DiscountCode("EXPIRED-2026");

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.ticket.index), {
        headers: { cookie: cookie.split(";")[0] },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");

    let html = await response.text();

    expect(html).toContain("$399");
    expect(html).not.toContain("EXPIRED-2026");
  });

  it("silently checks out without an inapplicable stored discount code", async (t) => {
    mockStorefront(t, { applicableDiscountCode: false });
    let router = createJam2026TestRouter();
    let cookie = await serializeJam2026DiscountCode("EXPIRED-2026");

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.ticket.action), {
        body: createTicketFormData(),
        headers: { cookie: cookie.split(";")[0] },
        method: "POST",
        redirect: "manual",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toBe(
      "https://jam.remix.run/checkouts/2026",
    );
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
  });

  it("forwards the stored discount code to the Shopify cart", async (t) => {
    let requestedDiscountCodes = mockStorefront(t);
    let router = createJam2026TestRouter();
    let cookie = await serializeJam2026DiscountCode("PARTNER-2026");

    let response = await router.fetch(
      new Request(appUrl(routes.jam.y2026.ticket.action), {
        body: createTicketFormData(),
        headers: { cookie: cookie.split(";")[0] },
        method: "POST",
        redirect: "manual",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(requestedDiscountCodes).toEqual([["PARTNER-2026"]]);
  });
});

function appUrl(route: { href(): string }, search = "") {
  return new URL(`${route.href()}${search}`, "http://localhost:3000");
}

function createTicketFormData() {
  let formData = new FormData();
  formData.set("ticketType", remixJam2026Ticket.type);
  formData.set("productId", "gid://shopify/ProductVariant/2026");
  formData.set("quantity", "2");
  return formData;
}

function createJam2026TestRouter() {
  let router = createRouteTestRouter();
  router.map(routes.jam.y2026.ticket, jam2026TicketController);
  router.map(routes.jam.y2026, jam2026Controller);
  return router;
}

/**
 * Stubs the Shopify Storefront API so tickets are on sale. Without a storefront
 * token the data layer already reports tickets as unavailable, so only tests
 * that need a purchasable ticket install this.
 *
 * Returns the discount codes sent with each cart mutation.
 */
function mockStorefront(
  t: { after(cleanup: () => void): void },
  { applicableDiscountCode = true }: { applicableDiscountCode?: boolean } = {},
) {
  let requestedDiscountCodes: string[][] = [];
  let originalToken = env.PUBLIC_STOREFRONT_API_TOKEN;
  let originalFetch = globalThis.fetch;

  env.PUBLIC_STOREFRONT_API_TOKEN = "test-storefront-token";
  globalThis.fetch = async (input, init) => {
    let url = String(input);
    if (url !== "https://jam.remix.run/api/2026-04/graphql.json") {
      throw new Error(`Unexpected fetch: ${url}`);
    }

    let body = JSON.parse(String(init?.body ?? "{}"));
    let cart = {
      id: "gid://shopify/Cart/2026",
      checkoutUrl: "https://jam.remix.run/checkouts/2026",
    };

    if (body.query.includes("cartCreate")) {
      let discountCodes: string[] =
        body.variables.cartInput.discountCodes ?? [];
      requestedDiscountCodes.push(discountCodes);

      return Response.json({
        data: {
          cartCreate: {
            cart: {
              ...cart,
              discountCodes: discountCodes.map((code) => ({
                code,
                applicable: applicableDiscountCode,
              })),
            },
            userErrors: [],
            warnings: [],
          },
        },
      });
    }

    if (body.query.includes("cartDiscountCodesUpdate")) {
      return Response.json({
        data: { cartDiscountCodesUpdate: { cart, userErrors: [] } },
      });
    }

    return Response.json({
      data: {
        product: {
          id: "gid://shopify/Product/2026",
          variants: {
            edges: [
              {
                node: {
                  id: "gid://shopify/ProductVariant/2026",
                  price: { amount: "399.00" },
                  availableForSale: true,
                },
              },
            ],
          },
        },
      },
    });
  };

  t.after(() => {
    env.PUBLIC_STOREFRONT_API_TOKEN = originalToken;
    globalThis.fetch = originalFetch;
  });

  return requestedDiscountCodes;
}
