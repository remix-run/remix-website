import { routes } from "../../../routes.ts";

export const JAM_2026_PAGE_BACKGROUND_ID = "jam-2026-page-background";
export const JAM_2026_TICKETS_PARAM = "tickets";
export const JAM_2026_TICKETS_FRAME_NAME = "jam-2026-tickets-modal";
export const JAM_2026_TICKETS_FRAME_OPEN_PARAM = "open";
export const JAM_2026_TICKETS_OPEN_ATTRIBUTE =
  "data-jam-2026-tickets-open";
export const JAM_2026_TICKETS_CLOSE_ATTRIBUTE =
  "data-jam-2026-tickets-close";
export const JAM_2026_TICKETS_BACKDROP_ATTRIBUTE =
  "data-jam-2026-tickets-backdrop";
export const JAM_2026_TICKETS_MODAL_ATTRIBUTE =
  "data-jam-2026-tickets-modal";

export function getJam2026HomeHref() {
  return routes.jam.y2026.index.href();
}

export function getJam2026TicketsHref() {
  return routes.jam.y2026.tickets.index.href();
}

export function getJam2026TicketsFrameHref(options?: { open?: boolean }) {
  let href = routes.jam.y2026.ticketsFrame.href();
  if (!options?.open) return href;

  return `${href}?${JAM_2026_TICKETS_FRAME_OPEN_PARAM}=true`;
}

export function isJam2026TicketsModalRequest(url: URL) {
  return (
    url.pathname === getJam2026TicketsHref() ||
    url.searchParams.has(JAM_2026_TICKETS_PARAM)
  );
}

export function isJam2026TicketsFrameOpenRequest(url: URL) {
  return url.searchParams.has(JAM_2026_TICKETS_FRAME_OPEN_PARAM);
}

export function getJam2026TicketsOpenLinkProps() {
  return {
    [JAM_2026_TICKETS_OPEN_ATTRIBUTE]: "",
    href: getJam2026TicketsHref(),
    "rmx-reset-scroll": "false",
    "rmx-src": getJam2026TicketsFrameHref({ open: true }),
    "rmx-target": JAM_2026_TICKETS_FRAME_NAME,
  } as const;
}

export function getJam2026TicketsCloseLinkProps() {
  return {
    [JAM_2026_TICKETS_CLOSE_ATTRIBUTE]: "",
    href: getJam2026HomeHref(),
    "rmx-reset-scroll": "false",
    "rmx-src": getJam2026TicketsFrameHref(),
    "rmx-target": JAM_2026_TICKETS_FRAME_NAME,
  } as const;
}

export function getJam2026TicketsBackdropLinkProps() {
  return {
    ...getJam2026TicketsCloseLinkProps(),
    [JAM_2026_TICKETS_BACKDROP_ATTRIBUTE]: "",
  } as const;
}

export function getJam2026TicketsModalRootProps() {
  return {
    [JAM_2026_TICKETS_MODAL_ATTRIBUTE]: "",
  } as const;
}
