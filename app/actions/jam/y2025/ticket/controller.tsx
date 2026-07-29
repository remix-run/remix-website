import { createController } from "remix/router";

import { createCart, getProduct } from "../../../../data/jam-storefront.ts";
import { CACHE_CONTROL } from "../../../../utils/cache-control.ts";
import { routes } from "../../../../routes.ts";
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
        { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } },
      );
    },

    async action({ formData, render, request }) {
      let product = await getProduct("remix-jam-2025");
      let submission = parseTicketPurchaseSubmission(formData);
      let formError: string | undefined;
      let initialQuantity = 1;

      if (!submission.success) {
        formError = submission.error;
      } else {
        initialQuantity = submission.value.quantity;

        if (submission.value.productId !== product.productId) {
          formError = "Invalid ticket selection";
        } else {
          let cart = await createCart({
            productId: submission.value.productId,
            quantity: submission.value.quantity,
            discountCode:
              new URL(request.url).searchParams.get("discount") ?? undefined,
          });

          if (!("error" in cart)) {
            return Response.redirect(cart.checkoutUrl, 303);
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
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    },
  },
});
