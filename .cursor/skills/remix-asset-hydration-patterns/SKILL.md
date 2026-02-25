---
name: remix-asset-hydration-patterns
description: Applies project-specific Remix asset and hydration patterns to avoid runtime 404s and broken interactivity. Use when editing Document shells, clientEntry modules, or interactive Remix components.
---

# Remix Asset + Hydration Patterns

## Core rules

- Resolve client modules with `?assets=client`.
- Resolve server-rendered asset lists with `?assets=ssr`.
- Use `assets.entry`/`assets.js` from resolved assets; do not hardcode script paths.

## Client entry pattern

Use:

- `import assets from "./feature.tsx?assets=client"`
- `clientEntry(\`${assets.entry}#ExportName\`, ...)`

Avoid:

- `clientEntry("/remix/assets/feature.tsx#ExportName", ...)`

## Document shell pattern

- Import both client and SSR assets when needed and merge them.
- Render stylesheet links from `assets.css`.
- Render modulepreload links from `assets.js`.
- Render the module script from `assets.entry`.

## SVG sprite pattern

- Import sprite URL from the source file.
- Append fragment ids in markup (`${iconsHref}#icon-id`).
- Do not hardcode `/app/icons.svg` in Remix components.

## Quick verification

- Interactive components hydrate in dev and prod.
- No 404s for entry scripts in browser/network output.
