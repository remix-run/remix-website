import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { render } from "../../../utils/render.ts";
import { getRequestContext } from "../../../utils/request-context.ts";
import { routes } from "../../../routes.ts";
import { Jam2026TicketsModalFrame } from "../../../assets/jam/2026/tickets-modal.tsx";
import { Jam2026HomePage } from "./ui/home-page.tsx";
import { ticketModalConfig } from "./tickets-modal-contract.ts";

export async function jam2026Handler() {
  let { request } = getRequestContext();
  let requestUrl = new URL(request.url);
  let ticketsModalOpen = requestUrl.pathname === routes.jam.y2026.ticket.href();
  let isTicketsFrameRequest =
    request.headers.get("x-remix-target") === ticketModalConfig.frameName;
  let responseInit = {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
      Vary: "x-remix-target",
    },
  };

  if (isTicketsFrameRequest) {
    return render.frame(
      <Jam2026TicketsModalFrame open={ticketsModalOpen} />,
      responseInit,
    );
  }

  return render.document(
    <Jam2026HomePage ticketsModalOpen={ticketsModalOpen} />,
    responseInit,
  );
}
