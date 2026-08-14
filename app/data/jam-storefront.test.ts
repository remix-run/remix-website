import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { createCart, getPhotos, getProduct } from "./jam-storefront.ts";
import { env } from "../utils/env.ts";

describe("Jam Storefront", () => {
  it("returns stable unavailable states when Storefront is not configured", async (t) => {
    let previousEnv = { ...env };
    Reflect.set(env, "PUBLIC_STOREFRONT_API_TOKEN", undefined);
    t.after(() => {
      Object.assign(env, previousEnv);
    });

    await expect(getProduct("tickets")).resolves.toMatchObject({
      availableForSale: false,
      unavailableReason: "storefront",
    });
    await expect(getPhotos("gallery")).resolves.toEqual([]);
    await expect(
      createCart({ productId: "variant", quantity: 1 }),
    ).resolves.toEqual({ error: "Ticket checkout is unavailable right now" });
  });

  it("normalizes product data returned by Storefront", async (t) => {
    mockStorefront(t, async () =>
      Response.json({
        data: {
          product: {
            id: "gid://shopify/Product/2026",
            variants: {
              edges: [
                {
                  node: {
                    id: "gid://shopify/ProductVariant/2026",
                    price: { amount: "299" },
                    availableForSale: true,
                    quantityRule: { minimum: 2, maximum: 8, increment: 2 },
                  },
                },
              ],
            },
          },
        },
      }),
    );

    await expect(getProduct("tickets")).resolves.toEqual({
      id: "gid://shopify/Product/2026",
      price: "299.00",
      productId: "gid://shopify/ProductVariant/2026",
      availableForSale: true,
      quantityRule: { minimum: 2, maximum: 8, increment: 2 },
    });
  });

  it("degrades safely when gallery requests fail", async (t) => {
    mockStorefront(t, async () => {
      throw new Error("Storefront unavailable");
    });

    await expect(getPhotos("gallery")).resolves.toEqual([]);
  });

  it("never returns an untrusted checkout URL", async (t) => {
    mockStorefront(t, async (_input, init) => {
      let body = JSON.parse(String(init?.body));
      if (!body.query.includes("cartCreate")) {
        throw new Error("Unexpected Storefront operation");
      }

      return Response.json({
        data: {
          cartCreate: {
            cart: {
              id: "gid://shopify/Cart/2026",
              checkoutUrl: "https://attacker.example/checkout",
              discountCodes: [],
            },
            userErrors: [],
            warnings: [],
          },
        },
      });
    });

    await expect(
      createCart({ productId: "variant", quantity: 1 }),
    ).resolves.toEqual({ error: "Failed to create cart" });
  });
});

function mockStorefront(
  t: { after(cleanup: () => void): void },
  fetchImpl: typeof fetch,
) {
  let previousEnv = { ...env };
  let originalFetch = globalThis.fetch;
  Reflect.set(env, "PUBLIC_STOREFRONT_API_TOKEN", ["test", "token"].join("-"));
  globalThis.fetch = fetchImpl;

  t.after(() => {
    Object.assign(env, previousEnv);
    globalThis.fetch = originalFetch;
  });
}
