import { createController } from "remix/router";

import { routes } from "../../../../routes.ts";
import { CACHE } from "../../../../utils/cache-control.ts";
import { renderJam2026Page } from "../controller.tsx";
import { submitClosedTicketCheckout } from "../ticket-checkout.ts";

export default createController(routes.jam.y2026.ticket, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({ render, request });
    },

    action({ formData, render, request }) {
      // Sales are closed: stale forms and direct POSTs never reach Shopify.
      let { status, ticketCheckout } = submitClosedTicketCheckout(formData);

      return renderJam2026Page({
        cacheControl: CACHE.PRIVATE,
        render,
        request,
        status,
        ticketCheckout,
      });
    },
  },
});
