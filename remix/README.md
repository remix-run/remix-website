# Remix 3 Migration (`remix/` + `app/`)

This repo runs two systems in parallel during migration:

- `app/` contains the React Router v7 framework-mode app.
- `remix/` contains Remix 3 route handlers and `remix/component` UI rendered by `remix/server.ts`.

## Architecture

Request flow:

1. `remix/server.ts` handles the request through `remix/fetch-router`.
2. Explicit route mappings (like `/healthcheck`, `/blog/rss.xml`, `/remix-*`) run first.
3. Everything else falls back to React Router via `createRequestHandler`.

## Directory conventions (important)

- Keep Remix migration code inside `remix/**` only.
- Keep interactive/client-entry modules in `remix/assets/**`.
- Keep shared Remix UI under `remix/components/**`.
- Keep route handlers in `remix/routes/**`.
- Keep route rendering helpers in `remix/lib/**`.

Do not add new Remix migration code under `app/remix/**`.

## JSX and TypeScript

- `remix/tsconfig.json` sets:
  - `"jsx": "react-jsx"`
  - `"jsxImportSource": "remix/component"`
  - `"types": ["node", "vite/client", "@hiogawa/vite-plugin-fullstack/types"]`
- Per-file `/** @jsxImportSource remix/component */` pragmas are optional when files are covered by `remix/tsconfig.json`.

## Asset + hydration learnings

- In `Document`, use `?assets=client` / `?assets=ssr` resolved assets and render scripts via `assets.entry` / `assets.js`.
- Do not hardcode a direct script path like `/remix/assets/entry.ts`; it can 404 in runtime environments.
- For `clientEntry(...)`, use asset-resolved module URLs:
  - `import assets from "./file.tsx?assets=client"`
  - `clientEntry(\`${assets.entry}#ExportName\`, ...)`
- Do not hardcode `/app/icons.svg` in Remix components; import the asset URL and append fragment IDs:
  - `import iconsHref from "../../app/icons.svg"`
  - `<use href={\`${iconsHref}#icon-id\`} />`

## Current migration routes

- Stable/always mapped:
  - `/healthcheck`
  - `/blog/rss.xml`
- Migration preview routes:
  - `/remix-test` (smoke test)
  - `/remix-home` (homepage migration preview)

## Contributor checklist

Before opening a PR that changes `remix/**`:

- Keep code in `remix/**` (no new `app/remix/**` files).
- Use relative imports and avoid React Router type leakage.
- Put interactive Remix entries in `remix/assets/**`.
- Use `?assets=client` for `clientEntry` module resolution.
- Run:
  - `pnpm run typecheck:remix`
  - `pnpm vitest run remix/routes/home.test.ts`
