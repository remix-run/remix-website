import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import { SuperHeaders } from "remix/headers";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { getProduct } from "../../../data/jam-storefront.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import type { AppRenderer } from "../../../middleware/render.ts";
import { routes } from "../../../routes.ts";
import {
  resolveJam2026Discount,
  type Jam2026Discount,
} from "./discount-code.ts";
import { Jam2026TicketsModalFrame } from "./public/tickets-modal.tsx";
import { Jam2026HomePage } from "./home-page.tsx";
import { remixJam2026Ticket } from "./public/ticket-data.ts";
import { ticketModalConfig } from "./public/tickets-modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.ts";
import {
  createTicketCheckout,
  validateTicketDiscount,
  type Jam2026TicketCheckout,
} from "./ticket-checkout.ts";

export default createController(routes.jam.y2026, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({ render, request });
    },

    async theme({ formData }) {
      let result = s.parseSafe(themeSubmissionSchema, formData);

      if (!result.success) {
        return Response.json(
          { ok: false, error: "Invalid theme preference" },
          { status: 400 },
        );
      }

      return redirect(routes.jam.y2026.index.href(), {
        status: 303,
        headers: new SuperHeaders({
          cacheControl: "no-store",
          setCookie: await serializeJam2026ThemePreference(result.value.theme),
        }),
      });
    },
  },
});

/**
 * Renders the Jam 2026 page, or just the tickets modal when the request targets
 * the modal frame. Shared with the ticket route, which renders the same page
 * with the modal open.
 */
export async function renderJam2026Page({
  cacheControl = CACHE_CONTROL.DEFAULT,
  discount,
  render,
  request,
  status = 200,
  ticketCheckout,
}: {
  cacheControl?: string;
  discount?: Jam2026Discount;
  render: AppRenderer;
  request: Request;
  status?: number;
  ticketCheckout?: Jam2026TicketCheckout;
}) {
  discount ??= await resolveJam2026Discount(request);
  let requestUrl = new URL(request.url);
  let ticketsModalOpen =
    requestUrl.pathname === routes.jam.y2026.ticket.index.href();
  let isTicketsFrameRequest =
    request.headers.get("x-remix-target") === ticketModalConfig.frameName;
  let isServerResolvedFrame =
    request.headers.get("x-remix-ssr-frame") === "true";
  let theme = await getJam2026ThemePreference(request.headers.get("cookie"));
  let product = ticketsModalOpen
    ? await getProduct(remixJam2026Ticket.handle)
    : null;

  let validatedDiscount = await validateTicketDiscount({ discount, product });
  discount = validatedDiscount.discount;

  if (product) {
    ticketCheckout ??= createTicketCheckout({ product });
    ticketCheckout = {
      ...ticketCheckout,
      discountCode: validatedDiscount.code,
    };
  }

  let headers = new SuperHeaders({
    // Never let a shared cache store a response that hands out a Set-Cookie.
    cacheControl: discount.setCookie ? "no-store" : cacheControl,
    vary: ["Cookie", "x-remix-target", "x-remix-ssr-frame"],
  });
  if (discount.setCookie) headers.append("Set-Cookie", discount.setCookie);

  let responseInit = { status, headers };

  if (isTicketsFrameRequest) {
    return render(
      <Jam2026TicketsModalFrame
        animateEntrance={!isServerResolvedFrame}
        open={ticketsModalOpen}
        ticketCheckout={ticketCheckout}
      />,
      responseInit,
    );
  }

  return render(
    <Jam2026HomePage
      requestUrl={request.url}
      ticketsModalOpen={ticketsModalOpen}
      theme={theme}
      ticketCheckout={ticketCheckout}
    />,
    responseInit,
  );
}

let themeSubmissionSchema = f.object({
  theme: f.field(s.enum_(["light", "dark"])),
});
