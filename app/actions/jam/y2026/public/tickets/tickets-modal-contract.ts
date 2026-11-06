export const ticketModalConfig = {
  pageBackgroundId: "jam-2026-page-background",
  frameName: "jam-2026-tickets-modal",
} as const;

/** Checkout state rendered by the tickets modal. */
export type Jam2026TicketCheckout = {
  availableForSale: boolean;
  error?: string;
  initialQuantity: number;
  maxQuantity: number;
  productId?: string;
};
