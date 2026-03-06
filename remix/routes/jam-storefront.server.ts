import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import { LRUCache } from "lru-cache";
import { env } from "../env.server";

let client: ReturnType<typeof createStorefrontApiClient> | null = null;

function getClient() {
  if (!env.PUBLIC_STOREFRONT_API_TOKEN) {
    return null;
  }

  if (!client) {
    try {
      client = createStorefrontApiClient({
        storeDomain: "https://jam.remix.run",
        apiVersion: "2025-04",
        publicAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
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
});

const CartSchema = s.object({
  id: s.string(),
  checkoutUrl: s.string().pipe(c.url()),
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

let photosCache = new LRUCache<string, Photo[]>({
  max: 16,
  ttl: 1000 * 60 * 5,
  maxSize: 1024 * 1024 * 2,
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + key.length;
  },
});

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
    return parseProduct({
      id: "unavailable",
      price: "399.00",
      productId: "unavailable",
      availableForSale: false,
    });
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
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await storefrontClient.request(productQuery, {
    variables: { handle },
  });

  if (errors) throw new Error("Failed to fetch product data");

  const price =
    data?.product?.variants?.edges[0]?.node?.price?.amount || "399.00";
  const product = {
    id: data?.product?.id,
    price: Number(price).toFixed(2),
    productId: data?.product?.variants?.edges[0]?.node?.id,
    availableForSale:
      data?.product?.variants?.edges[0]?.node?.availableForSale || false,
  };

  return parseProduct(product);
}

const MAX_PHOTOS = 128;

export async function getPhotos(handle: string): Promise<Photo[]> {
  let cached = photosCache.get(handle);
  if (cached) return cached;

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
  let parsedPhotos = parsePhotos(photos);
  photosCache.set(handle, parsedPhotos);
  return parsedPhotos;
}

export const MAX_QUANTITY = 10;

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
  quantity = Math.min(quantity, MAX_QUANTITY);
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
      }
    }
  `;

  let discountCodes = [];
  if (discountCode) {
    discountCodes.push(discountCode);
  }

  const { data, errors } = await storefrontClient.request(createCartMutation, {
    variables: {
      cartInput: {
        lines: [
          {
            merchandiseId: productId,
            quantity,
          },
        ],
        discountCodes,
      },
    },
  });

  if (errors || !data?.cartCreate?.cart?.checkoutUrl) {
    return { error: "Failed to create cart" };
  }

  return parseCart({
    id: data.cartCreate.cart.id,
    checkoutUrl: data.cartCreate.cart.checkoutUrl,
  });
}
