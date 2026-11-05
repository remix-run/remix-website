import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import * as c from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";

import { remixJam2026Ticket } from "./public/ticket-data.ts";

// Conference-day ticket sales are closed regardless of Shopify inventory, so
// the ticket flow never fetches products or creates carts. If sales reopen,
// restore the Storefront checkout path from git history.

export type Jam2026TicketCheckout = ReturnType<
  typeof createClosedTicketCheckout
>;

/**
 * Handles a ticket form submission while sales are closed. Malformed
 * submissions still get a 400 with a validation error; valid ones (stale forms
 * or direct POSTs) render the closed state without contacting Shopify.
 */
export function submitClosedTicketCheckout(formData: FormData) {
  let submission = parseSubmission(formData);
  if (!submission.success) {
    return {
      status: 400,
      ticketCheckout: createClosedTicketCheckout({ error: submission.error }),
    };
  }

  return {
    status: 200,
    ticketCheckout: createClosedTicketCheckout({
      error: "Ticket sales are closed",
      initialQuantity: submission.value.quantity,
    }),
  };
}

/** Modal state for the closed ticket flow: checkout is never available. */
export function createClosedTicketCheckout({
  error,
  initialQuantity = 1,
}: {
  error?: string;
  initialQuantity?: number;
} = {}) {
  let maxQuantity = remixJam2026Ticket.maxQuantity;

  return {
    availableForSale: false,
    error,
    initialQuantity: Math.min(Math.max(1, initialQuantity), maxQuantity),
    maxQuantity,
    productId: undefined,
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

  return { success: true as const, value: { quantity: result.value.quantity } };
}
