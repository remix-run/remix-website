# Agent Guide

## Goal

Migrate pages from React Router framework mode (`app/**`) to Remix 3 (`remix/**`) incrementally without breaking production behavior.

## Source Of Truth

- Follow `remix/README.md` for repo-specific Remix rules.
- Use `references/remix/**` for API semantics when local usage is unclear.

## Keep These Non-Obvious Invariants

- Route declarations live in `remix/routes.ts`; server mappings in `remix/server.ts`; keep them aligned.
- Map explicit Remix routes before the `router.map("*", ...)` React Router fallback.
- In `remix/routes/**`, keep exported route handler/controller first and helper/details below.
- For route-local, single-use UI, keep it in the route file; extract to `remix/components/**` only when shared.
- In actions/mutations, validate request-derived input with `remix/data-schema` + `parseSafe` and return explicit `400` on invalid input.
- Use `?assets=client` and `?assets=ssr` asset resolution patterns; never hardcode entry module paths.
- Use `?assets=ssr` only for module assets (for example `*.tsx` manifests). For plain stylesheet files (for example `shared/styles/*.css`), import with `?url` and render a `<link rel="stylesheet" ...>`.

## Per-Route Done Checklist

1. Add/update route pattern in `remix/routes.ts`.
2. Implement route/controller in `remix/routes/**`.
3. Wire mapping in `remix/server.ts` before catch-all fallback.
4. Add focused tests and run targeted verification (+ Remix typechecks for substantial changes).
5. Run `pnpm run build` before shipping a PR to catch asset-pipeline regressions.
6. After parity is verified, explicitly ask whether to remove legacy `app/routes/**` page/resources.
