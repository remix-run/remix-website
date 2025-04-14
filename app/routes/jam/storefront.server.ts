import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { env } from "~/env.server";

// Initialize the client as a singleton
const client = createStorefrontApiClient({
  storeDomain: "https://jam.remix.run",
  apiVersion: "2025-04",
  publicAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
});

type Product = {
  id: string;
  price: string;
  productId: string;
};

type Cart = {
  id: string;
  checkoutUrl: string;
};

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
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await client.request(productQuery, {
    variables: { handle },
  });

  if (errors) {
    throw new Error("Failed to fetch product data");
  }

  const price =
    data?.product?.variants?.edges[0]?.node?.price?.amount || "149.00";
  const formattedPrice = Number(price).toFixed(2);
  const productId = data?.product?.variants?.edges[0]?.node?.id;

  return {
    id: data?.product?.id,
    price: formattedPrice,
    productId,
  };
}

export async function createCart(params: {
  productId: string;
  quantity: number;
  discountCode?: string;
}): Promise<Cart> {
  const { productId, quantity, discountCode } = params;

  const createCartMutation = `
    mutation CartCreate($cartInput: CartInput!) {
      cartCreate(input: $cartInput) {
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

  const { data, errors } = await client.request(createCartMutation, {
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
    throw new Error("Failed to create cart");
  }

  return {
    id: data.cartCreate.cart.id,
    checkoutUrl: data.cartCreate.cart.checkoutUrl,
  };
}
