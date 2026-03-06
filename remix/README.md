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

- The current enhanced navigation model is intentionally narrow and should stay easy to unwind later if we switch to Remix's first-party client navigation APIs.
- Direct visits still render a full HTML document on the server.
- Enhanced same-origin navigations reload the top `app` `Frame` instead of forcing a full document navigation.
- Full-document and frame-fragment HTML for the same URL must vary on `x-remix-target`.
- Keep route-local active state inside the fragment that gets re-rendered.
- Keep shell-level concerns that live outside the frame, such as document theme, synchronized via head metadata consumed by the persistent navigation controller.
- Prefer the Navigation API as the primary client navigation mechanism; degrade to normal browser navigations when it is unavailable.

### Navigation wiring

- `remix/components/document.tsx` hosts the persistent `AppNavigation` client entry and the top-level `Frame name="app"`.
- `remix/utils/render.ts` splits document vs frame responses and applies `Vary: x-remix-target`.
- `remix/assets/app-navigation.tsx` intercepts opted-in same-origin navigations and reloads the `app` frame.
- `remix/shared/app-navigation.ts` defines the shared header, frame, and opt-in attribute constants.
- `remix/shared/app-navigation-handlers.ts` allows route-local handlers to short-circuit a frame reload when a URL change can be handled in place.
- Routes that participate in enhanced navigation render both a full document and a frame fragment, usually through helpers like `renderJamPage(...)`.
- Route-local links should use `AppLink`, or live inside a container marked with `data-app-nav-scope`.

### Request model

- Full document requests return the shared HTML shell plus `<Frame name="app" src={request.url}>`.
- Frame requests with `x-remix-target: app` return only route-local head tags, page content, and any nested client entries.
- The persistent navigation controller re-syncs shell concerns after a frame reload, including document theme and basic head deduping.

### Current scope

- Shared header links participate.
- Blog index and blog post routes support document and frame rendering.
- The Jam 2025 route family supports document and frame rendering.
- Jam gallery photo transitions use a route-local handler so `?photo=` URL changes stay local instead of reloading the frame.

### If we replace this later

- Start with `remix/components/document.tsx`, `remix/utils/render.ts`, and `remix/assets/app-navigation.tsx`.
- Then remove or adapt route-local opt-in points such as `AppLink`, `data-app-nav-scope`, and `remix/shared/app-navigation-handlers.ts`.
- Finally simplify routes that currently return both document and frame variants.

## Pre-PR verification

- Run focused tests for changed routes/components.
- Run relevant typechecks.
- Always run `pnpm run build` before opening or shipping a PR.

## TypeScript/JSX config

`tsconfig.json` defines the TypeScript config for the Remix runtime:

- `"jsx": "react-jsx"`
- `"jsxImportSource": "remix/component"`
- `"types": ["node", "vite/client", "@hiogawa/vite-plugin-fullstack/types", "dom-navigation"]`

## Parity backlog

Track any remaining behavior differences from the previous production site here.
Each line item should be small enough to ship as a focused PR.

- **Client-side navigation rollout**: The top-frame navigation baseline exists, but it is not app-wide yet and nested frame targeting is still unimplemented.
- **Link prefetch parity**: Intent/predictive prefetch behavior is not yet mirrored across Remix pages.
- **Head syncing remains intentionally basic**: The current dedupe pass handles common `<title>`, `<meta>`, and `<link>` tags, but it is still hand-rolled and conservative.
- **DOM-state preservation on frame reloads**: Reflected/native UI state such as `details[open]`, dialogs, and popovers may still need explicit preservation work.
- **Analytics on in-app transitions**: Explicitly verify one pageview per in-app navigation.
