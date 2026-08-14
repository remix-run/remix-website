import { expect } from "remix/assert";
import { describe, it } from "remix/test";

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
    expect(response.headers.get("Cache-Control")).toBe("no-store");
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
});

async function submitTicket(fields: { productId: string; quantity: string }) {
  let router = createRouteTestRouter();
  router.map(routes.jam.y2025.ticket, jam2025TicketController);
  let body = new URLSearchParams(fields);

  return router.fetch(
    new Request(
      new URL(routes.jam.y2025.ticket.action.href(), "http://localhost:3000"),
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

function mockStorefront(t: { after(cleanup: () => void): void }) {
  let previousEnv = { ...env };
  let originalFetch = globalThis.fetch;
  Reflect.set(env, "PUBLIC_STOREFRONT_API_TOKEN", ["test", "token"].join("-"));
  globalThis.fetch = async (_input, init) => {
    let body = JSON.parse(String(init?.body ?? "{}"));
    if (body.query.includes("cartCreate")) {
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

  t.after(() => {
    Object.assign(env, previousEnv);
    globalThis.fetch = originalFetch;
  });
}
