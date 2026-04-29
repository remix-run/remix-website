# Agent Guide

## Goal

Keep the Remix 3 website implementation lean, stable, and behaviorally aligned with legacy production expectations.

## Source Of Truth

- **Framework conventions** match the consolidated Remix skill in `.agents/skills/remix/SKILL.md`. Do not treat this file as a second copy of those rules; it only records **repo-specific** invariants.
- **`references/remix/**`** — local API semantics when package usage is unclear.

## Server runtime

- **Root `server.ts`** — Node HTTP process entry. Uses `createRequestListener` from `remix/node-fetch-server`, imports the live app router, and closes the asset server during shutdown.
- **`app/router.ts`** — `createRouter`, root middleware stack, `router.map(...)` wiring, and the `GET /assets/*` route that delegates to `app/utils/assets.server.ts`.
- **Production / `pnpm run preview`** — runs the same TypeScript server entry as development (`server.ts`) through `tsx`; there is no separate Vite SSR bundle.

## Keep These Non-Obvious Invariants

- Route declarations live in `app/routes.ts`; router mappings in `app/router.ts`; keep them aligned.
- Map explicit routes before the `router.map("*", ...)` catch-all.
- In `app/controllers/**`, keep exported route handler/controller first and helper/details below.
- For route-local, single-use UI, keep it in the route file; extract to `app/ui/**` only when shared.
- In actions/mutations, validate request-derived input with `remix/data-schema` + `parseSafe` and return explicit `400` on invalid input.
- Use `clientEntry(\`${import.meta.url}#ExportName\`, ...)` for hydrated asset modules so server rendering can resolve them through `resolveClientEntry(...)`.
- Resolve the root browser entry and preload links through `app/middleware/asset-entry.ts` + `app/utils/assets.server.ts`; do not hardcode build output paths.
- Plain stylesheets still come from `public/styles` via `app/utils/style-hrefs.ts`; this app uses `remix/assets` for hydrated browser modules.

## Done Checklist (Route/Feature Changes)

1. Add/update route pattern in `app/routes.ts`.
2. Implement route/controller in `app/controllers/**`.
3. Wire mapping in `app/router.ts` before catch-all fallback.
4. Add focused tests and run targeted verification (+ Remix typechecks for substantial changes).
5. Run `pnpm run build` before shipping a PR to catch CSS/runtime regressions.
6. If behavior changes, update the parity backlog below.

## Parity backlog

Remaining differences vs the previous production site (small, shippable items):

- **Link prefetch parity**: Intent/predictive prefetch is not yet mirrored across Remix pages.
- **Analytics on in-app transitions**: Verify one pageview per navigation when using client-side navigation.
- **Client navigation shape**: Keep Jam on top-level client navigation unless a future route needs an independently updating region.

## E2E Gotchas (Playwright)

- In sandboxed runs, Playwright may not reach `localhost:5173` and may fail to download browsers.
- For reliable local runs, install and run with project-local browsers:
  - `PLAYWRIGHT_BROWSERS_PATH=0 pnpm exec playwright install chromium`
  - `PLAYWRIGHT_BROWSERS_PATH=0 pnpm exec playwright test e2e/jam.spec.ts --grep newsletter`
- If a dev server is already running, prefer reusing it; otherwise Playwright may try to start another `pnpm run dev` and hit `EMFILE` (too many file watchers).

## Deploying to staging

- To push the current commit to staging, run `pnpm run push:stage`.
- Do not use `flyctl deploy` for staging unless explicitly requested.
