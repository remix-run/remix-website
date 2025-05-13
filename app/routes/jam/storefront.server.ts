import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env } from "~/env.server";
import { z } from "zod";
import { redirect } from "react-router";

import tier1TicketSrc from "./images/tickets/tier1.avif";
import tier2TicketSrc from "./images/tickets/tier2.avif";
// import generalTicketSrc from "./images/tickets/general.avif";

// TEMPORARY: Discount code constants
export const { REMIX_JAM_DISCOUNT_TIER_1, REMIX_JAM_DISCOUNT_TIER_2 } = env;

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

  // TEMPORARY: Limit quantity based on discount type
  if (discountCode) {
    const discountData = getDiscountData(discountCode);
    quantity = Math.min(quantity, discountData.maxQuantity);
  }

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

  const { data, errors } = await getClient().request(createCartMutation, {
    variables: {
      cartInput: {
        lines: [
          {
            merchandiseId: productId,
            quantity,
          },
        ],
        discountCodes: discountCode ? [discountCode] : undefined,
      },
    },
  });

  if (errors || !data?.cartCreate?.cart?.checkoutUrl) {
    return { error: "Failed to create cart" };
  }

  // Temporarily validate that one of our special discount codes was actually applied
  // This ensures the discount codes are valid in Shopify and prevents any attempts
  // to bypass our validation
  const appliedCodes = data.cartCreate.cart.discountCodes
    .filter((d: { applicable: boolean }) => d.applicable)
    .map((d: { code: string }) => d.code.toUpperCase());

  const hasValidDiscount = appliedCodes.some((code: string) =>
    [REMIX_JAM_DISCOUNT_TIER_1, REMIX_JAM_DISCOUNT_TIER_2].includes(code),
  );

  if (!hasValidDiscount) {
    return { error: "Invalid discount code" };
  }

  const cart = {
    id: data.cartCreate.cart.id,
    checkoutUrl: data.cartCreate.cart.checkoutUrl,
  };

  return CartSchema.parse(cart);
}

const discountCodeFaq = [
  {
    question: "* Where do I find the promo code?",
    answer: "It is automatically applied when you checkout from this page.",
  },
  {
    question: "* Can I share the promo code?",
    answer: "Please don't.",
  },
];

export type DiscountData = {
  title: string;
  text: string;
  discountCode: string;
  price: string;
  imageSrc: string;
  badge: {
    value: string;
    color: "red" | "green";
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
  maxQuantity: number;
};

/**
 * Get's all the data for the ticket based on the discount code
 * Ideally this would be driven by the Shopify API, but we're setting some
 * hard-coded values for now since the promotion period is pretty specific
 * and pretty short.
 *
 * See more here: https://docs.google.com/document/d/1CgFvJjvow0gVLBq40rLKwicBVpNF9I8CO7gFjCSPa3s/edit?tab=t.59sjkuf6h2hh
 */
export function getDiscountData(discountCode?: string): DiscountData {
  discountCode = (discountCode ?? "").trim().toUpperCase();

  if (discountCode === REMIX_JAM_DISCOUNT_TIER_1) {
    return {
      title: "Contributor",
      text: "You have been personally invited to join us at Remix Jam 2025 due to your contributions to Remix and the community. This ticket is free of charge and can only be used with your promo code* one time only. Hope to see you there!",
      discountCode,
      price: "0",
      imageSrc: tier1TicketSrc,
      badge: {
        value: "contributor",
        color: "red",
      },
      faq: discountCodeFaq,
      maxQuantity: 1, // TEMPORARY: Limit contributor tickets to 1
    };
  }

  if (discountCode === REMIX_JAM_DISCOUNT_TIER_2) {
    return {
      title: "Friends & Family",
      text: "You have been personally invited to purchase a discounted ticket to Remix Jam 2025 with a discount code* before they are available for the general public.",
      discountCode,
      price: "149.00",
      imageSrc: tier2TicketSrc,
      badge: {
        value: "Friends & Family",
        color: "green",
      },
      faq: discountCodeFaq,
      maxQuantity: 10, // TEMPORARY: Set a reasonable default max
    };
  }

  // Will come later
  // if (discountCode === "EARLY_BIRD") {
  //   return {
  //     discountCode,
  //     price: "299.00",
  //     imageSrc: generalTicketSrc,
  //     faq: [],
  //   };
  // }

  // Temporarily redirect away from the ticket page if the user doesn't have the appropriate discount code
  throw redirect("/jam/2025");
}
