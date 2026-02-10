---
name: remix-3-migration
description: Conventions and patterns for the incremental Remix 3 migration in this repo. Use when creating or editing files in app/remix/, wiring routes in server.ts, or modifying app/routes.ts for migrated routes.
---

# Remix 3 Migration

This project is incrementally migrating from React Router v7 to Remix 3. Both systems run side-by-side. Read [app/remix/README.md](app/remix/README.md) for full architecture docs.

## Critical rules

1. **Always add `/** @jsxImportSource remix/component */`** as the first line of any `.tsx` file under `app/remix/` that contains JSX. Without this, the Vite dev server uses React's JSX runtime and the page 500s.

2. **Use relative imports in `app/remix/`** — `~/*` aliases don't resolve there.

3. **Never import from modules that transitively import `react-router`** (e.g., `app/lib/http.server.ts`). This pulls `@types/react` into scope and breaks remix/component's JSX types. Use `app/lib/cache-control.ts` for `CACHE_CONTROL`.

4. **Keep React Router routes in `app/routes.ts`** after migrating them to Remix 3. Removing them breaks client-side `<Link>` navigation from React Router pages (the catch-all matches and 404s). Remove only after all linking pages are also migrated.

5. **Don't add `"extends"` to `app/remix/tsconfig.json`** — it's standalone to isolate types. `"types": []` prevents `@types/react` leaking in.

## Creating a new route

1. Create handler in `app/remix/routes/your-route.ts(x)`.
2. If `.tsx` with JSX, add the pragma (rule 1).
3. Use relative imports for shared code (rule 2).
4. Wire in `server.ts`:

```ts
router.map("/your-path", async (context) => {
  const mod = await loadRemixModule("./app/remix/routes/your-route.tsx");
  return mod.default(context);
});
```

5. Keep the React Router route in `app/routes.ts` with a comment (rule 4).
6. Add a vitest test next to the route file.

## Component pattern

```tsx
/** @jsxImportSource remix/component */

export function MyComponent() {
  return ({ label }: { label: string }) => (
    <div class="text-lg">{label}</div>
  );
}
```

- Use HTML attributes: `class`, `innerHTML`, `fill-rule`, `crossorigin`
- Components return render functions: `() => (props) => JSX`

## Route handler pattern

**Without params** (e.g., `/blog`):
```tsx
export default async function handler() {
  const html = await renderToString(<Document title="...">...</Document>);
  return new Response("<!DOCTYPE html>" + html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
```

**With params** (e.g., `/blog/:slug`):
```tsx
import type { RequestContext } from "remix/fetch-router";

export default async function handler(
  context: RequestContext<"ANY", { slug: string }>,
) {
  const { slug } = context.params;
  // ...
}
```

## Document shell

Use `Document` from `../document` for visual pages. Props: `title` (required), `description`, `noIndex`, `head` (extra `<head>` elements), `children`.

```tsx
<Document title="Page" description="..." head={<link rel="stylesheet" href="/app/styles/md.css" />}>
  <MarketingLayout>
    {/* page content */}
  </MarketingLayout>
</Document>
```

## Testing

- Colocate vitest tests: `app/remix/routes/your-route.test.ts`
- For routes with params, construct a `RequestContext` and set `.params` manually
- Run `pnpm vitest run` for unit tests, `pnpm test:e2e` for Playwright
- Don't run `pnpm run dev` in automated tooling — let the user handle dev servers

## ESLint

`app/remix/**` files have an override in `.eslintrc.cjs` that disables React-specific rules (`react/*`, `react-hooks/*`).

## Migration status

Migrated:
- `/healthcheck` — plain text, no UI
- `/blog/rss.xml` — XML resource route

Not yet migrated:
- Blog pages (`/blog`, `/blog/:slug`) — needs layout duplication and hydrationRoot()
- `/img/:slug` — OG image (satori dependency)
- `/_actions/newsletter` — coupled to useFetcher
- Interactive components (mobile menu, DocSearch, Subscribe) — need hydrationRoot()
- Client asset pipeline (how remix/component client bundles are built/served)
