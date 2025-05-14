import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env } from "~/env.server";
import { z } from "zod";

import ticketSrc from "./images/tickets/general.avif";

const EARLY_BIRD_DISCOUNT_CODE = "EARLY_BIRD";

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

type Product = z.infer<typeof ProductSchema>;
type Cart = z.infer<typeof CartSchema>;

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
    data?.product?.variants?.edges[0]?.node?.price?.amount || "149.00";
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

export async function createCart(params: {
  productId: string;
  quantity: number;
  discountCode?: string;
}): Promise<Cart | { error: string }> {
  let { productId, quantity, discountCode } = params;
  quantity = Math.min(quantity, getDiscountData().maxQuantity);
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

  // Temporarily always the EARLY_BIRD discount code
  let discountCodes = [EARLY_BIRD_DISCOUNT_CODE];
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

export function getDiscountData() {
  return {
    title: "Early Bird",
    text: "Join us in October and enjoy the lower cost of admission for purchasing the ticket earlier.",
    price: "299.00",
    imageSrc: ticketSrc,
    maxQuantity: 10,
  };
}
