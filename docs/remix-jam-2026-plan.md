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

## Tasks

### Add Cloud And Sky Background

Translate the prototype cloud/racing energy into a production-safe background layer.

- Prefer CSS or static imagery if it carries the design.
- Use a hydrated module only for canvas/WebGL behavior.
- Provide a static fallback when WebGL is unavailable.
- Reduce or disable motion for `prefers-reduced-motion`.
- Keep FPS and tuning controls out of production UI.

### Harden FAQ

The accordion and stable item IDs exist. Finish the no-JS and deep-link behavior.

- Answers must remain reachable without JavaScript.
- Each FAQ item needs a stable fragment target.
- Opening one item at a time is acceptable as a hydrated enhancement.
- Add browser/component coverage for fragment navigation or no-JS markup if the implementation changes.

### Move Theme Preference To Cookie Session

Replace the Jam 2026 header's `sessionStorage` theme persistence with a server-readable cookie session.

- Read the saved theme on the server so first paint uses the chosen `data-theme` and `color-scheme`.
- Keep the header's hydrated toggle as the enhancement that updates the cookie-backed preference.
- Preserve system-theme fallback when no saved preference exists.
- Avoid a flash or mismatch between server-rendered theme state and hydrated header state.

### Add Code Of Conduct Surface

Create the 2026 code of conduct content before ticket launch.

- It can be a homepage section or a dedicated route, but the ticket flow must link to it.
- Keep copy complete enough to publish before sales open.
- Add route/controller/tests if it becomes a standalone page.

### Fill Event Logistics

Replace placeholder logistics once confirmed.

- Venue name, address, and map link.
- Recommended hotels or hotel block details.
- Airport and transit guidance.
- Refund, transfer, accessibility, and contact copy that support ticket sales.

### Build Ticket Selection UI

Replace the placeholder tickets page with the prototype ticket options translated to a server-first form.

- Two-day ticket: Oct 1 and Oct 2, workshop, main event, afterparty, food/drinks, early bird $699 from $899.
- One-day ticket: Oct 2, main event and afterparty, food/drinks, early bird $299 from $399.
- Quantity starts at 1 and caps at 6 unless Shopify/product policy changes.
- GET should render selected/default ticket, quantity, subtotal, availability, and policies without JavaScript.
- Hydration can enhance option switching, quantity controls, pending state, and visual polish.
- Skip the old 3D ticket scene unless final design explicitly needs it.
- Cover available, unavailable, sold-out, invalid POST, and successful checkout redirect states.

### Add In-Page Ticket Enhancement

After the server ticket page works, add the prototype-style homepage enhancement if it remains in scope.

- Ticket links should still work as normal links without JavaScript.
- Hydrated navigation may open the ticket surface without a full reload and keep `/jam/2026/tickets` deep-linkable.
- If using a dialog/modal, implement focus restore, Escape close, scroll lock, inert background, and browser history cleanup.
- Pause heavy background effects while the ticket surface is open.

### Wire Shopify Checkout

Implement the real POST action for `/jam/2026/tickets`.

- Add final product handles/variant mapping for the two ticket types.
- Validate ticket type, product/variant id, and quantity with `parseSafe`.
- Create a Shopify cart and redirect to checkout on success.
- Return clear errors for invalid input, unavailable storefront, sold out/unpublished products, quantity limits, and cart creation failures.
- Use `no-store` for POST responses and checkout-error states.

### Social Metadata And Share Assets

Finish the document head for 2026 pages.

- Add Jam 2026 OG/share image under `public/jam/2026`.
- Use `getSocialHeadTags` with stable canonical URLs for homepage and tickets.
- Add canonical links for `/jam/2026` and `/jam/2026/tickets`.
- Keep title/description distinct for each page.
- Add or adjust tests for social tags.

### Browser QA

Run a focused browser pass once landing and ticket UI are in place.

- Desktop and mobile screenshots for hero, story, FAQ, ticket page, and footer.
- Keyboard pass for header, theme toggle, FAQ, ticket controls, and modal/dialog behavior if used.
- Reduced-motion pass for countdown, cloud layer, FAQ, and ticket animations.
- Check color contrast and text overlap in light and dark themes.

### Production Launch Switch

Do this only when the 2026 pages are ready to publish.

- Remove the production route gate for `routes.jam.y2026`.
- Change `/jam` redirect from `/jam/2025` to `/jam/2026`.
- Update global header/footer/blog/newsletter links that should point to 2026.
- Keep 2025 archive routes live but out of primary navigation unless intentionally linked.

### Launch Verification

Final checks before opening sales.

- Verify Shopify products, inventory, sales channel, sale timing, and checkout settings.
- Submit a low-quantity checkout test in staging or production, then cancel/refund it.
- Confirm unavailable and sold-out states by toggling product availability.
- Run Jam route tests, ticket tests, E2E checks, and `pnpm run build`.
