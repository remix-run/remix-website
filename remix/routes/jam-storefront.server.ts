import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import { env } from "../../app/env.server";

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

const PhotoSchema = s.object({
  url: s.string().pipe(c.url()),
  altText: s.optional(s.string()),
  width: s.number(),
  height: s.number(),
});

type Product = s.InferOutput<typeof ProductSchema>;
type Photo = s.InferOutput<typeof PhotoSchema>;

export function parseProduct(raw: unknown): Product {
  return s.parse(ProductSchema, raw);
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

  if (errors) throw new Error("Failed to fetch product data");

  const price = data?.product?.variants?.edges[0]?.node?.price?.amount || "399.00";
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

  if (errors) throw new Error("Failed to fetch photos from metaobject");

  const photosField = data?.metaobject?.fields?.find((field: any) => field.key === "photos");
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
