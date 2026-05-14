# Remix Jam 2026 Implementation Plan

This is the working plan for building the Remix Jam 2026 site from the ground up in Remix 3. The proof of concept to inspect is `../remix-jam-2026`; treat it as directional design input, not implementation source. The 2025 Jam pages are useful requirements research, but the 2026 pages should avoid carrying forward accidental structure from the React Router migration.

## Current Shape

- **Homepage brochure:** `/jam/2026`
- **Ticket experience:** `/jam/2026/tickets`
- **Jam root:** keep `/jam` pointing at the existing production 2025 page until we intentionally switch the default event.

The first pass should stay server-rendered. Add hydrated browser modules only for real browser-only behavior: live countdown, enhanced ticket quantity controls, canvas/WebGL background, focus management, or animated visual polish that cannot be expressed with CSS/details/links.

## Design Input To Extract From `../remix-jam-2026`

- Toronto remains the event location.
- Event dates are October 1-2, 2026.
- The first viewport should clearly signal "Remix Jam 2026" with the Remix wordmark, custom Jam lockup, date, location, and ticket CTA.
- The visual direction is bright sky/racing/showcase energy, with a possible cloud/canvas background and a more dimensional hero than 2025.
- A compact fixed header likely needs home, FAQ, code of conduct, and ticket affordances.
- FAQ should work without JavaScript first. If final design requires animated accordion behavior, layer it onto native `details` or a small route-local client entry.
- The floating ticket CTA is a strong design idea, but it should be implemented as an accessible link with clear focus and reduced-motion behavior.
- The FPS readout in the POC should be treated as a development diagnostic only, not a public page element.

## Requirements Learned From Remix Jam 2025

- Each page needs complete document metadata, social tags, cache headers, and a stable canonical URL story.
- Ticketing needs server-first POST behavior, input validation with `remix/data-schema`, clear unavailable/sold-out/error states, and no-JS fallback before hydration.
- Storefront integration should keep using the existing Shopify helper pattern unless ticket data moves somewhere else. The repo currently targets Storefront API `2026-04`, the latest stable API version available during this scaffold.
- Shopify provides first-party AI support that should be useful while wiring ticketing: `@shopify/dev-mcp` for Dev MCP access, plus official `shopify/shopify-ai-toolkit` skills such as `shopify-dev` and `shopify-storefront-graphql`.
- Newsletter signup may still be needed; if it stays, it should reuse the shared newsletter action and tag the submission for Jam 2026.
- Client-side navigation should preserve the top-level Jam document experience and avoid full reloads where possible.
- Mobile navigation and focus states need explicit test coverage.
- Code of conduct content must be present before ticket launch.
- FAQ content needs stable fragment links so support emails and docs can point to individual answers.
- If schedule/lineup/gallery return later, they should be added as deliberate route additions rather than hidden in the initial two-page scaffold.

## Build Principles

- Define URL contracts first in `app/routes.ts`, then wire controllers in `app/router.ts`.
- Keep 2026 route-local UI under `app/controllers/jam/2026/` until there is real cross-year reuse.
- Prefer semantic HTML and CSS over client JavaScript for brochure content.
- Keep 2026 pages independent from the shared Tailwind/app stylesheet. Use route-local Remix UI mixins plus the shared global font stylesheet.
- Load fonts from local `/font/*.woff2` files only. The approved families are Inter and JetBrains Mono.
- Use `clientEntry(import.meta.url, function ExportName(...) { ... })` only for interactive modules that need browser state.
- Keep asset paths centralized once final assets exist. Do not hardcode build output filenames or copied Figma export paths.
- Avoid copying Figma-generated class names. Translate the design into named components, content data, and a small CSS surface.
- Keep the ticket page a normal document/form workflow. Hydration should enhance quantity and checkout feedback, not define the checkout contract.

## Initial File Areas

- `app/routes.ts`: add `jam.y2026.index` and `jam.y2026.tickets`.
- `app/router.ts`: map 2026 routes before the catch-all.
- `app/controllers/jam/2026/`: route handlers, document shell, shared UI, and route-local content.
- `app/styles/fonts.css`: shared global font declarations for all document routes.
- `app/utils/style-hrefs.ts` and `package.json`: expose and build shared stylesheets without wiring Tailwind styles into 2026 routes.
- `app/controllers/jam/2026/controller.test.ts`: focused server-render route coverage.
- `public/jam/2026/**`: final static images, OG images, and ticket artwork when design assets are ready.
- `app/assets/jam-2026-*.tsx`: hydrated modules only after the server-rendered behavior is correct.

## Homepage Checklist

- Hero lockup with Remix brand, Jam mark, year, date, location, and ticket CTA.
- Header navigation that works on desktop/mobile and does not obscure content.
- Event overview explaining the Remix 3 showcase.
- Workshop/day-two section with clear distinction from the main showcase day.
- FAQ section with accessible controls and fragment-friendly IDs.
- Code of conduct section or summary with a clear full policy surface.
- Newsletter/update capture if the event team wants pre-ticket communication.
- Venue/travel section once venue and hotel blocks are confirmed.
- Social share image and metadata.
- Reduced-motion treatment for animated/canvas/cloud/racing elements.

## Ticket Checklist

- Product handle and Storefront source for the 2026 ticket.
- Server-rendered GET page with availability, ticket type, quantity rules, and refund/transfer policy.
- POST route with boundary validation via `remix/data-schema` + `parseSafe`.
- Shopify cart creation with explicit errors for unavailable checkout, invalid product, sold out, and quantity limits.
- No-store cache headers for POST responses and checkout-error states.
- Progressive enhancement for quantity controls and pending checkout state.
- Tests for invalid submissions, unavailable storefront fallback, and successful checkout redirect.

## Accessibility And Quality Checklist

- One visible `h1` per document and useful section headings.
- Keyboard-accessible header, FAQ, ticket controls, and floating CTA.
- Focus visible on all links/buttons, including image-based controls.
- No text baked into images unless the same text exists accessibly.
- Layout remains stable across mobile, tablet, and desktop.
- No overlapping text/controls at narrow widths.
- Reduced-motion path for canvas, parallax, countdown ticks, and scroll effects.
- Color contrast checked against final palette.
- No external font dependencies. 2026 pages should use local Inter and JetBrains Mono font files only.
- No Tailwind utility classes or shared Tailwind/app stylesheet dependency in 2026 route markup.
- No hardcoded `/assets/*` build filenames.

## Verification Checklist

- Route tests for `/jam/2026` and `/jam/2026/tickets`.
- Ticket action tests before enabling checkout.
- E2E coverage for mobile nav, FAQ interaction, and ticket checkout states.
- Visual/browser pass for desktop and mobile once final designs land.
- `pnpm run build` before PR handoff.

## Pre-Launch Checklist

- Remove the production route gate in `app/router.ts` so `/jam/2026` and `/jam/2026/tickets` are mapped in production.
- Change the Jam index redirect in `app/controllers/jam/controller.ts` from `/jam/2025` to `/jam/2026`.
- Check site navigation, footer links, blog/newsletter CTAs, and social metadata for any remaining links that should point at Jam 2026 instead of Jam 2025.
- Keep the 2025 Jam routes live for canonical/archive purposes, but remove them from primary navigation unless intentionally linking to the archive.
- Verify the 2026 ticket product is published and purchasable in Shopify Admin for the correct sales channel.
- Verify Shopify inventory, sale timing, checkout settings, and refund/transfer copy before opening sales.
- Submit a real low-quantity checkout test in production or staging, then cancel/refund it in Shopify.
- Confirm unavailable/sold-out states render correctly if Shopify marks the product unavailable after launch.
- Run `pnpm run build` and the Jam route/e2e checks before removing the production gate.

## Open Decisions

- Exact venue, address, and map link.
- Whether `/jam` should switch to `/jam/2026` before tickets open or at launch.
- Whether FAQ and code of conduct stay on the homepage only or get dedicated deep-link pages later.
- Whether schedule/lineup belongs on the homepage, in a later route, or outside the two-page launch scope.
- Final ticket product handle, max quantity, and sale opening time.
- Newsletter tag/list ID for Remix Jam 2026.
- Final OG artwork and static asset naming.
- Whether the cloud/racing background is CSS, canvas, Three.js, video, or static imagery.
