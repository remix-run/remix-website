# Agent Guide

## Goal

Keep the Remix 3 website implementation lean, stable, and behaviorally aligned with legacy production expectations.

## Source Of Truth

- Follow `remix/README.md` for repo-specific Remix rules.
- Use `references/remix/**` for API semantics when local usage is unclear.

## Keep These Non-Obvious Invariants

- Route declarations live in `remix/routes.ts`; server mappings in `remix/server.ts`; keep them aligned.
- Map explicit routes before the `router.map("*", ...)` catch-all.
- In `remix/routes/**`, keep exported route handler/controller first and helper/details below.
- For route-local, single-use UI, keep it in the route file; extract to `remix/components/**` only when shared.
- In actions/mutations, validate request-derived input with `remix/data-schema` + `parseSafe` and return explicit `400` on invalid input.
- Use `scriptModuleHref('remix/assets/....tsx')` + `#Export` for `clientEntry` URLs (script-server); do not hardcode `/scripts/...` paths.
- Global CSS is served from `/site.css`, `/md.css`, `/jam.css` after `pnpm run build:css`; use `remix/constants/static-assets.ts` href constants in route `headTags` when needed.

## Done Checklist (Route/Feature Changes)

1. Add/update route pattern in `remix/routes.ts`.
2. Implement route/controller in `remix/routes/**`.
3. Wire mapping in `remix/server.ts` before catch-all fallback.
4. Add focused tests and run targeted verification (+ Remix typechecks for substantial changes).
5. Run `pnpm run build` before shipping a PR to catch asset-pipeline regressions.
6. If behavior changes, update the parity backlog in `remix/README.md`.

## E2E Gotchas (Playwright)

- In sandboxed runs, Playwright may not reach `localhost:5173` and may fail to download browsers.
- For reliable local runs, install and run with project-local browsers:
  - `PLAYWRIGHT_BROWSERS_PATH=0 pnpm exec playwright install chromium`
  - `PLAYWRIGHT_BROWSERS_PATH=0 pnpm exec playwright test e2e/jam.spec.ts --grep newsletter`
- If a dev server is already running, prefer reusing it; otherwise Playwright may try to start another `pnpm run dev` and hit `EMFILE` (too many file watchers).

## Deploying to staging

- To push the current commit to staging, run `pnpm run push:stage`.
- Do not use `flyctl deploy` for staging unless explicitly requested.
