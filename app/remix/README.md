# Remix 3 Migration (`app/remix/`)

This directory contains routes and components being incrementally migrated from React Router v7 framework-mode to Remix 3's `remix/component` + `remix/fetch-router` system.

Both systems run side-by-side in the same server during migration.

## Purpose

This document is the migration playbook for:

- route wiring conventions in `server.ts`
- implementation constraints in `app/remix/`
- guardrails that keep production stable while migration is in progress

It is not the canonical source of truth for every shipped route. Keep the "Current state" section updated as changes land.

## Architecture

```
Request -> fetch-router
  |- explicit route match -> Remix handler
  `- catch-all "*"        -> React Router createRequestHandler
```

Explicit fetch-router routes in `server.ts` take priority over the `*` catch-all.

## Current state

Current `app/remix/` contents:

```
app/remix/
|- document.tsx
|- tsconfig.json
|- test-route.tsx
|- test-route.test.ts
`- README.md
```

Current server wiring behavior:

- `/healthcheck` is handled directly in `server.ts` (stable operational endpoint)
- `/remix-test` is wired only in development as a Remix smoke test page
- all remaining routes are handled by React Router via the catch-all

## Production constraints

- Dynamic `.tsx` route imports are currently considered development-only.
- Production use of dynamic Remix route modules depends on the precompile/asset strategy (still in progress).
- Keep `/healthcheck` on a stable server handler until that strategy is finalized.

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

## Conventions

### JSX pragma (required)

Every `.tsx` file in `app/remix/` that contains JSX must start with:

```tsx
/** @jsxImportSource remix/component */
```

The pragma is required for runtime JSX transform behavior in this repo.

### Imports

- Use relative imports inside `app/remix/`
- Do not rely on `~/*` aliases in `app/remix/`
- Avoid importing modules that transitively import `react-router` (can leak incompatible React JSX types)
- Prefer `app/lib/cache-control.ts` for shared cache constants

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

### Wiring a route in `server.ts`

Current preferred pattern in this repo:

1. Define route map(s) with `route(...)` from `remix/fetch-router/routes`
2. Register handlers with `router.map(routeMap, controller)`
3. For development-only smoke routes, register only when Vite dev server is present
4. Keep React Router entries in `app/routes.ts` for user-facing routes during dual-stack period
5. Add a colocated Vitest test where possible

### HTML attributes

`remix/component` uses HTML attributes, not React camelCase:

- `class` not `className`
- `innerHTML` not `dangerouslySetInnerHTML`
- `fill-rule` not `fillRule`
- `crossorigin` not `crossOrigin`

### TypeScript isolation

`app/remix/tsconfig.json` is standalone (no `extends`) and uses `"types": []` to prevent `@types/react` leakage.

Do not add `extends` back.

## Testing

- Vitest for route handler logic
- Playwright for browser-level verification
- Typical commands:
  - `pnpm vitest run`
  - `pnpm test:e2e`

## LLM/contributor checklist

Before opening a PR that changes `app/remix/` or fetch-router mappings:

- Add JSX pragma to every Remix `.tsx` file with JSX
- Use relative imports in `app/remix/`
- Do not import modules that pull in `react-router` types
- Keep `/healthcheck` on stable server path unless migration strategy explicitly changes
- Keep user-facing route entries in `app/routes.ts` until dual-route migration is complete
- Add or update tests for new route handlers and server route wiring

## Migration status (living section)

In progress:

- `app/remix/` scaffolding (`document.tsx`, isolated tsconfig, smoke-test route)
- server route map wiring pattern using fetch-router `route(...)`

Not yet fully migrated:

- user-facing Remix route modules wired in production
- client asset/precompile strategy for production Remix route imports
- blog pages (`/blog`, `/blog/:slug`)
- OG image generation (`/img/:slug`)
- newsletter action (`/_actions/newsletter`)
- interactive/hydrated components (menu, DocSearch, subscribe)
