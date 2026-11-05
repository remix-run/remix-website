import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import { SuperHeaders } from "remix/headers";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { getJam2026Schedule } from "./schedule-data.ts";
import { CACHE } from "../../../utils/cache-control.ts";
import type { AppRenderer } from "../../../middleware/render.ts";
import { routes } from "../../../routes.ts";
import { getNewsletterSubscriptionStatus } from "../../../utils/newsletter-subscription.ts";
import { getJam2026DiscountCookieUpdate } from "./discount-code.ts";
import { Jam2026TicketsModalFrame } from "./public/tickets-modal.tsx";
import { Jam2026NewsletterForm } from "./public/newsletter-form.tsx";
import { Jam2026HomePage } from "./home-page.tsx";
import { ticketModalConfig } from "./public/tickets-modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.ts";
import {
  createClosedTicketCheckout,
  type Jam2026TicketCheckout,
} from "./ticket-checkout.ts";

export default createController(routes.jam.y2026, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({ render, request });
    },

    newsletterSignup({ render, request }) {
      return render(
        <Jam2026NewsletterForm
          status={getNewsletterSubscriptionStatus(request)}
        />,
        { headers: { "Cache-Control": CACHE.PRIVATE } },
      );
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
          cacheControl: CACHE.PRIVATE,
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
  cacheControl,
  render,
  request,
  status = 200,
  ticketCheckout,
}: {
  cacheControl?: string;
  render: AppRenderer;
  request: Request;
  status?: number;
  ticketCheckout?: Jam2026TicketCheckout;
}) {
  let requestUrl = new URL(request.url);

  let discountCookie = await getJam2026DiscountCookieUpdate(request);
  let ticketsModalOpen =
    requestUrl.pathname === routes.jam.y2026.ticket.index.href();
  let isTicketsFrameRequest =
    request.headers.get("x-remix-target") === ticketModalConfig.frameName;
  let isServerResolvedFrame =
    request.headers.get("x-remix-ssr-frame") === "true";
  let theme = await getJam2026ThemePreference(request.headers.get("cookie"));
  if (ticketsModalOpen) ticketCheckout ??= createClosedTicketCheckout();

  // Never let a shared cache store a response that hands out a Set-Cookie.
  let headers = new SuperHeaders({
    cacheControl: discountCookie ? CACHE.PRIVATE : cacheControl,
    vary: ["Cookie", "x-remix-target", "x-remix-ssr-frame"],
  });
  if (discountCookie) headers.append("Set-Cookie", discountCookie);

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
      schedule={await getJam2026Schedule()}
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
