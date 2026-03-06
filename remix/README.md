# Remix notes (`remix/`)

This file is the technical spec for code under `remix/**`.
For contributor/agent workflow guidance, see `AGENTS.md`.

## Runtime model

- `remix/**` contains Remix 3 handlers and `remix/component` UI.
- `remix/server.ts` handles requests via `remix/fetch-router`.
- Explicit route mappings run before the catch-all.
- Catch-all is handled in `remix/routes/catchall.ts`.

## Directory boundaries

- `remix/routes/**`: route handlers/controllers
- `remix/components/**`: shared Remix UI
- `remix/assets/**`: interactive `clientEntry` modules
- `remix/shared/**`: shared styles/helpers/assets for Remix runtime
- Keep runtime code in `remix/**`.

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
- For standalone CSS files (for example `remix/shared/styles/md.css`), import with `?url` and render a stylesheet `<link>`.
- Do not hardcode module script paths (for example `/remix/assets/entry.ts`).
- For SVG sprites, import the asset URL and append fragment ids.

## Navigation

- See `remix/client-navigation.md` for the current top-frame navigation architecture.
- Full-document and frame-fragment HTML for the same URL must vary on `x-remix-target`.
- Keep route-local active state inside the fragment that gets re-rendered.
- Keep shell-level concerns that live outside the frame, such as document theme, synchronized via head metadata consumed by the persistent navigation controller.
- Prefer the Navigation API as the primary client navigation mechanism; degrade to normal browser navigations when it is unavailable.

## Pre-PR verification

- Run focused tests for changed routes/components.
- Run relevant typechecks.
- Always run `pnpm run build` before opening or shipping a PR.

## TypeScript/JSX config

`tsconfig.json` defines the TypeScript config for the Remix runtime:

- `"jsx": "react-jsx"`
- `"jsxImportSource": "remix/component"`
- `"types": ["node", "vite/client", "@hiogawa/vite-plugin-fullstack/types"]`

## Parity backlog

Track any remaining behavior differences from the previous production site here.
Each line item should be small enough to ship as a focused PR.

- **Client-side navigation rollout**: The top-frame navigation baseline exists, but it is not app-wide yet and nested frame targeting is still unimplemented.
- **Link prefetch parity**: Intent/predictive prefetch behavior is not yet mirrored across Remix pages.
- **Head deduping on repeated navigations**: Route-local head elements such as stylesheet links can accumulate across repeated frame navigations and should be deduped.
- **DOM-state preservation on frame reloads**: Reflected/native UI state such as `details[open]`, dialogs, and popovers may still need explicit preservation work.
- **Analytics on in-app transitions**: Explicitly verify one pageview per in-app navigation.
