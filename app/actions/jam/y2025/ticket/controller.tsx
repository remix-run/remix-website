import * as s from "remix/data-schema";
import { max, min } from "remix/data-schema/checks";
import * as coerce from "remix/data-schema/coerce";
import * as f from "remix/data-schema/form-data";
import { createController } from "remix/router";

import {
  createCart,
  getProduct,
  MAX_QUANTITY,
} from "../../../../data/jam-storefront.ts";
import { CACHE } from "../../../../utils/cache-control.ts";
import { routes } from "../../../../routes.ts";
import { documentRedirect } from "../../../../utils/document-redirect.ts";
import { Jam2025TicketPage } from "./page.tsx";

export default createController(routes.jam.y2025.ticket, {
  actions: {
    async index({ render, request }) {
      let product = await getProduct("remix-jam-2025");
      return render(
        <Jam2025TicketPage
          initialQuantity={1}
          product={product}
          requestUrl={request.url}
        />,
        // A missing product usually means Storefront is down; don't let the
        // CDN keep serving the "unavailable" page after it recovers.
        product ? undefined : { headers: CACHE.PRIVATE },
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
          headers: CACHE.PRIVATE,
        },
      );
    },
  },
});

function parseTicketPurchaseSubmission(formData: FormData) {
  let result = s.parseSafe(ticketPurchaseSubmissionSchema, formData);
  if (!result.success) {
    return { success: false as const, error: "Invalid ticket request" };
  }

  return { success: true as const, value: result.value };
}

const ticketPurchaseSubmissionSchema = f.object({
  productId: f.field(s.string()),
  quantity: f.field(
    coerce.number().refine(Number.isInteger).pipe(min(1), max(MAX_QUANTITY)),
  ),
});
