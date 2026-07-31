import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";

import {
  createCart,
  getProduct,
  MAX_QUANTITY,
} from "../../../data/jam-storefront.ts";
import { clearJam2026DiscountCode } from "./discount-code.ts";
import type { Jam2026Discount } from "./discount-code.ts";
import { remixJam2026Ticket } from "./public/ticket-data.ts";

export type Jam2026Product = Awaited<ReturnType<typeof getProduct>>;

export type Jam2026TicketCheckout = ReturnType<typeof createTicketCheckout>;

/**
 * Creates a Shopify cart for a ticket submission.
 *
 * Returns the checkout URL when checkout is ready, or the checkout state to
 * render back into the tickets modal when it is not.
 */
export async function submitTicketCheckout({
  discountCode,
  formData,
  product,
}: {
  discountCode?: string;
  formData: FormData;
  product: Jam2026Product | null;
}) {
  let submission = parseSubmission(formData);
  if (!submission.success) {
    return {
      status: 400,
      ticketCheckout: createTicketCheckout({
        discountCode,
        error: submission.error,
        product,
      }),
    };
  }

  let { productId, quantity } = submission.value;
  let checkoutError = getCheckoutError({ product, productId, quantity });
  if (checkoutError) {
    return {
      status: checkoutError.invalidInput ? 400 : 200,
      ticketCheckout: createTicketCheckout({
        discountCode,
        error: checkoutError.message,
        initialQuantity: quantity,
        product,
      }),
    };
  }

  let cart = await createCart({ discountCode, productId, quantity });
  if ("error" in cart) {
    return {
      status: 200,
      ticketCheckout: createTicketCheckout({
        discountCode,
        error: cart.error,
        initialQuantity: quantity,
        product,
      }),
    };
  }

  return { checkoutUrl: cart.checkoutUrl };
}

/**
 * Confirms a stored code still applies to the product by pricing a throwaway
 * cart. Codes that no longer apply are cleared instead of surfaced as errors.
 */
export async function validateTicketDiscount({
  discount,
  product,
}: {
  discount: Jam2026Discount;
  product: Jam2026Product | null;
}): Promise<{ code?: string; discount: Jam2026Discount }> {
  if (
    !discount.code ||
    !product ||
    product.unavailableReason ||
    !product.availableForSale
  ) {
    return { discount };
  }

  let cart = await createCart({
    discountCode: discount.code,
    productId: product.productId,
    quantity: 1,
  });
  if ("error" in cart) return { discount };

  if (cart.discountCode === discount.code) {
    return { code: discount.code, discount };
  }

  return { discount: { setCookie: await clearJam2026DiscountCode() } };
}

export function createTicketCheckout({
  discountCode,
  error,
  initialQuantity = 1,
  product,
}: {
  discountCode?: string;
  error?: string;
  initialQuantity?: number;
  product: Jam2026Product | null;
}) {
  let maxQuantity = getMaxQuantity(product);

  return {
    availableForSale: Boolean(product?.availableForSale),
    discountCode,
    error,
    initialQuantity: Math.min(Math.max(1, initialQuantity), maxQuantity),
    maxQuantity,
    productId: product?.unavailableReason ? undefined : product?.productId,
  };
}

let submissionSchema = f.object({
  ticketType: f.field(s.enum_([remixJam2026Ticket.type])),
  productId: f.field(s.string()),
  quantity: f.field(
    coerce.number().pipe(c.min(1), c.max(remixJam2026Ticket.maxQuantity)),
  ),
});

function parseSubmission(formData: FormData) {
  let result = s.parseSafe(submissionSchema, formData);
  if (!result.success) {
    return { success: false as const, error: "Invalid ticket request" };
  }

  if (!Number.isInteger(result.value.quantity)) {
    return { success: false as const, error: "Invalid quantity" };
  }

  return {
    success: true as const,
    value: {
      productId: result.value.productId,
      quantity: result.value.quantity,
    },
  };
}

function getCheckoutError({
  product,
  productId,
  quantity,
}: {
  product: Jam2026Product | null;
  productId: string;
  quantity: number;
}) {
  if (!product || product.unavailableReason === "storefront") {
    return {
      message: "Ticket checkout is unavailable right now",
      invalidInput: false,
    };
  }

  if (product.unavailableReason === "product") {
    return { message: "Tickets are not available yet", invalidInput: false };
  }

  if (productId !== product.productId) {
    return { message: "Invalid ticket selection", invalidInput: true };
  }

  if (!product.availableForSale) {
    return {
      message: "Tickets are sold out or unavailable",
      invalidInput: false,
    };
  }

  if (!isQuantityAllowed(quantity, product)) {
    return { message: "Invalid quantity", invalidInput: true };
  }
}

function getMaxQuantity(product: Jam2026Product | null) {
  let productMaximum = product?.quantityRule?.maximum;
  if (typeof productMaximum !== "number") return MAX_QUANTITY;
  return Math.max(1, Math.min(MAX_QUANTITY, productMaximum));
}

function isQuantityAllowed(quantity: number, product: Jam2026Product) {
  let quantityRule = product.quantityRule;
  if (!quantityRule) return quantity >= 1 && quantity <= MAX_QUANTITY;

  return (
    quantity >= quantityRule.minimum &&
    quantity <= getMaxQuantity(product) &&
    (quantity - quantityRule.minimum) % quantityRule.increment === 0
  );
}
