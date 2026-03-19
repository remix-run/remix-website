# Remix notes (`remix/`)

This file is the technical spec for code under `remix/**`.
For contributor/agent workflow guidance, see `AGENTS.md`.

## Runtime model

- `remix/**` contains Remix 3 handlers and `remix/component` UI.
- `remix/server.ts` handles requests via `remix/fetch-router`.
- Explicit route mappings run before the catch-all.
- Catch-all is handled in `remix/routes/catchall.ts`.

## Directory boundaries

- `remix/routes/**`: route handlers/controllers
- `remix/components/**`: shared Remix UI
- `remix/assets/**`: interactive `clientEntry` modules
- `remix/shared/**`: shared styles/helpers/assets for Remix runtime
- Keep runtime code in `remix/**`.

## Routing and actions

- Define internal patterns in `remix/routes.ts`.
- Use `routes.*.href()` for links and form actions.
- Keep `remix/server.ts` mappings aligned with `remix/routes.ts`.
- For form actions, use `formData()` middleware and read `context.get(FormData)`.
- Prefer `remix/data-schema` + `parseSafe` for validation and return explicit 400s for invalid payloads.

## Assets and hydration

- Browser modules are compiled on demand by **script-server** (`remix/script-server`) at `routes.scriptsRemix` / `routes.scriptsNpm` (`/scripts/remix/...` and `/scripts/npm/...`).
- Use `scriptModuleHref('remix/assets/foo.tsx')` plus `#ExportName` in `clientEntry(...)`.
- Global CSS is built to `/site.css` and `/md.css` (`pnpm run build:css`); `/jam.css` is built the same way but linked only from Jam routes (`JamDocument`), not the main document shell.
- Static images used in SSR are copied to `public/assets/jam/images/**` via `pnpm run copy:assets`; reference `/assets/jam/...` URLs.
- The icons sprite is at `/icons.svg` (same copy step).
- `loadScriptEntry` middleware fills `scriptEntryContextKey` for `Document` preloads + the main entry script.

## Pre-PR verification

- Run focused tests for changed routes/components.
- Run relevant typechecks.
- Always run `pnpm run build` before opening or shipping a PR.

## TypeScript/JSX config

`tsconfig.json` defines:

- `"jsx": "react-jsx"`
- `"jsxImportSource": "remix/component"`
- `"types": ["node", "vite/client", "@hiogawa/vite-plugin-fullstack/types"]`

## Client navigation status

- Browser boot is migrated in `remix/assets/entry.ts` and uses `run({ loadModule, resolveFrame })`.
- SSR frame context is migrated in `remix/utils/render.ts`; server renders preserve `frameSrc` and `topFrameSrc` and follow internal redirects during frame resolution.
- Existing document shell already loads the browser entry in `remix/components/document.tsx`.
- Top-level client navigation is the current repo baseline for Home, Blog, Jam, and relative internal links inside rendered blog markdown.
- Jam routes stay on top-level client navigation only:
  - `/jam/2025`
  - `/jam/2025/lineup`
  - `/jam/2025/faq`
  - `/jam/2025/coc`
  - `/jam/2025/ticket`
  - `/jam/2025/gallery`
- Do not pursue nested-frame Jam/gallery work unless product requirements materially change.
- The ticket purchase form still uses a normal browser POST/redirect flow.
- Navigation API support is a requirement for the hydrated Remix 3 experience on this branch; do not add a custom browser fallback unless product requirements change.
- During local development, Vite may log `Internal server error: aborted` during document navigations. Treat it as noteworthy only if it corresponds to broken UI behavior.

## Parity backlog

Track any remaining behavior differences from the previous production site here.
Each line item should be small enough to ship as a focused PR.

- **Link prefetch parity**: Intent/predictive prefetch behavior is not yet mirrored across Remix pages.
- **Analytics on in-app transitions**: When client-side navigation is added, explicitly verify one pageview per navigation.
- **Client navigation shape**: Keep Jam on top-level client navigation unless a future route reveals a clear need for an independently updating region.
- **Upstream runtime follow-up**: See `upstream-client-navigation-feedback.md` for preview-runtime issues and product gaps discovered during migration.
