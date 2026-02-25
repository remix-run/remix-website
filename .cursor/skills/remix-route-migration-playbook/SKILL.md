---
name: remix-route-migration-playbook
description: Provides a concise step-by-step process for migrating a page from app/ to remix/routes with current project patterns. Use when implementing a new migrated page or route.
---

# Remix Route Migration Playbook

## Checklist

- [ ] Define or update the route pattern in `remix/routes.ts`.
- [ ] Create the handler in `remix/routes/**`.
- [ ] Keep the exported route handler/controller at the top of the route module; place helpers/details below.
- [ ] Keep route-local, single-use UI in the route file; extract to `remix/components/**` only when shared.
- [ ] Map the route in `remix/server.ts` before the catch-all fallback.
- [ ] Add focused tests for route behavior and key interactions.
- [ ] Validate request-derived inputs with `remix/data-schema` + `parseSafe` where applicable.
- [ ] After verification passes, ask the user if they want the legacy `app/routes/**` page/resources removed now.
