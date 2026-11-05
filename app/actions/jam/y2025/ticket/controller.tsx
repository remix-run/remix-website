import { createController } from "remix/router";

import { createCart, getProduct } from "../../../../data/jam-storefront.ts";
import { CACHE } from "../../../../utils/cache-control.ts";
import { routes } from "../../../../routes.ts";
import { documentRedirect } from "../../../document-redirect.ts";
import { Jam2025TicketPage, parseTicketPurchaseSubmission } from "./page.tsx";

export default createController(routes.jam.y2025.ticket, {
  actions: {
    async index({ render, request }) {
      return render(
        <Jam2025TicketPage
          initialQuantity={1}
          product={await getProduct("remix-jam-2025")}
          requestUrl={request.url}
        />,
      );
    },

    async action({ formData, render, request }) {
      let product = await getProduct("remix-jam-2025");
      let submission = parseTicketPurchaseSubmission(formData);
      let formError: string | undefined;
      let invalidInput = false;
      let initialQuantity = 1;

      if (!submission.success) {
        formError = submission.error;
        invalidInput = true;
      } else {
        initialQuantity = submission.value.quantity;

        if (!product) {
          formError = "Ticket checkout is unavailable right now";
        } else if (submission.value.productId !== product.productId) {
          formError = "Invalid ticket selection";
          invalidInput = true;
        } else {
          let cart = await createCart({
            productId: submission.value.productId,
            quantity: submission.value.quantity,
            discountCode: new URL(request.url).searchParams.get("discount"),
          });

          if (!("error" in cart)) {
            return documentRedirect(request, cart.checkoutUrl);
          }

          formError = cart.error;
        }
      }

      return render(
        <Jam2025TicketPage
          formError={formError}
          initialQuantity={initialQuantity}
          product={product}
          requestUrl={request.url}
        />,
        {
          // Only bad input is a client error; an unavailable product or a
          // failed checkout re-renders the page with the message.
          status: invalidInput ? 400 : 200,
          headers: { "Cache-Control": CACHE.PRIVATE },
        },
      );
    },
  },
});
