---
name: remix-route-migration-playbook
description: Provides a concise step-by-step process for migrating a page from app/ to remix/routes with current project patterns. Use when implementing a new migrated page or route.
---

# Remix Route Migration Playbook

## Checklist

- [ ] Define or update the route pattern in `remix/routes.ts`.
- [ ] Create the handler in `remix/routes/**`.
- [ ] Extract/share UI under `remix/components/**`.
- [ ] Move client behavior into `remix/assets/**` using `clientEntry`.
- [ ] Map the route in `remix/server.ts` before the catch-all fallback.
- [ ] Add focused tests for route behavior and key interactions.

## Implementation notes

- Prefer small route handlers that delegate rendering to shared components.
- Reuse existing `app/**` styling/content where possible to preserve parity.
- Keep migration-specific behavior explicit instead of introducing broad abstractions.

## Form/action pattern

For mutation routes:

- Define action route patterns in `remix/routes.ts` (for example under `actions`).
- Parse form data from `context.formData`.
- Validate with `remix/data-schema` and return explicit JSON errors.
- Use `routes.*.href()` in client forms.

## Done criteria

- Route is served by Remix mapping in `remix/server.ts`.
- No new migration code is added under `app/remix/**`.
- Tests cover metadata/link targets/interactions relevant to the migrated page.
