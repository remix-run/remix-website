# Remix Jam 2026 Remaining Task Plan

This plan tracks remaining work only. The app already has gated `/jam/2026` and `/jam/2026/tickets` routes, route/controller wiring, a shared Jam 2026 header, countdown, theme toggle, FAQ accordion, shared footer, global font loading, route tests, and core assets under `public/jam/2026`.

## Build Rules

- Keep 2026 route UI in `app/controllers/jam/2026/` until there is real cross-year reuse.
- Keep the server route/form contract correct before adding hydrated behavior.
- Use route-local Remix UI styles and local assets. Do not depend on Tailwind route markup.
- Use `clientEntry(import.meta.url, function ExportName(...) { ... })` only for browser-only behavior.
- Validate ticket POST data with `remix/data-schema` and return explicit status codes.

## Tasks

### 1. Finalize Landing Hero

Build the first viewport from the prototype direction, not the current placeholder. It should show the Remix wordmark, Jam mark or lockup, 2026 badge, October 1-2 dates, Toronto location, and ticket CTA.

- Use existing Jam 2026 assets or add missing final static assets in `public/jam/2026`.
- Keep one accessible `h1` and real text for image-backed branding.
- Support light/dark theme and mobile without overlapping the fixed header.
- Cover reduced-motion and non-WebGL fallback if the visual treatment moves.

### 2. Add Cloud And Sky Background

Translate the prototype cloud/racing energy into a production-safe background layer.

- Prefer CSS or static imagery if it carries the design.
- Use a hydrated module only for canvas/WebGL behavior.
- Provide a static fallback when WebGL is unavailable.
- Reduce or disable motion for `prefers-reduced-motion`.
- Keep FPS and tuning controls out of production UI.

### 3. Add Photo Moments

Use the migrated Toronto and Jam photos as visual accents inspired by the prototype photo windows.

- Start with static or CSS-hover windows unless close/drag behavior is required.
- If interactive, implement as `clientEntry` with keyboard close and focus handling.
- Keep images decorative unless they communicate content, then provide useful alt text.
- Verify they do not crowd hero text on mobile.

### 4. Build Event Story And Workshop Sections

Replace the bare homepage body with the prototype content flow.

- Event overview: Remix Jam returns to Toronto to show Remix 3.
- Workshop: separate the additional workshop day from the main showcase day.
- Mention Michael Jackson and Ryan Florence only if final event copy approves it.
- Keep content server-rendered and route-local.

### 5. Add Floating Ticket CTA

Implement the prototype floating ticket affordance as a real link.

- Link to `routes.jam.y2026.tickets.index.href()`.
- Use the keyring/ticket art from `public/jam/2026/landing-assets`.
- Make focus visible and target size comfortable.
- Use static hover/focus behavior under reduced motion.

### 6. Harden FAQ

The accordion and stable item IDs exist. Finish the no-JS and deep-link behavior.

- Answers must remain reachable without JavaScript.
- Each FAQ item needs a stable fragment target.
- Opening one item at a time is acceptable as a hydrated enhancement.
- Add browser/component coverage for fragment navigation or no-JS markup if the implementation changes.

### 7. Add Code Of Conduct Surface

Create the 2026 code of conduct content before ticket launch.

- It can be a homepage section or a dedicated route, but the ticket flow must link to it.
- Keep copy complete enough to publish before sales open.
- Add route/controller/tests if it becomes a standalone page.

### 8. Fill Event Logistics

Replace placeholder logistics once confirmed.

- Venue name, address, and map link.
- Recommended hotels or hotel block details.
- Airport and transit guidance.
- Refund, transfer, accessibility, and contact copy that support ticket sales.

### 9. Build Ticket Selection UI

Replace the placeholder tickets page with the prototype ticket options translated to a server-first form.

- Two-day ticket: Oct 1 and Oct 2, workshop, main event, afterparty, food/drinks, early bird $699 from $899.
- One-day ticket: Oct 2, main event and afterparty, food/drinks, early bird $299 from $399.
- Quantity starts at 1 and caps at 6 unless Shopify/product policy changes.
- GET should render selected/default ticket, quantity, subtotal, availability, and policies without JavaScript.
- Hydration can enhance option switching, quantity controls, pending state, and visual polish.
- Skip the old 3D ticket scene unless final design explicitly needs it.

### 10. Add In-Page Ticket Enhancement

After the server ticket page works, add the prototype-style homepage enhancement if it remains in scope.

- Ticket links should still work as normal links without JavaScript.
- Hydrated navigation may open the ticket surface without a full reload and keep `/jam/2026/tickets` deep-linkable.
- If using a dialog/modal, implement focus restore, Escape close, scroll lock, inert background, and browser history cleanup.
- Pause heavy background effects while the ticket surface is open.

### 11. Wire Shopify Checkout

Implement the real POST action for `/jam/2026/tickets`.

- Add final product handles/variant mapping for the two ticket types.
- Validate ticket type, product/variant id, and quantity with `parseSafe`.
- Create a Shopify cart and redirect to checkout on success.
- Return clear errors for invalid input, unavailable storefront, sold out/unpublished products, quantity limits, and cart creation failures.
- Use `no-store` for POST responses and checkout-error states.

### 12. Ticket Tests

Add focused coverage before enabling checkout.

- GET renders available, unavailable, and sold-out states.
- POST rejects invalid submissions with `400`.
- POST rejects mismatched product/variant ids.
- POST redirects on successful cart creation.
- Hydrated controls preserve form values and pending state.

### 13. Social Metadata And Share Assets

Finish the document head for 2026 pages.

- Add Jam 2026 OG/share image under `public/jam/2026`.
- Use `getSocialHeadTags` with stable canonical URLs for homepage and tickets.
- Add canonical links for `/jam/2026` and `/jam/2026/tickets`.
- Keep title/description distinct for each page.
- Add or adjust tests for social tags.

### 14. Browser QA

Run a focused browser pass once landing and ticket UI are in place.

- Desktop and mobile screenshots for hero, story, FAQ, ticket page, and footer.
- Keyboard pass for header, theme toggle, FAQ, floating CTA, ticket controls, and modal/dialog behavior if used.
- Reduced-motion pass for countdown, cloud layer, CTA, FAQ, and ticket animations.
- Check color contrast and text overlap in light and dark themes.

### 15. Production Launch Switch

Do this only when the 2026 pages are ready to publish.

- Remove the production route gate for `routes.jam.y2026`.
- Change `/jam` redirect from `/jam/2025` to `/jam/2026`.
- Update global header/footer/blog/newsletter links that should point to 2026.
- Keep 2025 archive routes live but out of primary navigation unless intentionally linked.

### 16. Launch Verification

Final checks before opening sales.

- Verify Shopify products, inventory, sales channel, sale timing, and checkout settings.
- Submit a low-quantity checkout test in staging or production, then cancel/refund it.
- Confirm unavailable and sold-out states by toggling product availability.
- Run Jam route tests, ticket tests, E2E checks, and `pnpm run build`.

## Open Inputs

- Final venue/address/map.
- Final Shopify product handles and variant IDs.
- Sale opening time and any discount behavior beyond early bird display.
- Final code of conduct copy.
- Final OG/share artwork.
- Whether the in-page ticket enhancement is launch-blocking or a follow-up.
- Whether newsletter capture is needed for 2026.
