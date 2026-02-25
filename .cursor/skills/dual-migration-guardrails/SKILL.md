---
name: dual-migration-guardrails
description: Enforces repository-specific guardrails for the Remix 3 and React Router dual migration. Use when migrating pages, adding routes, or editing server wiring across app/ and remix/.
---

# Dual Migration Guardrails

## Apply these defaults

- Keep new migration work in `remix/**`.
- Keep `app/**` behavior stable unless the migration explicitly requires changes.
- Do not add new files under `app/remix/**`.

## Request flow contract

When editing request handling:

1. Keep explicit route mappings in `remix/server.ts` before the catch-all.
2. Keep `router.map("*", ...)` fallback to React Router last.
3. Ensure route mappings stay aligned with `remix/routes.ts`.

## Directory ownership

- `remix/routes/**`: route handlers/controllers
- `remix/components/**`: shared Remix UI
- `remix/assets/**`: client interactivity via `clientEntry`

## Routing rules

- Add/update internal route patterns in `remix/routes.ts`.
- Use `routes.*.href()` for internal links and form actions.
- Avoid hardcoded internal URL strings.

## Validation + forms

- Use `formData()` middleware in `remix/server.ts`.
- Read request body data from `context.formData` in actions.
- Use `remix/data-schema` with `parseSafe` for validation/coercion.

## Verification

- Run targeted tests for edited Remix routes/assets.
- For substantial `remix/**` changes, run `typecheck:remix` and `typecheck:remix-server`.
