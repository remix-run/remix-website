import { SuperHeaders } from "remix/headers";
import { createController } from "remix/router";

import { getProduct } from "../../../../data/jam-storefront.ts";
import { routes } from "../../../../routes.ts";
import { documentRedirect } from "../../../document-redirect.ts";
import { renderJam2026Page } from "../controller.tsx";
import { remixJam2026Ticket } from "../public/ticket-data.ts";
import { submitTicketCheckout } from "../ticket-checkout.ts";

export default createController(routes.jam.y2026.ticket, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({ render, request });
    },

    async action({ formData, render, request }) {
      let result = await submitTicketCheckout({
        formData,
        product: await getProduct(remixJam2026Ticket.handle),
      });

      if ("checkoutUrl" in result) {
        if (!result.checkoutUrl) {
          throw new Error("Shopify cart did not return a checkout URL");
        }

        let headers = new SuperHeaders({ cacheControl: "no-store" });
        return documentRedirect(request, result.checkoutUrl, { headers });
      }

      return renderJam2026Page({
        cacheControl: "no-store",
        render,
        request,
        status: result.status,
        ticketCheckout: result.ticketCheckout,
      });
    },
  },
});
