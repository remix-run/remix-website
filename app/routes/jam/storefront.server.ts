import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env } from "~/env.server";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";

// Initialize the client as a lazy singleton
let client: ReturnType<typeof createStorefrontApiClient> | null = null;
function getClient() {
  if (!client) {
    client = createStorefrontApiClient({
      storeDomain: "https://jam.remix.run",
      apiVersion: "2025-04",
      publicAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    });
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

export function parseProduct(raw: unknown): Product {
  return s.parse(ProductSchema, raw);
}

export function parseCart(raw: unknown): Cart {
  return s.parse(CartSchema, raw);
}

export function parsePhotos(raw: unknown): Photo[] {
  return s.parse(s.array(PhotoSchema), raw);
}

export async function getProduct(handle: string): Promise<Product> {
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

  const { data, errors } = await getClient().request(productQuery, {
    variables: { handle },
  });

  if (errors) {
    throw new Error("Failed to fetch product data");
  }

  const price =
    data?.product?.variants?.edges[0]?.node?.price?.amount || "399.00";
  const formattedPrice = Number(price).toFixed(2);
  const productId = data?.product?.variants?.edges[0]?.node?.id;
  const availableForSale =
    data?.product?.variants?.edges[0]?.node?.availableForSale || false;

  const product = {
    id: data?.product?.id,
    price: formattedPrice,
    productId,
    availableForSale,
  };

  return parseProduct(product);
}

// Shopify limits the number of file references to 128
const MAX_PHOTOS = 128;

export async function getPhotos(handle: string): Promise<Photo[]> {
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

  const { data, errors } = await getClient().request(metaobjectQuery, {
    variables: { handle },
  });

  if (errors) {
    throw new Error("Failed to fetch photos from metaobject");
  }

  // Find the photos field in the metaobject fields
  const photosField = data?.metaobject?.fields?.find(
    (field: any) => field.key === "photos",
  );

  let photos: Photo[] = [];

  if (!photosField?.references?.edges) {
    return [];
  }

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

export async function createCart(params: {
  productId: string;
  quantity: number;
  discountCode?: string;
}): Promise<Cart | { error: string }> {
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

  const { data, errors } = await getClient().request(createCartMutation, {
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

  const cart = {
    id: data.cartCreate.cart.id,
    checkoutUrl: data.cartCreate.cart.checkoutUrl,
  };

  return parseCart(cart);
}
