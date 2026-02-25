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
- Use `?assets=ssr` for module manifests (for example `*.tsx`), not for plain stylesheets.
- For standalone CSS files (for example `shared/md.css`), import with `?url` and render a stylesheet `<link>`.
- Do not hardcode module script paths (for example `/remix/assets/entry.ts`).
- For SVG sprites, import the asset URL and append fragment ids.

## Pre-PR verification

- Run focused tests for changed routes/components.
- Run relevant typechecks.
- Always run `pnpm run build` before opening or shipping a PR.

## TypeScript/JSX config

`remix/tsconfig.json` defines:

- `"jsx": "react-jsx"`
- `"jsxImportSource": "remix/component"`
- `"types": ["node", "vite/client", "@hiogawa/vite-plugin-fullstack/types"]`

## Current mapped routes

- `/`
- `/brand`
- `/blog`
- `/blog/:slug`
- `/blog/:slug.md`
- `/newsletter`
- `/healthcheck`
- `/blog/rss.xml`
- `/_actions/newsletter`

## Feature parity gaps

Track known migration gaps here so each item can become a focused follow-up PR.

- **Client-side navigation baseline**: Remix pages currently rely on regular document navigations in most places (for example blog list/post links and markdown body links) rather than app-wide client-side routing behavior.
- **Link prefetch parity**: React Router `Link` + `prefetch="intent"` behavior is not generally replicated yet on migrated Remix pages.
- **404 rendering parity**: Some migrated handlers still return plain `404` `Response`s; align with a consistent, themed HTML 404 experience and metadata behavior.
- **`/img/:slug` migration**: OG image generation is still served by React Router fallback. Follow-up should:
  - update/verify `satori` compatibility with current Remix setup,
  - test whether Remix JSX runtime can be used directly, and
  - if not, implement the route using Satori's object-based element config (no JSX) and keep output/cache behavior equivalent.
