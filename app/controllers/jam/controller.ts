import type { Controller } from "remix/fetch-router";

import { routes } from "../../routes.ts";
import { getRequestContext } from "../../utils/request-context.ts";
import { jam2025CocHandler } from "./2025-coc.tsx";
import { jam2025FaqHandler } from "./2025-faq.tsx";
import { jam2025GalleryHandler } from "./2025-gallery/controller.tsx";
import { jam2025GalleryDownloadHandler } from "./2025-gallery/download.ts";
import { jam2025LineupHandler } from "./2025-lineup.tsx";
import { jam2025TicketHandler } from "./2025-ticket.tsx";
import { jam2025Handler } from "./2025.tsx";
import { jam2026Handler } from "./2026/controller.tsx";
import {
  jam2026TicketsActionHandler,
  jam2026TicketsHandler,
} from "./2026/tickets.tsx";

export async function jamHandler() {
  let requestUrl = getRequestContext().request.url;
  let location = new URL(routes.jam.y2025.index.href(), requestUrl);
  return Response.redirect(location, 302);
}

export let jamController = {
  actions: {
    index: jamHandler,
    y2025: {
      actions: {
        index: jam2025Handler,
        ticket: jam2025TicketHandler,
        lineup: jam2025LineupHandler,
        faq: jam2025FaqHandler,
        coc: jam2025CocHandler,
        gallery: {
          actions: {
            index: jam2025GalleryHandler,
            download: jam2025GalleryDownloadHandler,
          },
        },
      },
    },
    y2026: {
      actions: {
        index: jam2026Handler,
        tickets: {
          actions: {
            index: jam2026TicketsHandler,
            action: jam2026TicketsActionHandler,
          },
        },
      },
    },
  },
} satisfies Controller<typeof routes.jam>;
