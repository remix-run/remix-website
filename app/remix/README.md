# Remix 3 Migration (`app/remix/`)

This directory contains routes and components being incrementally migrated from React Router v7 framework-mode to Remix 3's `remix/component` + `remix/fetch-router` system. Both systems run side-by-side in the same server during migration.

## Architecture

```
Request → fetch-router
  ├─ explicit route match → Remix 3 handler (renderToString)
  └─ catch-all "*"        → React Router (createRequestHandler)
```

Migrated routes are registered as explicit patterns on the fetch-router in `server.ts`. They take priority over the `*` catch-all, which delegates to React Router for everything else.

### Dual-route strategy

When a route is migrated to Remix 3, **keep it in `app/routes.ts`** alongside the new handler. This is required because React Router's client-side router intercepts `<Link>` clicks. If the route isn't in the client manifest, the catch-all matches and 404s.

- **Direct URL access** (browser address bar, external link): fetch-router serves the Remix 3 version
- **Client-side navigation** from a React Router page: React Router serves its version
- **Links from Remix 3 pages** (`<a>` tags): full page reload → fetch-router serves Remix 3

Remove a route from `app/routes.ts` only after all pages that link to it have also been migrated.

## Directory structure

```
app/remix/
├── document.tsx            # Shared HTML shell (<html>, <head>, <body>)
├── tsconfig.json           # Standalone TS config (isolates remix/component types)
├── routes/
│   ├── healthcheck.ts      # GET /healthcheck
│   ├── blog-rss.ts         # GET /blog/rss.xml
│   └── *.test.ts           # Vitest unit tests for each route
└── test-route.tsx          # Temporary /remix-test smoke-test page
```

## Conventions

### JSX pragma (required)

Every `.tsx` file in this directory that contains JSX **must** start with:

```tsx
/** @jsxImportSource remix/component */
```

The Vite dev server uses the `reactRouter()` plugin, which defaults to React's JSX runtime. The pragma overrides this per-file. The nested `tsconfig.json` handles type-checking, but the pragma is needed for the runtime transform.

### Imports

- **Use relative imports** — the `~/*` path alias doesn't resolve here because Vite's `tsconfigPaths` plugin reads the root `tsconfig.json`, which excludes `app/remix/`.
- **Avoid importing from `app/lib/http.server.ts`** or anything that transitively imports `react-router`. This pulls `@types/react` into the type scope and causes JSX type conflicts. Use `app/lib/cache-control.ts` for `CACHE_CONTROL`.

### Component pattern

`remix/component` components return a render function:

```tsx
export function MyComponent() {
  return (props: { label: string }) => (
    <div>{props.label}</div>
  );
}
```

### Route handler pattern

Route handlers are async functions that return a `Response`. Visual routes use `renderToString`:

```tsx
/** @jsxImportSource remix/component */
import { renderToString } from "remix/component/server";
import { Document } from "../document";

export default async function handler() {
  const html = await renderToString(
    <Document title="Page Title">
      {/* page content */}
    </Document>,
  );
  return new Response("<!DOCTYPE html>" + html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
```

Routes with URL params receive a `RequestContext`:

```tsx
import type { RequestContext } from "remix/fetch-router";

export default async function handler(
  context: RequestContext<"ANY", { slug: string }>,
) {
  const { slug } = context.params;
  // ...
}
```

### Wiring a route

1. Create the handler in `app/remix/routes/`
2. Add `router.map("/path", ...)` in `server.ts` using `loadRemixModule()`
3. Keep the React Router route in `app/routes.ts` (see dual-route strategy above)
4. Add a vitest test in the same directory

### HTML attributes

`remix/component` uses HTML attributes, not React's camelCase:
- `class` not `className`
- `innerHTML` not `dangerouslySetInnerHTML`
- `fill-rule` not `fillRule`
- `crossorigin` not `crossOrigin`

### TypeScript isolation

The `tsconfig.json` in this directory is **standalone** (does not extend the root). It sets `"types": []` to prevent `@types/react` from leaking in. Do not add `"extends"` back.

## Testing

- **Vitest** for route handler logic (fast, no browser). Each route has a colocated `.test.ts`.
- **Playwright** for browser-level verification. Tests are in `e2e/`.
- Run `pnpm vitest run` and `pnpm test:e2e`.

## Migration status

Migrated:
- `/healthcheck` — plain text, no UI
- `/blog/rss.xml` — XML resource route

Not yet migrated:
- **Blog pages** (`/blog`, `/blog/:slug`) — will need layout duplication (header, footer) and `hydrationRoot()` for interactive components
- **OG image generation** (`/img/:slug`) — `satori` dependency uses React-like elements
- **Newsletter action** (`/_actions/newsletter`) — coupled to React Router's `useFetcher`
- **Interactive components** (mobile menu, DocSearch, Subscribe) — need `hydrationRoot()`
- **Client asset pipeline** — how remix/component client bundles are built/served alongside Vite (TBD)
