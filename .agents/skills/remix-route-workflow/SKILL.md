---
name: remix-route-workflow
description: Guides current-state Remix route work in this repo. Use when adding or updating routes, controllers, actions, or server mappings under remix/.
---

# Remix Route Workflow

## Core workflow

- Define or update the route pattern in `remix/routes.ts`.
- Implement the handler/controller in `remix/routes/**`.
- Keep the exported route handler/controller at the top of the route module and helpers below.
- Keep route-local, single-use UI in the route file; extract to `remix/components/**` only when shared.
- Wire the route in `remix/server.ts` before the catch-all mapping.
- Use `routes.*.href()` for internal links and form actions.

## Actions and mutations

- Parse request-derived data through `remix/data-schema` with `parseSafe`.
- Return an explicit `400` response for invalid input.
- For form actions, follow the repo middleware pattern and read parsed form data from request context.

## Verification

- Add focused tests for the changed route behavior.
- Run relevant typechecks for substantial route changes.
- Run `pnpm run build` before shipping route work to catch asset-pipeline regressions.
