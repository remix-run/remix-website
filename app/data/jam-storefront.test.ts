import { describe, it, type TestContext } from "remix/test";
import { expect } from "remix/assert";

import { createCart, getPhotos, getProduct } from "./jam-storefront.ts";
import { env } from "../utils/env.ts";

describe("Jam Storefront", () => {
  it("returns degraded states when Storefront is not configured", async (t) => {
    let previousEnv = { ...env };
    Reflect.set(env, "PUBLIC_STOREFRONT_API_TOKEN", undefined);
    t.after(() => {
      Object.assign(env, previousEnv);
    });

    await expect(getProduct("tickets")).resolves.toBe(null);
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
    });
  });

  it("reports a missing product as null", async (t) => {
    mockStorefront(t, async () => Response.json({ data: { product: null } }));

    await expect(getProduct("tickets")).resolves.toBe(null);
  });

  it("degrades safely when gallery requests fail", async (t) => {
    mockStorefront(t, async () => {
      throw new Error("Storefront unavailable");
    });

    await expect(getPhotos("gallery")).resolves.toEqual([]);
  });

  it("skips individual invalid photos instead of failing the gallery", async (t) => {
    let image = (url: string) => ({
      node: { image: { url, altText: null, width: 800, height: 600 } },
    });
    mockStorefront(t, async () =>
      Response.json({
        data: {
          metaobject: {
            fields: [
              { key: "title", references: null },
              {
                key: "photos",
                references: {
                  edges: [
                    image("https://cdn.shopify.com/a.jpg"),
                    image("not a url"),
                    { node: {} },
                    image("https://cdn.shopify.com/b.jpg"),
                  ],
                },
              },
            ],
          },
        },
      }),
    );

    let photos = await getPhotos("gallery");
    expect(photos.map((photo) => photo.url)).toEqual([
      "https://cdn.shopify.com/a.jpg",
      "https://cdn.shopify.com/b.jpg",
    ]);
    expect(photos[0].altText).toBe("");
  });

  it("strips an inapplicable discount code, falling back to a fresh cart", async (t) => {
    let operations: Array<{ name: string; discountCodes?: string[] }> = [];
    mockStorefront(t, async (_input, init) => {
      let body = JSON.parse(String(init?.body));
      if (body.query.includes("cartDiscountCodesUpdate")) {
        operations.push({ name: "cartDiscountCodesUpdate" });
        return Response.json({
          data: {
            cartDiscountCodesUpdate: {
              cart: null,
              userErrors: [{ message: "Cart not found" }],
            },
          },
        });
      }

      let discountCodes: string[] | undefined =
        body.variables.cartInput.discountCodes;
      operations.push({ name: "cartCreate", discountCodes });
      return Response.json({
        data: {
          cartCreate: {
            cart: {
              id: `gid://shopify/Cart/${operations.length}`,
              checkoutUrl: `https://jam.remix.run/checkouts/${operations.length}`,
              discountCodes: (discountCodes ?? []).map((code) => ({
                code,
                applicable: false,
              })),
            },
            userErrors: [],
          },
        },
      });
    });

    await expect(
      createCart({
        discountCode: " expired ",
        productId: "variant",
        quantity: 1,
      }),
    ).resolves.toEqual({
      id: "gid://shopify/Cart/3",
      checkoutUrl: "https://jam.remix.run/checkouts/3",
    });
    expect(operations).toEqual([
      { name: "cartCreate", discountCodes: ["EXPIRED"] },
      { name: "cartDiscountCodesUpdate" },
      { name: "cartCreate", discountCodes: undefined },
    ]);
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

function mockStorefront(t: TestContext, fetchImpl: typeof fetch) {
  let previousEnv = { ...env };
  Reflect.set(env, "PUBLIC_STOREFRONT_API_TOKEN", ["test", "token"].join("-"));
  t.mock.method(globalThis, "fetch", fetchImpl);
  t.mock.method(console, "error", () => {});

  t.after(() => {
    Object.assign(env, previousEnv);
  });
}
