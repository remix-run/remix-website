---
name: remix-packages-catalog
description: Catalogs Remix package modules and when to use them, with links to upstream package READMEs. Use when choosing Remix APIs (routing, component, data, session, cookie, middleware, storage) or when package docs show @remix-run imports.
---

# Remix Packages Catalog

## Import rule (always apply)

- Prefer `remix/<package-name>` imports in this repo.
- If upstream docs show `@remix-run/<package-name>`, convert to `remix/<package-name>`.
- Do not add new `@remix-run/*` imports in application code.

Examples:

- `@remix-run/component` -> `remix/component`
- `@remix-run/fetch-router` -> `remix/fetch-router`
- `@remix-run/session` -> `remix/session`
- `@remix-run/cookie` -> `remix/cookie`

## How to use this skill

1. Open `package-catalog.md` in this skill.
2. Pick the package by use case.
3. Read the linked package README if API details are needed.
4. Normalize all imports to `remix/<package-name>`.

## High-signal package picks

- Routing: `remix/fetch-router`, `remix/route-pattern`
- UI/hydration: `remix/component`, `remix/interaction`
- Requests/forms: `remix/form-data-middleware`, `remix/form-data-parser`
- Sessions/cookies: `remix/session`, `remix/session-middleware`, `remix/cookie`
- Validation/data: `remix/data-schema`, `remix/data-table` (+ adapters)
