# Jam Interaction Follow-Ups

This migration intentionally ships visual parity first for Jam pages while deferring client-side interaction parity.

## Deferred items

- `Mobile nav disclosure`
  - Current: mobile menu button is present but disabled.
  - Re-enable in: `remix/routes/jam-shared.tsx` (`Navbar`).

- `Keepsakes drag and jiggle behavior`
  - Current: keepsakes render as static layers in the same visual positions.
  - Re-enable in: `remix/routes/jam-2025.tsx` + shared keepsake implementation.

- `Scramble text and badge entrance animations`
  - Current: title text and badge render in final static state.
  - Re-enable in: `remix/routes/jam-shared.tsx` (`ScrambleText`) and `remix/routes/jam-2025.tsx`.

- `Newsletter subscribe flow`
  - Status: done.
  - Delivered in: `remix/routes/jam-2025.tsx` + `remix/assets/jam-newsletter-subscribe.tsx` posting to `routes.actions.newsletter.href()` with success/error/loading states.

- `Ticket purchase interaction`
  - Status: done.
  - Delivered in: `remix/routes/jam-2025-ticket.tsx` + `remix/assets/jam-ticket-purchase.tsx` with quantity controls, checkout submit state, and inline error feedback backed by `createCart`.

- `Ticket hover holographic tilt`
  - Current: static visual ticket treatment.
  - Re-enable in: `remix/routes/jam-2025-ticket.tsx`.

- `Lineup desktop accordion interaction`
  - Status: done.
  - Delivered in: `remix/routes/jam-2025-lineup.tsx` with desktop `<details>` accordion rows and expand/collapse affordances.

- `Gallery modal and keyboard/query param navigation`
  - Status: done.
  - Delivered in: `remix/routes/jam-2025-gallery.tsx` with query-param modal open/close, backdrop close, keyboard navigation (escape/left/right), and download action.
