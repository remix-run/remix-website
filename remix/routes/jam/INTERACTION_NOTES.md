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
  - Current: form is rendered but disabled.
  - Re-enable in: `remix/routes/jam-2025.tsx` with `routes.actions.newsletter.href()` posting and response handling.

- `Ticket purchase interaction`
  - Current: quantity controls and checkout CTA are rendered but disabled.
  - Re-enable in: `remix/routes/jam-2025-ticket.tsx` with cart action handling and submit state/error feedback.

- `Ticket hover holographic tilt`
  - Current: static visual ticket treatment.
  - Re-enable in: `remix/routes/jam-2025-ticket.tsx`.

- `Lineup desktop accordion interaction`
  - Current: desktop details render expanded as static content.
  - Re-enable in: `remix/routes/jam-2025-lineup.tsx`.

- `Gallery modal and keyboard/query param navigation`
  - Current: masonry gallery renders static images only.
  - Re-enable in: `remix/routes/jam-2025-gallery.tsx`.
