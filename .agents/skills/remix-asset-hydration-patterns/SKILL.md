---
name: remix-asset-hydration-patterns
description: Applies project-specific Remix asset and hydration patterns to avoid runtime 404s and broken interactivity. Use when editing document shells, clientEntry modules, or hydrated Remix components.
---

# Remix Asset + Hydration Patterns

## Apply these defaults

- Resolve interactive client module URLs with `scriptModuleHref("remix/assets/…")` from `remix/utils/script-href.ts` (script-server URLs under `/scripts/remix/*`).
- For npm packages served via script-server, use `scriptModuleHref("node_modules/…")` (`/scripts/npm/*`).
- `remix/assets/entry.ts` resolves non-absolute `moduleUrl` values against `import.meta.url` so bare filenames still load next to the entry (avoids 404s on `/foo.tsx` at the site root).
- For standalone stylesheets built to `public/`, use normal static paths (for example `/site.css`) and `<link rel="stylesheet" href={…}>`.
- Document shell script tags and `modulepreload` links come from middleware (`scriptEntryContextKey`: entry + preloads from `scriptServer.preloads()`).

## Client entry pattern

Use:

- `let entry = scriptModuleHref("remix/assets/feature.tsx");`
- `clientEntry(\`${entry}#ExportName\`, …)`

Avoid:

- Vite-only `?assets=client` / `?assets=ssr` imports (no Vite in this app): they yield bare filenames in hydration and break `import()`.

## Document shell pattern

- Script `src` / `rel="modulepreload"` hrefs from `loadScriptEntry` middleware and `document.tsx` (not hand-rolled duplicates).

## SVG sprites

- Import the sprite URL from the source asset.
- Append fragment ids in markup, for example `${iconsHref}#icon-id`.
- Do not hardcode sprite paths in Remix components.

## Quick verification

- Hydrated components become interactive in dev and production builds.
- Browser output shows no 404s for entry scripts or sprite assets.
