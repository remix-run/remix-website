# Remix (`remix/`)

This file is the technical spec for code under `remix/**`.
For contributor/agent workflow guidance, see `AGENTS.md`.

## Runtime model

- `remix/**` contains Remix 3 handlers and `remix/component` UI.
- `remix/server.ts` handles requests via `remix/fetch-router`.
- Explicit Remix mappings run before the catch-all.
- Catch-all returns 404 for unmatched paths.

## Directory boundaries

- `remix/routes/**`: route handlers/controllers
- `remix/components/**`: shared Remix UI
- `remix/assets/**`: interactive `clientEntry` modules

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
- For standalone CSS files (for example `shared/styles/md.css`), import with `?url` and render a stylesheet `<link>`.
- Do not hardcode module script paths (for example `/remix/assets/entry.ts`).
- For SVG sprites, import the asset URL and append fragment ids.

## Analytics

- Load Fathom only outside development (`process.env.NODE_ENV !== "development"`).
- Keep the current site id/options aligned with production behavior (`IRVDGCHK`, `spa: "history"`, `excludedDomains: ["localhost"]`, and the existing script URL).
- If/when client-side navigations are introduced for Remix pages, explicitly validate pageview tracking for those transitions (not just hard reloads), including any navigation path that uses APIs other than History (for example, the Navigation API).

## Pre-PR verification

- Run focused tests for changed routes/components.
- Run relevant typechecks.
- Verify Fathom analytics still loads on Remix pages in production mode.
- When shipping client-side navigation changes, verify Fathom pageviews fire once per navigation and continue working for both initial document loads and in-app transitions.
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
- `/img/:slug`
- `/_actions/newsletter`

## Feature gaps

Track known gaps here so each item can become a focused follow-up PR.

- **Client-side navigation**: Pages rely on full document navigations; no app-wide client-side routing.
- **Delegated internal blog links**: Internal `<a>` links in blog content do not use client-side routing; reintroduce when client-side routing exists.
- **Link prefetch**: No `prefetch="intent"`-style behavior on links.
- **404 rendering**: Some handlers return plain `404`; align with a consistent, themed HTML 404 experience.
- **DocSearch shortcut**: `Cmd/Ctrl+K` DocSearch modal is not implemented.
