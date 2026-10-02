import { createController } from "remix/router";

import { routes } from "../../../../routes.ts";
import { CACHE } from "../../../../utils/cache-control.ts";
import { renderJam2026Page } from "../controller.tsx";
import { submitTicketCheckout } from "../ticket-checkout.ts";

export default createController(routes.jam.y2026.ticket, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({ render, request });
    },

    async action({ formData, render, request }) {
      // Keep validating submissions, but never supply a purchasable product.
      // This also blocks stale forms and direct POSTs after sales close.
      let result = await submitTicketCheckout({ formData, product: null });
      if ("checkoutUrl" in result) {
        throw new Error("Ticket sales are closed");
      }

      return renderJam2026Page({
        cacheControl: CACHE.PRIVATE,
        render,
        request,
        status: result.status,
        ticketCheckout: {
          ...result.ticketCheckout,
          error:
            result.status === 400
              ? result.ticketCheckout.error
              : "Ticket sales are closed",
        },
      });
    },
  },
});
