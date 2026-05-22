import { createController } from "remix/router";

import { routes } from "../../routes.ts";
import { jam2025CocHandler } from "./2025/coc.tsx";
import { jam2025FaqHandler } from "./2025/faq.tsx";
import { jam2025GalleryHandler } from "./2025/gallery/controller.tsx";
import { jam2025GalleryDownloadHandler } from "./2025/gallery/download.ts";
import { jam2025LineupHandler } from "./2025/lineup.tsx";
import { jam2025TicketHandler } from "./2025/ticket.tsx";
import { jam2025Handler } from "./2025/controller.tsx";
import {
  jam2026Handler,
  jam2026ThemeAction,
  jam2026TicketAction,
} from "./2026/controller.tsx";

export async function jamRedirectHandler() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: routes.jam.y2026.index.href(),
    },
  });
}

export let jam2025Controller = createController(routes.jam.y2025, {
  actions: {
    index: jam2025Handler,
    lineup: jam2025LineupHandler,
    faq: jam2025FaqHandler,
    coc: jam2025CocHandler,
  },
});

export let jam2025GalleryController = createController(
  routes.jam.y2025.gallery,
  {
    actions: {
      index: jam2025GalleryHandler,
      download: jam2025GalleryDownloadHandler,
    },
  },
);

export let jam2025TicketController = createController(routes.jam.y2025.ticket, {
  actions: {
    index: jam2025TicketHandler,
    action: jam2025TicketHandler,
  },
});

export let jam2026Controller = createController(routes.jam.y2026, {
  actions: {
    index: jam2026Handler,
    theme: jam2026ThemeAction,
  },
});

export let jam2026TicketController = createController(routes.jam.y2026.ticket, {
  actions: {
    index: jam2026Handler,
    action: jam2026TicketAction,
  },
});
