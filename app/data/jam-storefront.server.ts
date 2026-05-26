import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import { env } from "../utils/env.server.ts";

let client: ReturnType<typeof createStorefrontApiClient> | null = null;

function getClient() {
  if (!env.PUBLIC_STOREFRONT_API_TOKEN) {
    return null;
  }

  if (!client) {
    try {
      client = createStorefrontApiClient({
        storeDomain: "https://jam.remix.run",
        apiVersion: "2026-04",
        publicAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        customFetchApi: (...args) => fetch(...args),
      });
    } catch {
      return null;
    }
  }
  return client;
}

const ProductSchema = s.object({
  id: s.string(),
  price: s.string(),
  productId: s.string(),
  availableForSale: s.boolean(),
  quantityRule: s.optional(
    s.object({
      minimum: s.number(),
      maximum: s.optional(s.number()),
      increment: s.number(),
    }),
  ),
  unavailableReason: s.optional(s.enum_(["storefront", "product"])),
});

const CartSchema = s.object({
  id: s.string(),
  checkoutUrl: s
    .string()
    .pipe(c.url())
    .refine(isTrustedCheckoutUrl, "Expected trusted checkout URL"),
});

const PhotoSchema = s.object({
  url: s.string().pipe(c.url()),
  altText: s.optional(s.string()),
  width: s.number(),
  height: s.number(),
});

type Product = s.InferOutput<typeof ProductSchema>;
type Cart = s.InferOutput<typeof CartSchema>;
type Photo = s.InferOutput<typeof PhotoSchema>;

export function parseProduct(raw: unknown): Product {
  return s.parse(ProductSchema, raw);
}

export function parsePhotos(raw: unknown): Photo[] {
  return s.parse(s.array(PhotoSchema), raw);
}

export function parseCart(raw: unknown): Cart {
  return s.parse(CartSchema, raw);
}

export async function getProduct(handle: string): Promise<Product> {
  let storefrontClient = getClient();
  if (!storefrontClient) {
    return createUnavailableProduct("storefront");
  }

  const productQuery = `
    query ProductQuery($handle: String) {
      product(handle: $handle) {
        id
        variants(first: 1) {
          edges {
            node {
              id
              price {
                amount
              }
              availableForSale
              quantityRule {
                minimum
                maximum
                increment
              }
            }
          }
        }
      }
    }
  `;

  let response;
  try {
    response = await storefrontClient.request(productQuery, {
      variables: { handle },
    });
  } catch {
    return createUnavailableProduct("storefront");
  }

  const { data, errors } = response;

  if (errors) return createUnavailableProduct("storefront");

  let variant = data?.product?.variants?.edges[0]?.node;
  if (!data?.product?.id || !variant?.id) {
    return createUnavailableProduct("product");
  }

  const price = variant.price?.amount || "399.00";
  const product = {
    id: data.product.id,
    price: Number(price).toFixed(2),
    productId: variant.id,
    availableForSale: variant.availableForSale || false,
    quantityRule: variant.quantityRule
      ? {
          minimum: variant.quantityRule.minimum,
          maximum: variant.quantityRule.maximum ?? undefined,
          increment: variant.quantityRule.increment,
        }
      : undefined,
  };

  return parseProduct(product);
}

const MAX_PHOTOS = 128;

export async function getPhotos(handle: string): Promise<Photo[]> {
  let storefrontClient = getClient();
  if (!storefrontClient) return [];

  const metaobjectQuery = `
    query MetaobjectQuery($handle: String!) {
      metaobject(handle: { handle: $handle, type: "remix_jam_photos" }) {
        fields {
          key
          references(first: ${MAX_PHOTOS}) {
            edges {
              node {
                ... on MediaImage {
                  image {
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await storefrontClient.request(metaobjectQuery, {
    variables: { handle },
  });

  if (errors) throw new Error("Failed to fetch photos from metaobject");

  const photosField = data?.metaobject?.fields?.find(
    (field: any) => field.key === "photos",
  );
  if (!photosField?.references?.edges) return [];

  let photos: Photo[] = [];
  for (const edge of photosField.references.edges) {
    const image = edge?.node?.image;
    if (!image) continue;
    photos.push({
      url: image.url,
      altText: image.altText || "",
      width: image.width,
      height: image.height,
    });
  }
  return parsePhotos(photos);
}

export const MAX_QUANTITY = 10;
const STOREFRONT_ORIGIN = "https://jam.remix.run";

export async function createCart(params: {
  productId: string;
  quantity: number;
  discountCode?: string;
}): Promise<Cart | { error: string }> {
  let storefrontClient = getClient();
  if (!storefrontClient) {
    return { error: "Ticket checkout is unavailable right now" };
  }

  let { productId, quantity, discountCode } = params;
  discountCode = (discountCode ?? "").trim().toUpperCase();

  const createCartMutation = `
    mutation CartCreate($cartInput: CartInput!) {
      cartCreate(input: $cartInput) {
        cart {
          id
          checkoutUrl
          discountCodes {
            code
            applicable
          }
        }
        userErrors {
          field
          message
        }
        warnings {
          code
          message
          target
        }
      }
    }
  `;

  let response;
  try {
    response = await storefrontClient.request(createCartMutation, {
      variables: {
        cartInput: {
          lines: [
            {
              merchandiseId: productId,
              quantity,
            },
          ],
          discountCodes: discountCode ? [discountCode] : [],
        },
      },
    });
  } catch {
    return { error: "Ticket checkout is unavailable right now" };
  }

  const { data, errors } = response;

  let userError = data?.cartCreate?.userErrors?.[0]?.message;
  if (userError) {
    return { error: userError };
  }

  if (errors || !data?.cartCreate?.cart?.checkoutUrl) {
    return { error: "Failed to create cart" };
  }

  return parseCart({
    id: data.cartCreate.cart.id,
    checkoutUrl: data.cartCreate.cart.checkoutUrl,
  });
}

function createUnavailableProduct(
  unavailableReason: "storefront" | "product",
): Product {
  return parseProduct({
    id: "unavailable",
    price: "399.00",
    productId: "unavailable",
    availableForSale: false,
    unavailableReason,
  });
}

function isTrustedCheckoutUrl(value: string) {
  try {
    let url = new URL(value);
    return url.protocol === "https:" && url.origin === STOREFRONT_ORIGIN;
  } catch {
    return false;
  }
}
