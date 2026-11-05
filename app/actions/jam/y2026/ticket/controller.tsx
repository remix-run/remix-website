import { createController } from "remix/router";

import { routes } from "../../../../routes.ts";
import { renderJam2026Page } from "../render-page.tsx";
import {
  createClosedTicketCheckout,
  submitClosedTicketCheckout,
} from "../ticket-checkout.ts";

export default createController(routes.jam.y2026.ticket, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({
        render,
        request,
        ticketCheckout: createClosedTicketCheckout(),
      });
    },

    action({ formData, render, request }) {
      // Sales are closed: stale forms and direct POSTs never reach Shopify.
      let { status, ticketCheckout } = submitClosedTicketCheckout(formData);

      return renderJam2026Page({
        privateResponse: true,
        render,
        request,
        status,
        ticketCheckout,
      });
    },
  },
});
