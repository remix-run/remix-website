import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { remixJam2026Ticket } from "./public/tickets/ticket-data.ts";
import {
  createClosedTicketCheckout,
  submitClosedTicketCheckout,
} from "./ticket-checkout.ts";

describe("Jam 2026 closed ticket checkout", () => {
  it("rejects malformed and out-of-range submissions", () => {
    for (let [formData, error] of [
      [ticketFormData({ quantity: "0" }), "Invalid ticket request"],
      [ticketFormData({ quantity: "1.5" }), "Invalid quantity"],
      [ticketFormData({ quantity: "11" }), "Invalid ticket request"],
      [ticketFormData({ quantity: "2abc" }), "Invalid ticket request"],
      [ticketFormData({ ticketType: "side-stage" }), "Invalid ticket request"],
    ] as const) {
      expect(submitClosedTicketCheckout(formData)).toMatchObject({
        status: 400,
        ticketCheckout: { availableForSale: false, error },
      });
    }
  });

  it("answers valid submissions with the closed state and keeps the quantity", () => {
    expect(submitClosedTicketCheckout(ticketFormData())).toEqual({
      status: 200,
      ticketCheckout: {
        availableForSale: false,
        error: "Ticket sales are closed",
        initialQuantity: 2,
        maxQuantity: remixJam2026Ticket.maxQuantity,
        productId: undefined,
      },
    });
  });

  it("clamps the rendered quantity to the ticket limits", () => {
    expect(createClosedTicketCheckout({ initialQuantity: 99 })).toMatchObject({
      initialQuantity: remixJam2026Ticket.maxQuantity,
    });
    expect(createClosedTicketCheckout({ initialQuantity: 0 })).toMatchObject({
      initialQuantity: 1,
    });
  });
});

function ticketFormData({
  quantity = "2",
  ticketType = remixJam2026Ticket.type,
}: { quantity?: string; ticketType?: string } = {}) {
  let formData = new FormData();
  formData.set("ticketType", ticketType);
  formData.set("productId", "gid://shopify/ProductVariant/2026");
  formData.set("quantity", quantity);
  return formData;
}
