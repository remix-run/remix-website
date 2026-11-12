import * as f from "remix/data-schema/form-data";
import * as s from "remix/data-schema";
import { SuperHeaders } from "remix/headers";
import { redirect } from "remix/response/redirect";
import { createController } from "remix/router";

import { getJam2026Schedule } from "../../../data/jam-schedule-2026.ts";
import { CACHE } from "../../../utils/cache-control.ts";
import type { AppRenderer } from "../../../middleware/render.ts";
import { routes } from "../../../routes.ts";
import { getNewsletterSubscriptionStatus } from "../../newsletter/subscription.tsx";
import {
  resolveJam2026Discount,
  type Jam2026Discount,
} from "./discount-code.ts";
import { Jam2026NewsletterSignup } from "./public/newsletter-signup.tsx";
import { Jam2026HomePage } from "./home-page.tsx";
import { Jam2026ModalFrame } from "./modal-frame.tsx";
import { getJam2026Photos, getPhotoCards } from "./photo-lookup.ts";
import { findPhotoViewerState } from "./public/shopify-photo.ts";
import { jam2026ModalConfig } from "./public/modal-contract.ts";
import {
  getJam2026ThemePreference,
  serializeJam2026ThemePreference,
} from "./theme-preference.ts";
import {
  createTicketCheckout,
  type Jam2026TicketCheckout,
} from "./ticket-checkout.ts";

export default createController(routes.jam.y2026, {
  actions: {
    index({ render, request }) {
      return renderJam2026Page({ render, request });
    },

    newsletterSignup({ render, request }) {
      return render(
        <Jam2026NewsletterSignup
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
 * Renders the Jam 2026 page, or just the modal frame when the request targets
 * it. Shared with the ticket and photo routes, which render the same page with
 * the tickets modal or the photo viewer open.
 */
export async function renderJam2026Page({
  cacheControl,
  discount,
  photo,
  render,
  request,
  status = 200,
  ticketCheckout,
}: {
  cacheControl?: string;
  discount?: Jam2026Discount;
  /** The slug of the photo to open in the viewer. */
  photo?: string;
  render: AppRenderer;
  request: Request;
  status?: number;
  ticketCheckout?: Jam2026TicketCheckout;
}) {
  let requestUrl = new URL(request.url);

  discount ??= await resolveJam2026Discount(request);
  let ticketsModalOpen =
    requestUrl.pathname === routes.jam.y2026.ticket.index.href();
  let isModalFrameRequest =
    request.headers.get("x-remix-target") === jam2026ModalConfig.frameName;
  let isServerResolvedFrame =
    request.headers.get("x-remix-ssr-frame") === "true";
  let theme = await getJam2026ThemePreference(request.headers.get("cookie"));
  // Conference-day sales are closed, regardless of Shopify inventory.
  // Do not fetch products or create discount-validation carts for this page.
  if (ticketsModalOpen) {
    ticketCheckout ??= createTicketCheckout({ product: null });
  }

  // Never let a shared cache store a response that hands out a Set-Cookie.
  let headers = new SuperHeaders({
    cacheControl: discount.setCookie ? CACHE.PRIVATE : cacheControl,
    vary: ["Cookie", "x-remix-target", "x-remix-ssr-frame"],
  });
  if (discount.setCookie) headers.append("Set-Cookie", discount.setCookie);

  // The modal frame needs the photos only to open one; the page always shows
  // them.
  let photos =
    photo !== undefined || !isModalFrameRequest
      ? getPhotoCards(await getJam2026Photos())
      : [];
  let photoViewer =
    photo === undefined ? undefined : findPhotoViewerState(photos, photo);
  // An unknown photo still renders the page, just without the viewer.
  if (photo !== undefined && !photoViewer) status = 404;

  let responseInit = { status, headers };

  if (isModalFrameRequest) {
    return render(
      <Jam2026ModalFrame
        animateEntrance={!isServerResolvedFrame}
        photoViewer={photoViewer}
        ticketsModalOpen={ticketsModalOpen}
        ticketCheckout={ticketCheckout}
      />,
      responseInit,
    );
  }

  return render(
    <Jam2026HomePage
      photos={photos}
      photoViewer={photoViewer}
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
