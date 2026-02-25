# Remix migration notes (`remix/` + `app/`)

This file is the technical spec for code under `remix/**`.
For contributor/agent workflow guidance, see `AGENTS.md`.

## Runtime model

- `app/**` remains the React Router framework-mode app.
- `remix/**` contains Remix 3 handlers and `remix/component` UI.
- `remix/server.ts` handles requests via `remix/fetch-router`.
- Explicit Remix mappings run before the catch-all.
- Catch-all falls back to React Router `createRequestHandler`.

## Directory boundaries

- `remix/routes/**`: route handlers/controllers
- `remix/components/**`: shared Remix UI
- `remix/assets/**`: interactive `clientEntry` modules
- Keep migration code in `remix/**`; do not add new `app/remix/**` files.

## Routing and actions

- Define internal patterns in `remix/routes.ts`.
- Use `routes.*.href()` for links and form actions.
- Keep `remix/server.ts` mappings aligned with `remix/routes.ts`.
- For form actions, use `formData()` middleware and read `context.formData`.
- Prefer `remix/data-schema` + `parseSafe` for validation and return explicit 400s for invalid payloads.

## Assets and hydration

- Resolve client modules with `?assets=client` and use `assets.entry` in `clientEntry(...)`.
- Resolve document assets with `?assets=ssr` and render from `assets.css` / `assets.js` / `assets.entry`.
- Do not hardcode module script paths (for example `/remix/assets/entry.ts`).
- For SVG sprites, import the asset URL and append fragment ids.

## TypeScript/JSX config

`remix/tsconfig.json` defines:

- `"jsx": "react-jsx"`
- `"jsxImportSource": "remix/component"`
- `"types": ["node", "vite/client", "@hiogawa/vite-plugin-fullstack/types"]`

## Current mapped routes

- `/`
- `/healthcheck`
- `/blog/rss.xml`
- `/_actions/newsletter`
- `/remix-test` (dev only)
