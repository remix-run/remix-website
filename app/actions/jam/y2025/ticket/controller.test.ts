import { expect } from "remix/assert";
import { describe, it, type TestContext } from "remix/test";

import { routes } from "../../../../routes.ts";
import { env } from "../../../../utils/env.ts";
import { createRouteTestRouter } from "../../../../../test/setup.ts";
import jam2025TicketController from "./controller.tsx";
import { parseTicketPurchaseSubmission } from "./page.tsx";

describe("Jam 2025 ticket submission", () => {
  it("rejects partially numeric quantities", () => {
    let formData = new FormData();
    formData.set("productId", "ticket-id");
    formData.set("quantity", "2abc");

    expect(parseTicketPurchaseSubmission(formData)).toEqual({
      success: false,
      error: "Invalid ticket request",
    });
  });

  it("rejects a mismatched product without contacting a real Storefront", async (t) => {
    mockStorefront(t);
    let response = await submitTicket({
      productId: "not-the-ticket",
      quantity: "1",
    });

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.text()).toContain("Invalid ticket selection");
  });

  it("redirects a valid purchase to the trusted checkout", async (t) => {
    mockStorefront(t);
    let response = await submitTicket({
      productId: "gid://shopify/ProductVariant/2025",
      quantity: "2",
    });

    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toBe(
      "https://jam.remix.run/checkouts/2025",
    );
  });

  it("drops a malformed discount code instead of sending it to Shopify", async (t) => {
    let cartRequests = mockStorefront(t);
    let response = await submitTicket(
      { productId: "gid://shopify/ProductVariant/2025", quantity: "1" },
      "?discount=" + encodeURIComponent("<bad code>"),
    );

    expect(response.status).toBe(303);
    expect(cartRequests).toHaveLength(1);
    expect(cartRequests[0].variables.cartInput.discountCodes).toBe(undefined);
  });

  it("re-renders a failed checkout without blaming the request", async (t) => {
    mockStorefront(t, { cartCreateFails: true });
    t.mock.method(console, "error", () => {});
    let response = await submitTicket({
      productId: "gid://shopify/ProductVariant/2025",
      quantity: "1",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  });
});

async function submitTicket(
  fields: { productId: string; quantity: string },
  search = "",
) {
  let router = createRouteTestRouter();
  router.map(routes.jam.y2025.ticket, jam2025TicketController);
  let body = new URLSearchParams(fields);

  return router.fetch(
    new Request(
      new URL(
        routes.jam.y2025.ticket.action.href() + search,
        "http://localhost:3000",
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
        redirect: "manual",
      },
    ),
  );
}

function mockStorefront(
  t: TestContext,
  { cartCreateFails = false }: { cartCreateFails?: boolean } = {},
) {
  let cartRequests: Array<{
    variables: { cartInput: Record<string, unknown> };
  }> = [];
  let previousEnv = { ...env };
  Reflect.set(env, "PUBLIC_STOREFRONT_API_TOKEN", ["test", "token"].join("-"));
  let storefrontFetch: typeof fetch = async (_input, init) => {
    let body = JSON.parse(String(init?.body ?? "{}"));
    if (body.query.includes("cartCreate")) {
      cartRequests.push(body);
      if (cartCreateFails) return new Response(null, { status: 502 });
      return Response.json({
        data: {
          cartCreate: {
            cart: {
              id: "gid://shopify/Cart/2025",
              checkoutUrl: "https://jam.remix.run/checkouts/2025",
              discountCodes: [],
            },
            userErrors: [],
            warnings: [],
          },
        },
      });
    }

    return Response.json({
      data: {
        product: {
          id: "gid://shopify/Product/2025",
          variants: {
            edges: [
              {
                node: {
                  id: "gid://shopify/ProductVariant/2025",
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
  t.mock.method(globalThis, "fetch", storefrontFetch);

  t.after(() => {
    Object.assign(env, previousEnv);
  });

  return cartRequests;
}
