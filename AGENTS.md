# Agent Guide

## Goal

Keep the Remix 3 website implementation lean, stable, and behaviorally aligned with legacy production expectations.

## Source Of Truth

- **Framework conventions** match the consolidated Remix skill in `.agents/skills/remix/SKILL.md`. Do not treat this file as a second copy of those rules; it only records **repo-specific** invariants.
- **`references/remix/**`\*\* — local API semantics when package usage is unclear.

## Server runtime

- **Root `server.ts`** — Node HTTP process entry. Uses `createRequestListener` from `remix/node-fetch-server`, imports the live app router, and closes the asset server during shutdown.
- **`app/router.ts`** — `createRouter`, root middleware stack, `router.map(...)` wiring, and the `GET /assets/*` route that delegates to `app/utils/assets.ts`.
- **Production / `pnpm run preview`** — runs the same TypeScript server entry as development (`server.ts`) through `remix/node-tsx`; there is no separate Vite SSR bundle.
- **HMR / `pnpm run hmr`** - runs the server in development mode with HMR enabled, for use during heavy UI iteration.

## Keep These Non-Obvious Invariants

- Route declarations live in `app/routes.ts`; router mappings in `app/router.ts`; keep them aligned. Run `pnpm remix doctor` after route or controller changes.
- Disk layout under `app/actions/**` mirrors the route map: every route map with direct routes owns `app/actions/<key-path>/controller.tsx` (root map owns `app/actions/controller.tsx`), and route-local modules are flat files beside their controller. Do not introduce non-route directories such as `ui/` or `sections/` inside `app/actions/**`.
- Map explicit routes before the `router.map("*", ...)` catch-all.
- In `app/actions/**`, keep the exported controller first and helper/details below.
- For route-local, single-use UI, keep it in the route file; extract to `app/ui/**` only when shared.
- Browser-reachable source lives in `public/` directories inside `app/`, colocated with the narrowest owner (e.g. `app/actions/jam/y2026/public/`, `app/ui/public/`). The root browser runtime entry is `app/actions/public/entry.ts`. `pnpm remix doctor` still reports these `public/` directories as `orphan-route-directory` warnings; that check has not learned the convention yet, so those warnings are expected and every other doctor check must stay green. Keep every local dependency of a browser module in a `public/` directory; the shared `app/routes.ts` contract and `allowPackages` entries in `app/utils/assets.ts` are the only exceptions. For route-local hydrated UI in a `public/` directory, keep component/rendering code first and put styles below the components.
- Let components own their own state and implementation details. If a parent imports a long list of child constants/helpers, that is a boundary smell; extract a child component/module instead.
- Prefer direct code over tiny wrappers/constants that do not add meaning. Inline one-off helpers, values, and derived constants at their use site when that reads clearly.
- Use shared theme tokens such as `theme.fontFamily.*`, `theme.fontWeight.*`, and route theme objects instead of hardcoded repeated values. Never hardcode custom `fontWeight` numbers or strings.
- In actions/mutations, validate request-derived input with `remix/data-schema` + `parseSafe` and return explicit `400` on invalid input.
- Use `clientEntry(import.meta.url, function ExportName(...) { ... })` for hydrated asset modules so server rendering can resolve them through `resolveClientEntry(...)` using the component function name.
- Resolve the root browser entry and preload links through `app/middleware/asset-entry.ts` + `app/utils/assets.ts`; do not hardcode build output paths. `loadAssetEntry()` runs in the root stack and UI reads it with `getAssetEntry()` via `asyncContext()`, so no provider component threads asset URLs through render. The asset server boundary is `allowFiles: ['app/routes.ts', 'app/**/public/**']` plus `allowPackages`. The allow-list is narrow enough that the only `denyFiles` entry is `app/**/*.test.*` (tests colocate with their subjects but are not browser runtime source); server-only code is excluded simply by not living in a `public/` directory. There is no `.server.` naming convention.
- Plain stylesheets still come from root `public/styles` via `app/utils/style-hrefs.ts`; this app uses `remix/assets` for hydrated browser modules compiled from `app/**/public/**` source.

## UI Behavior Defaults

- Prefer CSS for visual states and animations. Use `remix/ui/animation` helpers for CSS transitions when they fit; keep JavaScript for state/timing rather than frame-by-frame styling.
- Treat `prefers-reduced-motion` as its own behavior path. Avoid churny intro animations, large hover expansions, and motion-heavy effects; provide a simple static hover/focus state instead of removing feedback entirely.
- Keep accessible labels stable when visual text updates frequently. For animated counters/timers, prefer a stable label that states the event/date and hide the decorative changing digits from assistive tech.
- Add focused tests around public behavior. Prefer component/browser tests for interactive UI when feasible; avoid testing internal helpers just because they are easy to import.
- Do not add tests that merely assert literal copy/text is present in rendered HTML (e.g. `expect(html).toContain("Some marketing sentence")`). That is a reflection of the source string, not a behavior test — it breaks on any wording change while catching no real bugs. Test behavior: route status, structure (sections/anchors present), ordering, interactions, and data-driven output. Only assert text when it is the actual behavior under test (e.g. a validation error message, a computed/derived value, or dynamic data rendered from a source).

## Done Checklist (Route/Feature Changes)

1. Add/update route pattern in `app/routes.ts`.
2. Implement the controller in `app/actions/**` at the path the route map implies.
3. Wire mapping in `app/router.ts` before catch-all fallback.
4. Add focused tests and run targeted verification (+ Remix typechecks for substantial changes).
5. Run `pnpm run build` before shipping a PR to catch CSS/runtime regressions.
6. If behavior changes, update the parity backlog below.

## Commit / Push Hygiene

- Before any commit or push, run the formatter on the changed files.

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
