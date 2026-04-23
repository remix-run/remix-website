---
name: remix-asset-hydration-patterns
description: Applies project-specific Remix asset and hydration patterns to avoid runtime 404s and broken interactivity. Use when editing document shells, clientEntry modules, or hydrated Remix components.
---

# Remix Asset + Hydration Patterns

## Apply these defaults

- Use `clientEntry(\`${import.meta.url}#ExportName\`, ...)` for hydrated browser modules.
- Let server rendering resolve client entries through `resolveClientEntry(...)` in `app/utils/render.ts`.
- Resolve the root browser entry and preload links through `app/middleware/asset-entry.ts`.
- Keep plain stylesheet links on `public/styles` via `app/utils/style-hrefs.ts`.
- Render `<link rel="modulepreload">` tags and the root `<script type="module">` from request-scoped asset entry data; do not hardcode module paths.

## Client entry pattern

Use:

- `clientEntry(\`${import.meta.url}#ExportName\`, ...)`

Avoid:

- `clientEntry("/app/assets/feature.tsx#ExportName", ...)`
- `import assets from "./feature.tsx?assets=client"`

## Document shell pattern

- Read the request-scoped asset entry from `app/middleware/asset-entry.ts`.
- Render stylesheet links from `app/utils/style-hrefs.ts`.
- Render `modulepreload` links from `assetEntry.preloads`.
- Render the root module script from `assetEntry.src`.

## SVG sprites

- Import the sprite URL from the source asset.
- Append fragment ids in markup, for example `${iconsHref}#icon-id`.
- Do not hardcode sprite paths in Remix components.

## Quick verification

- Hydrated components become interactive in dev and production builds.
- Browser output shows no 404s for `/assets/*` modules or sprite assets.
