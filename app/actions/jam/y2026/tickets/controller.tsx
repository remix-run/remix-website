import { createController } from "remix/router";
import { routes } from "../../../../routes.ts";
import { CACHE_CONTROL } from "../../../../utils/cache-control.ts";
import { render } from "../../../../utils/render.ts";
import { Jam2026TicketsPage } from "../tickets-page.tsx";

export let jam2026TicketsController = createController(
  routes.jam.y2026.tickets,
  {
    actions: {
      index: jam2026TicketsHandler,
      action: jam2026TicketsActionHandler,
    },
  },
);

export async function jam2026TicketsHandler() {
  return renderTicketPage();
}

export async function jam2026TicketsActionHandler() {
  return renderTicketPage({
    status: 409,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function renderTicketPage(init?: ResponseInit) {
  let headers = new Headers(init?.headers);
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", CACHE_CONTROL.DEFAULT);
  }

  return render.document(<Jam2026TicketsPage />, {
    ...init,
    headers,
  });
}
