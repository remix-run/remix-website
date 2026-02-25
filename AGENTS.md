# Agent Guide

## Goal

Migrate pages from React Router framework mode (`app/**`) to Remix 3 (`remix/**`) incrementally without breaking production behavior.

## Source Of Truth

- Follow `remix/README.md` first for migration rules in this repo.
- Use `references/remix/**` only for API details when local usage is unclear.

## Architecture Contract

- Requests enter through `remix/server.ts`.
- Explicit Remix route mappings run first (`/`, `/healthcheck`, `/blog/rss.xml`, `/_actions/newsletter`, optional `/remix-test` in dev).
- Unmapped requests fall back to React Router via `createRequestHandler`.

## Directory Boundaries

- Put migration code in `remix/**`.
- Use `remix/routes/**` for route handlers.
- Use `remix/components/**` for shared Remix UI.
- Use `remix/assets/**` for interactive client entries.
- Do not create new migration code under `app/remix/**`.

## Routing And URLs

- Define internal URLs in `remix/routes.ts`.
- Use `routes.*.href()` instead of hardcoded internal paths.
- Keep server mappings in `remix/server.ts` aligned with `remix/routes.ts`.

## Forms And Validation

- Parse request bodies with `formData()` middleware in `remix/server.ts`.
- Read parsed form data from `context.formData` in route actions.
- Prefer `remix/data-schema` + `parseSafe` for validation/coercion.
- Return explicit 400 payloads for invalid submissions.

## Assets And Hydration

- Resolve client modules with `?assets=client` and use `assets.entry` in `clientEntry(...)`.
- Resolve SSR assets in document shells with `?assets=ssr` and merge asset sets.
- Do not hardcode script module paths like `/remix/assets/entry.ts`.
- For SVG sprite usage, import the icon URL and append fragment ids (do not hardcode `/app/icons.svg`).

## Migration Workflow (Per Page)

1. Add route pattern to `remix/routes.ts`.
2. Implement route handler in `remix/routes/**`.
3. Build reusable UI in `remix/components/**`.
4. Move interaction logic to `remix/assets/**` via `clientEntry`.
5. Map route in `remix/server.ts` before catch-all fallback.
6. Add/adjust focused tests under `remix/routes/**` or `remix/assets/**`.

## Minimal Verification

- Run targeted tests for changed Remix routes/assets.
- Run `typecheck:remix` and `typecheck:remix-server` before finalizing substantial Remix changes.

## Skills In This Repo

- `.cursor/skills/dual-migration-guardrails/SKILL.md`
- `.cursor/skills/remix-route-migration-playbook/SKILL.md`
- `.cursor/skills/remix-asset-hydration-patterns/SKILL.md`
- `.cursor/skills/remix-packages-catalog/SKILL.md`
