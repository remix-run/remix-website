# Remix 3 Migration (`remix/` + `app/`)

This repo currently runs two routing/rendering systems side-by-side:

- `app/` contains the React Router v7 framework-mode app.
- `remix/` contains Remix 3 handlers and `remix/component` rendering code used by `remix/server.ts`.

Both systems run side-by-side in the same server during migration.

## Purpose

This document is the migration playbook for:

- route wiring conventions in `remix/server.ts`
- implementation constraints in `remix/`
- guardrails that keep production stable while migration is in progress

It is not the canonical source of truth for every shipped route. Keep the "Current state" section updated as changes land.

## Architecture

```
Request -> fetch-router
  |- explicit route match -> Remix handler
  `- catch-all "*"        -> React Router createRequestHandler
```

Explicit fetch-router routes in `remix/server.ts` take priority over the `*` catch-all.

## Current state

Current `remix/` contents:

```
remix/
|- assets/
|- lib/
|- routes/
|- middleware.ts
|- redirects.ts
|- react-router-type-stub.d.ts
|- server.ts
|- tsconfig.json
`- tsconfig.server.json
```

Current server wiring behavior:

- `/healthcheck` is handled directly in `remix/server.ts` (stable operational endpoint)
- `/blog/rss.xml` is handled directly in `remix/server.ts` with a production-safe Remix handler
- `/remix-test` is wired only in development as a Remix smoke test page
- all remaining routes are handled by React Router via the catch-all

## Production constraints

- Dynamic `.tsx` route imports are currently considered development-only.
- Production use of dynamic Remix route modules depends on the precompile/asset strategy (still in progress).
- For production migrations today, prefer stable handlers that can be imported directly by `remix/server.ts` (no Vite-only transforms like `import.meta.glob`).
- Keep `/healthcheck` on a stable server handler until the dynamic asset strategy is finalized.

## Dual-route strategy

When a user-facing route is migrated to Remix, keep the equivalent React Router route in `app/routes.ts` until linking pages are also migrated.

Why this is required:

- React Router intercepts client-side `<Link>` navigation.
- If a route is missing from the React Router manifest, client navigation can resolve through catch-all and produce incorrect behavior.

Expected behavior during migration:

- direct URL access: fetch-router can serve Remix route
- client-side navigation from React Router pages: React Router serves its route module
- links from Remix pages using plain `<a>`: full reload, then fetch-router serves Remix route

Remove route entries from `app/routes.ts` only after inbound linking surfaces are migrated.

Exception:

- Non-navigated resource endpoints (for example RSS/robots/sitemap-style URLs) can be removed from `app/routes.ts` once they are mapped explicitly in `remix/server.ts` for production.

## Conventions

### JSX pragma (required)

Every `.tsx` file in `remix/` that contains JSX must start with:

```tsx
/** @jsxImportSource remix/component */
```

The pragma is required for runtime JSX transform behavior in this repo.

### Imports

- Use relative imports inside `remix/`
- `~/*` alias usage is for the React Router app in `app/**`, not for `remix/**`
- Avoid importing modules that transitively import `react-router` (can leak incompatible React JSX types)
- Prefer `shared/**` for cross-runtime constants/utilities used by both `app/**` and `remix/**`

### Component pattern

`remix/component` components return render functions:

```tsx
export function MyComponent() {
  return (props: { label: string }) => <div>{props.label}</div>;
}
```

### Route handler pattern

Route handlers return `Response` objects. Visual routes typically render to string:

```tsx
/** @jsxImportSource remix/component */
import { renderToString } from "remix/component/server";
import { Document } from "../document";

export default async function handler() {
  const html = await renderToString(
    <Document title="Page Title">{/* page content */}</Document>,
  );

  return new Response("<!DOCTYPE html>" + html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
```

Routes with params receive a typed request context:

```ts
import type { RequestContext } from "remix/fetch-router";

export default async function handler(
  context: RequestContext<"ANY", { slug: string }>,
) {
  const { slug } = context.params;
  // ...
}
```

### Wiring a route in `remix/server.ts`

Current preferred pattern in this repo:

1. Define route map(s) with `route(...)` from `remix/fetch-router/routes`
2. Register handlers with `router.map(routeMap, controller)`
3. Put production-ready Remix routes in the always-on route map
4. Reserve `if (import.meta.env.DEV)` route maps for smoke tests and dynamic dev-only module imports
5. Keep React Router entries in `app/routes.ts` for user-facing routes during dual-stack period
6. Add a colocated Vitest test where possible

Server boundary:

- `remix/server.ts` should stay framework-agnostic and map request handlers.
- Route handlers can live under `remix/routes/**` and return `Response`.
- Shared constants/utilities used by both `app/**` and `remix/**` should live in `shared/**` (not `app/**`).
- Avoid dynamic `import()` on production request paths unless there is a specific need and monitoring/error handling is in place.

### HTML attributes

`remix/component` uses HTML attributes, not React camelCase:

- `class` not `className`
- `innerHTML` not `dangerouslySetInnerHTML`
- `fill-rule` not `fillRule`
- `crossorigin` not `crossOrigin`

### TypeScript isolation

Typechecking is intentionally split by runtime surface:

- `app/tsconfig.json`: React Router app code under `app/**`
- `remix/tsconfig.json`: Remix route/component code under `remix/**` (excludes `remix/server.ts`)
- `remix/tsconfig.server.json`: server-only check for `remix/server.ts`

`remix/tsconfig.server.json` includes a local `react-router` type stub mapping so `createRequestHandler` can be typed without pulling React-oriented JSX types into Remix route/component checks.

This split setup is temporary for the dual-runtime migration period. The target end-state is to collapse back to a single root TypeScript config once the React Router/Remix split is fully removed.

## Testing

- Vitest for route handler logic
- Playwright for browser-level verification
- Typical commands:
  - `pnpm vitest run`
  - `pnpm test:e2e`

## LLM/contributor checklist

Before opening a PR that changes `remix/**` or fetch-router mappings:

- Add JSX pragma to every Remix `.tsx` file with JSX
- Use relative imports in `remix/**`
- Do not import modules that pull in `react-router` types
- Keep `/healthcheck` on stable server path unless migration strategy explicitly changes
- Keep user-facing route entries in `app/routes.ts` until dual-route migration is complete
- For production migrations, prefer handlers that can run from `remix/server.ts` without Vite-only transforms
- Add or update tests for new route handlers and server route wiring

## Migration status (living section)

In progress:

- `remix/` scaffolding (`lib/document.tsx`, isolated tsconfigs, smoke-test route)
- server route map wiring pattern using fetch-router `route(...)`
- production Remix handler for `/blog/rss.xml` wired in `remix/server.ts`

Not yet fully migrated:

- client asset/precompile strategy for production Remix route imports
- blog pages (`/blog`, `/blog/:slug`)
- OG image generation (`/img/:slug`)
- newsletter action (`/_actions/newsletter`)
- interactive/hydrated components (menu, DocSearch, subscribe)
- tsconfig consolidation back to one root project config
