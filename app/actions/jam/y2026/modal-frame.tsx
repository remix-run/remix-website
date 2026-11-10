import type { Handle } from "remix/component";

import type { PhotoViewerState } from "./public/shopify-photo.ts";
import { Jam2026PhotoViewerFrame } from "./public/photo-viewer.tsx";
import { Jam2026TicketsModalFrame } from "./public/tickets-modal.tsx";
import type { Jam2026TicketCheckout } from "./ticket-checkout.ts";

/**
 * The modal frame's content. Both modals always render, open or closed, so
 * each keeps its hydrated state as the frame moves between tickets, photos,
 * and the bare page.
 */
export function Jam2026ModalFrame(
  handle: Handle<{
    animateEntrance: boolean;
    photoViewer?: PhotoViewerState;
    ticketsModalOpen: boolean;
    ticketCheckout?: Jam2026TicketCheckout;
  }>,
) {
  return () => {
    let { animateEntrance, photoViewer, ticketsModalOpen, ticketCheckout } =
      handle.props;

    return (
      <div>
        <Jam2026TicketsModalFrame
          animateEntrance={animateEntrance}
          open={ticketsModalOpen}
          ticketCheckout={ticketCheckout}
        />
        <Jam2026PhotoViewerFrame
          animateEntrance={animateEntrance}
          viewer={photoViewer}
        />
      </div>
    );
  };
}
