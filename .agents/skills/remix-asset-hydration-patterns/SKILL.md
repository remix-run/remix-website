---
name: remix-asset-hydration-patterns
description: Applies project-specific Remix asset and hydration patterns to avoid runtime 404s and broken interactivity. Use when editing document shells, clientEntry modules, or hydrated Remix components.
---

# Remix Asset + Hydration Patterns

## Apply these defaults

- Resolve interactive client modules with `?assets=client`.
- Resolve document asset manifests with `?assets=ssr`.
- Use `?assets=ssr` only for module assets such as `*.tsx`, not plain stylesheet files.
- For standalone stylesheets, import with `?url` and render a `<link rel="stylesheet" href={...}>`.
- Render scripts and preload links from `assets.entry` / `assets.js`; do not hardcode module paths.

## Client entry pattern

Use:

- `import assets from "./feature.tsx?assets=client"`
- `clientEntry(\`${assets.entry}#ExportName\`, ...)`

Avoid:

- `clientEntry("/remix/assets/feature.tsx#ExportName", ...)`

## Document shell pattern

- Import SSR assets from the module that owns the rendered UI.
- Render stylesheet links from `assets.css`.
- Render `modulepreload` links from `assets.js`.
- Render the module script from `assets.entry`.

## SVG sprites

- Import the sprite URL from the source asset.
- Append fragment ids in markup, for example `${iconsHref}#icon-id`.
- Do not hardcode sprite paths in Remix components.

## Quick verification

- Hydrated components become interactive in dev and production builds.
- Browser output shows no 404s for entry scripts or sprite assets.
