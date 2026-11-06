import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import { env } from "../utils/env.ts";

// Jam Storefront reads never throw. Missing configuration, transport failures,
// GraphQL errors and unexpected response shapes are logged and reported as
// `null` (product, photos) or `{ error }` (cart) so pages can render a degraded
// state. Photos keep "unavailable" (`null`) distinct from "none" (`[]`) so a
// transient outage is never cached as an empty gallery.

export const MAX_QUANTITY = 10;
const STOREFRONT_ORIGIN = "https://jam.remix.run";
const MAX_PHOTOS = 128;
const CHECKOUT_UNAVAILABLE = "Ticket checkout is unavailable right now";
const CART_FAILED = "Failed to create cart";

const PhotoSchema = s.object({
  url: s.string().pipe(c.url()),
  altText: s.string(),
  width: s.number(),
  height: s.number(),
});

const CartSchema = s.object({
  id: s.string(),
  checkoutUrl: s
    .string()
    .pipe(c.url())
    .refine(isTrustedCheckoutUrl, "Expected trusted checkout URL"),
});

export type Product = {
  id: string;
  price: string;
  productId: string;
  availableForSale: boolean;
};
type Photo = s.InferOutput<typeof PhotoSchema>;
type Cart = s.InferOutput<typeof CartSchema>;

/** Returns the product's first variant, or null when it can't be loaded. */
export async function getProduct(handle: string): Promise<Product | null> {
  let data = await requestStorefront("product", productQuery, { handle });
  if (data === null) return null;

  let result = s.parseSafe(productResponseSchema, data);
  if (!result.success) {
    logStorefrontError("product response", result.issues);
    return null;
  }

  let product = result.value.product;
  let variant = product?.variants.edges[0]?.node;
  if (!product || !variant) return null;

  return {
    id: product.id,
    price: Number(variant.price.amount).toFixed(2),
    productId: variant.id,
    availableForSale: variant.availableForSale,
  };
}

/**
 * Returns the images attached to a `remix_jam_photos` metaobject, or `null`
 * when Storefront can't be loaded. Invalid images are skipped individually.
 */
export async function getPhotos(handle: string): Promise<Photo[] | null> {
  let data = await requestStorefront("photos", metaobjectQuery, { handle });
  if (data === null) return null;

  let result = s.parseSafe(metaobjectResponseSchema, data);
  if (!result.success) {
    logStorefrontError("photos response", result.issues);
    return null;
  }

  let edges =
    result.value.metaobject?.fields.find((field) => field.key === "photos")
      ?.references?.edges ?? [];

  let photos: Photo[] = [];
  for (let { node } of edges) {
    if (!node.image) continue;
    let photo = s.parseSafe(PhotoSchema, {
      ...node.image,
      altText: node.image.altText ?? "",
    });
    if (photo.success) photos.push(photo.value);
    else logStorefrontError("photo", photo.issues);
  }
  return photos;
}

// Shopify discount codes are case-insensitive; normalize to uppercase so the
// value matches what the Storefront API reports back.
const discountCodePattern = /^[A-Z0-9][A-Z0-9_-]{0,63}$/;

/** Returns the uppercased code, or `undefined` for anything that isn't a plausible discount code. */
export function normalizeDiscountCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  let code = value.trim().toUpperCase();
  return discountCodePattern.test(code) ? code : undefined;
}

/**
 * Creates a cart for one product line and returns its checkout URL.
 *
 * Shopify keeps a discount code on the cart even when it doesn't apply, and
 * then shows it as an error at checkout. An inapplicable code is therefore
 * removed; if removal fails, a second cart is created without the code.
 * Malformed codes are ignored.
 */
export async function createCart({
  discountCode,
  productId,
  quantity,
}: {
  discountCode?: string | null;
  productId: string;
  quantity: number;
}): Promise<Cart | { error: string }> {
  let code = normalizeDiscountCode(discountCode);
  let created = await requestCartCreate({ code, productId, quantity });
  if ("error" in created) return created;

  let cart: unknown = created.cart;
  if (code && !created.appliedCodes.includes(code)) {
    let withoutCode = await removeCartDiscountCodes(created.cart.id);
    if (!withoutCode) {
      let retried = await requestCartCreate({ productId, quantity });
      if ("error" in retried) return retried;
      withoutCode = retried.cart;
    }
    cart = withoutCode;
  }

  let result = s.parseSafe(CartSchema, cart);
  if (!result.success) {
    logStorefrontError("cart", result.issues);
    return { error: CART_FAILED };
  }
  return result.value;
}

async function requestCartCreate({
  code,
  productId,
  quantity,
}: {
  code?: string;
  productId: string;
  quantity: number;
}): Promise<
  | { cart: { id: string; checkoutUrl: string }; appliedCodes: string[] }
  | { error: string }
> {
  let data = await requestStorefront("cartCreate", createCartMutation, {
    cartInput: {
      lines: [{ merchandiseId: productId, quantity }],
      ...(code ? { discountCodes: [code] } : {}),
    },
  });
  if (data === null) return { error: CHECKOUT_UNAVAILABLE };

  let result = s.parseSafe(cartCreateResponseSchema, data);
  if (!result.success) {
    logStorefrontError("cartCreate response", result.issues);
    return { error: CART_FAILED };
  }

  let { cart, userErrors } = result.value.cartCreate;
  if (userErrors[0]) return { error: userErrors[0].message };
  if (!cart) return { error: CART_FAILED };

  return {
    cart: { id: cart.id, checkoutUrl: cart.checkoutUrl },
    appliedCodes: cart.discountCodes
      .filter((candidate) => candidate.applicable)
      .map((candidate) => candidate.code.trim().toUpperCase()),
  };
}

async function removeCartDiscountCodes(cartId: string) {
  let data = await requestStorefront(
    "cartDiscountCodesUpdate",
    removeDiscountCodesMutation,
    { cartId, discountCodes: [] },
  );
  if (data === null) return null;

  let result = s.parseSafe(cartDiscountCodesUpdateResponseSchema, data);
  if (!result.success) {
    logStorefrontError("cartDiscountCodesUpdate response", result.issues);
    return null;
  }

  let { cart, userErrors } = result.value.cartDiscountCodesUpdate;
  if (userErrors.length > 0) {
    logStorefrontError("cartDiscountCodesUpdate", userErrors);
    return null;
  }
  return cart;
}

type StorefrontClient = ReturnType<typeof createStorefrontApiClient>;
let client: StorefrontClient | undefined;

function getClient() {
  if (!env.PUBLIC_STOREFRONT_API_TOKEN) return null;

  client ??= createStorefrontApiClient({
    storeDomain: STOREFRONT_ORIGIN,
    apiVersion: "2026-04",
    publicAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    customFetchApi: (...args) => fetch(...args),
  });
  return client;
}

/**
 * Runs a Storefront operation and returns its `data`, or null when Storefront
 * isn't configured, the request fails, or the response carries GraphQL errors.
 */
async function requestStorefront(
  operation: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> {
  let storefrontClient = getClient();
  if (!storefrontClient) return null;

  try {
    let { data, errors } = await storefrontClient.request(query, {
      variables,
    });
    if (errors) {
      logStorefrontError(operation, errors);
      return null;
    }
    return data ?? null;
  } catch (error) {
    logStorefrontError(operation, error);
    return null;
  }
}

function logStorefrontError(operation: string, error: unknown) {
  console.error(`[storefront] ${operation} failed`, error);
}

function isTrustedCheckoutUrl(value: string) {
  return URL.parse(value)?.origin === STOREFRONT_ORIGIN;
}

const productResponseSchema = s.object({
  product: s.nullable(
    s.object({
      id: s.string(),
      variants: s.object({
        edges: s.array(
          s.object({
            node: s.object({
              id: s.string(),
              price: s.object({ amount: s.string() }),
              availableForSale: s.boolean(),
            }),
          }),
        ),
      }),
    }),
  ),
});

const metaobjectResponseSchema = s.object({
  metaobject: s.nullable(
    s.object({
      fields: s.array(
        s.object({
          key: s.string(),
          references: s.nullable(
            s.object({
              edges: s.array(
                s.object({
                  node: s.object({
                    image: s.optional(
                      s.nullable(
                        s.object({
                          url: s.string(),
                          altText: s.nullable(s.string()),
                          width: s.number(),
                          height: s.number(),
                        }),
                      ),
                    ),
                  }),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
  ),
});

const userErrorsSchema = s.array(s.object({ message: s.string() }));

const cartCreateResponseSchema = s.object({
  cartCreate: s.object({
    cart: s.nullable(
      s.object({
        id: s.string(),
        checkoutUrl: s.string(),
        discountCodes: s.array(
          s.object({ code: s.string(), applicable: s.boolean() }),
        ),
      }),
    ),
    userErrors: userErrorsSchema,
  }),
});

const cartDiscountCodesUpdateResponseSchema = s.object({
  cartDiscountCodesUpdate: s.object({
    cart: s.nullable(s.object({ id: s.string(), checkoutUrl: s.string() })),
    userErrors: userErrorsSchema,
  }),
});

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
          }
        }
      }
    }
  }
`;

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
    }
  }
`;

const removeDiscountCodesMutation = `
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;
