# Remix 3 Migration (`remix/` + `app/`)

This repo runs two systems in parallel during migration:

- `app/` contains the React Router v7 framework-mode app.
- `remix/` contains Remix 3 route handlers and `remix/component` UI rendered by `remix/server.ts`.

## Architecture

Request flow:

1. `remix/server.ts` handles the request through `remix/fetch-router`.
2. Explicit route mappings (like `/`, `/healthcheck`, `/blog/rss.xml`, `/remix-test`) run first.
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
  - `/`
  - `/healthcheck`
  - `/blog/rss.xml`
  - `/_actions/newsletter`
- Migration preview routes:
  - `/remix-test` (smoke test)

## Route + form best practices

- Define internal URLs in `remix/routes.ts` and use `routes.*.href()` in components/assets/server mapping instead of hardcoded strings.
- Group route handlers by concern when it helps composition (for example `remix/routes/actions.ts` for mutation/API-style handlers).
- Parse request bodies with `formData()` middleware in `remix/server.ts` and read `context.formData` in actions.
  - Avoid manual `URLSearchParams(await request.text())` parsing.
- Use schema-based validation with `remix/data-schema` for server validation/coercion.
  - Keep validation logic declarative and return explicit 400s for invalid payloads.
- Keep newsletter-style UX state client-owned when server persistence is unnecessary:
  - action returns JSON (`{ ok, error }`)
  - client entry updates in-place status UI
  - no cookie/session flash needed for ephemeral submit feedback

## Home route migration notes

- The Remix home route reuses split home sections under `remix/components/home/**` and interactive entries under `remix/assets/**`.
- The Remix home route now serves `/` directly from `remix/routes/home.tsx` before React Router fallback.
- Interactive parity currently includes:
  - wordmark right-click navigation (`remix/assets/wordmark-link.tsx`)
  - mobile menu open/close interactions (`remix/assets/mobile-menu.tsx`)
  - newsletter submit interaction (`remix/assets/newsletter-subscribe.tsx`)
- `DocSearchModal` is intentionally not ported to the Remix home route yet.
- Keep expanding home parity tests as migration confidence checks (metadata, key link targets, and interaction outcomes).

## Contributor checklist

Before opening a PR that changes `remix/**`:

- Keep code in `remix/**` (no new `app/remix/**` files).
- Use relative imports and avoid React Router type leakage.
- Put interactive Remix entries in `remix/assets/**`.
- Use `?assets=client` for `clientEntry` module resolution.
- Run:
  - `pnpm run typecheck:remix`
  - `pnpm vitest run remix/routes/home.test.ts`
