import { describe, expect, it } from "vitest";
import { parseCart, parsePhotos, parseProduct } from "./storefront.server";

describe("parseProduct", () => {
  it("parses valid product data", () => {
    let product = parseProduct({
      id: "gid://shopify/Product/123",
      price: "399.00",
      productId: "gid://shopify/ProductVariant/456",
      availableForSale: true,
    });
    expect(product).toEqual({
      id: "gid://shopify/Product/123",
      price: "399.00",
      productId: "gid://shopify/ProductVariant/456",
      availableForSale: true,
    });
  });

  it("rejects invalid product data", () => {
    expect(() => parseProduct({ id: "x" })).toThrow();
    expect(() =>
      parseProduct({
        id: 123,
        price: "1",
        productId: "p",
        availableForSale: true,
      }),
    ).toThrow();
  });
});

describe("parseCart", () => {
  it("parses valid cart data", () => {
    let cart = parseCart({
      id: "gid://shopify/Cart/abc",
      checkoutUrl: "https://jam.remix.run/checkout/abc",
    });
    expect(cart.checkoutUrl).toBe("https://jam.remix.run/checkout/abc");
  });

  it("rejects invalid checkoutUrl", () => {
    expect(() =>
      parseCart({
        id: "cart-id",
        checkoutUrl: "not-a-valid-url",
      }),
    ).toThrow();
  });

  it("rejects missing checkoutUrl", () => {
    expect(() =>
      parseCart({
        id: "cart-id",
      }),
    ).toThrow();
  });
});

describe("parsePhotos", () => {
  it("parses valid photos array", () => {
    let photos = parsePhotos([
      {
        url: "https://example.com/photo.jpg",
        width: 800,
        height: 600,
      },
      {
        url: "https://example.com/photo2.jpg",
        altText: "Alt text",
        width: 400,
        height: 300,
      },
    ]);
    expect(photos).toHaveLength(2);
    expect(photos[0].url).toBe("https://example.com/photo.jpg");
    expect(photos[1].altText).toBe("Alt text");
  });

  it("rejects invalid url in photo", () => {
    expect(() =>
      parsePhotos([
        {
          url: "not-a-url",
          width: 100,
          height: 100,
        },
      ]),
    ).toThrow();
  });
});
