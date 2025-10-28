import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env } from "~/env.server";
import { z } from "zod";

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

const ProductSchema = z.object({
  id: z.string(),
  price: z.string(),
  productId: z.string(),
  availableForSale: z.boolean(),
});

const CartSchema = z.object({
  id: z.string(),
  checkoutUrl: z.string().url(),
});

const PhotoSchema = z.object({
  url: z.string().url(),
  altText: z.string().optional(),
  width: z.number(),
  height: z.number(),
});

type Product = z.infer<typeof ProductSchema>;
type Cart = z.infer<typeof CartSchema>;
type Photo = z.infer<typeof PhotoSchema>;

/**
 * Transform a Shopify image URL to use CDN optimizations
 * @param url - Original Shopify image URL
 * @param options - Transformation options (width, height, format, quality)
 */
export function transformShopifyImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: "webp" | "jpg" | "png";
    quality?: number;
  } = {},
): string {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    Object.entries(options).forEach(([key, value]) => {
      params.set(key, value.toString());
    });

    urlObj.search = params.toString();
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
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

  return ProductSchema.parse(product);
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

  return z.array(PhotoSchema).parse(photos);
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

  return CartSchema.parse(cart);
}
