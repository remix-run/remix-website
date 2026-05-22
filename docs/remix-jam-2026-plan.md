# Remix Jam 2026 Remaining Task Plan

This plan tracks remaining work only. Delete completed or stale items instead of expanding this
file. When asked to clean up this doc, that means delete things.

The prototype/POC lives in the sibling repo at `../remix-jam-2026`.

Important implementation note: prototype styles do not always map one-to-one into this repo.
The production site has global CSS/reset rules that can change rendered sizing and positioning.
For example, `img { max-width: 100%; }` will cap oversized decorative images inside a smaller
parent unless the route-local style explicitly opts out with `max-width: none`.

## Build Rules

- Keep 2026 route UI in `app/controllers/jam/2026/` until there is real cross-year reuse.
- Keep the server route/form contract correct before adding hydrated behavior.
- Use route-local Remix UI styles and local assets. Do not depend on Tailwind route markup.
- Use `clientEntry(import.meta.url, function ExportName(...) { ... })` only for browser-only behavior.
- Validate ticket POST data with `remix/data-schema` and return explicit status codes.
- Before starting a dev server, try the user's existing server at `http://localhost:44100`.
  Reuse it when it responds. Only start another server when `44100` is not responding, and use a
  different port if `44100` is occupied.

## Tasks

### Add Code Of Conduct Surface

Create the 2026 code of conduct content before ticket launch.

- Add a dedicated `/jam/2026/coc` route/controller.
- Keep copy complete enough to publish before sales open.
- Link to it from the ticket flow.
- Add route/controller tests.

### Highlight Early Bird Pricing

Make early bird pricing more prominent before tickets are shared widely.

- Surface the early bird offer outside the ticket modal.
- Keep pricing language aligned with the Shopify product and checkout state.

### Wire Shopify Checkout

Implement the real POST action for `/jam/2026/ticket`.

- Add final product handle/variant mapping for the Remix Jam 2026 ticket.
- Validate ticket type, product/variant id, and quantity with `parseSafe`.
- Enable the ticket modal checkout button when the POST flow is wired.
- Create a Shopify cart and redirect to checkout on success.
- Return clear errors for invalid input, unavailable storefront, sold out/unpublished products, quantity limits, and cart creation failures.
- Use `no-store` for POST responses and checkout-error states.

### Browser QA

Run a focused browser pass once landing and ticket UI are in place.

- Desktop and mobile screenshots for hero, story, FAQ, ticket page, and footer.
- Keyboard pass for header, theme toggle, FAQ, ticket controls, and modal/dialog behavior if used.
- Reduced-motion pass for countdown, cloud layer, FAQ, and ticket animations.
- Check color contrast and text overlap in light and dark themes.

### Production Launch Cleanup

Do this only when the 2026 pages are ready to publish.

- Change `/jam` redirect from `/jam/2025` to `/jam/2026`.
- Update global header and landing nav links that should point to 2026.
- Keep 2025 archive routes live but out of primary navigation unless intentionally linked.

### Launch Verification

Final checks before opening sales.

- Verify Shopify products, inventory, sales channel, sale timing, and checkout settings.
- Submit a low-quantity checkout test in staging or production, then cancel/refund it.
- Confirm unavailable and sold-out states by toggling product availability.
- Run Jam route tests, ticket tests, E2E checks, and `pnpm run build`.
