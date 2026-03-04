---
name: remix-route-playbook
description: Step-by-step process for adding a new route in remix/routes. Use when implementing a new page or route.
---

# Remix Route Playbook

## Checklist

- [ ] Define or update the route pattern in `remix/routes.ts`.
- [ ] Create the handler in `remix/routes/**`.
- [ ] Keep the exported route handler/controller at the top of the route module; place helpers/details below.
- [ ] Keep route-local, single-use UI in the route file; extract to `remix/components/**` only when shared.
- [ ] Map the route in `remix/server.ts` before the catch-all fallback.
- [ ] Add focused tests for route behavior and key interactions.
- [ ] Validate request-derived inputs with `remix/data-schema` + `parseSafe` where applicable.
