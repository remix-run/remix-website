---
name: dual-migration-guardrails
description: Enforces repository-specific guardrails for the Remix 3 and React Router dual migration. Use when migrating pages, adding routes, or editing server wiring across app/ and remix/.
---

# Dual Migration Guardrails

## Defaults

- Keep migration work in `remix/**`; keep `app/**` stable unless removal is intentional.
- Keep route patterns in `remix/routes.ts` and mappings in `remix/server.ts` aligned.
- Keep explicit Remix mappings before the `router.map("*", ...)` fallback.
- In `remix/routes/**`, keep exported route handler/controller first and helpers below.
- Use `routes.*.href()` for internal links/actions.
- Validate request-derived input with `remix/data-schema` + `parseSafe` where applicable and return explicit `400` on invalid input.
