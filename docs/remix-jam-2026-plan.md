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
- Keep checkout error rendering working without JavaScript; the POST action should be able to
  re-render the ticket modal with a clear error.
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
