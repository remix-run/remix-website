import { SuperHeaders } from "remix/headers";

import { getJam2026Schedule } from "./schedule-data.ts";
import { CACHE } from "../../../utils/cache-control.ts";
import {
  FRAME_TARGET_HEADER,
  SSR_FRAME_HEADER,
  getFrameTarget,
  isServerResolvedFrame,
} from "../../../utils/public/frame-headers.ts";
import type { AppRenderer } from "../../../middleware/render.ts";
import { getJam2026DiscountCookieUpdate } from "./discount-code.ts";
import { Jam2026TicketsModalFrame } from "./public/tickets/tickets-modal.tsx";
import { Jam2026HomePage } from "./home-page.tsx";
import {
  ticketModalConfig,
  type Jam2026TicketCheckout,
} from "./public/tickets/tickets-modal-contract.ts";
import { getJam2026ThemePreference } from "./theme-preference.ts";

export type RenderJam2026PageOptions = {
  /** Opt out of shared caching, e.g. for responses to form submissions. */
  privateResponse?: boolean;
  render: AppRenderer;
  request: Request;
  status?: number;
  /**
   * Checkout state for the tickets modal. Passing it renders the page with the
   * modal open; omit it to render the page with the modal closed.
   */
  ticketCheckout?: Jam2026TicketCheckout;
};

/**
 * Renders the Jam 2026 page, or just the tickets modal when the request targets
 * the modal frame. Shared by the home and ticket routes.
 */
export async function renderJam2026Page({
  privateResponse = false,
  render,
  request,
  status = 200,
  ticketCheckout,
}: RenderJam2026PageOptions) {
  let discountCookie = await getJam2026DiscountCookieUpdate(request);
  let ticketsModalOpen = ticketCheckout !== undefined;
  let isTicketsFrameRequest =
    getFrameTarget(request) === ticketModalConfig.frameName;
  let theme = await getJam2026ThemePreference(request.headers.get("cookie"));

  // Never let a shared cache store a response that hands out a Set-Cookie.
  let headers = new SuperHeaders({
    cacheControl:
      discountCookie || privateResponse
        ? CACHE.PRIVATE["Cache-Control"]
        : undefined,
    vary: ["Cookie", FRAME_TARGET_HEADER, SSR_FRAME_HEADER],
  });
  if (discountCookie) headers.append("Set-Cookie", discountCookie);

  let responseInit = { status, headers };

  if (isTicketsFrameRequest) {
    return render(
      <Jam2026TicketsModalFrame
        animateEntrance={!isServerResolvedFrame(request)}
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
