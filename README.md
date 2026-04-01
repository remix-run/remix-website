# Remix Website

## Setup

```sh
cp .env.example .env
pnpm install
```

## Local Development

```sh
pnpm run dev
```

## Build and Preview

```sh
pnpm run typecheck
pnpm run build
pnpm run preview
```

## Deployment

- Production deploys from `main`.
- Staging deploys from the `stage` tag via:

```sh
pnpm run push:stage
```

## Contributing

- Create a branch from the latest target branch.
- Push your branch and open a PR.
- Run `pnpm run build` before shipping a PR.
- See `AGENTS.md` for repo-specific rules (routes, assets, tests). Remix framework patterns live under `.agents/skills/` (start with `remix-overview`).

## Codebase

- **`app/`** — Remix 3 site: `routes.ts` (URL contract), `router.ts` (Vite SSR entry, middleware, route wiring), `controllers/`, `ui/`, `assets/`, `data/`, etc.
- **`server.ts` (repo root)** — Node HTTP server in production; serves the built app from `build/server/`.
- **`data/`** — Blog posts and author metadata (separate from `app/data/`, which holds app-layer server modules such as blog queries).

## Content

### Authoring Blog Posts

- Add a markdown file at `data/posts/{slug}.md`.
- Keep post author names aligned with `data/authors.yml`.
- Put post images under `public/blog-images/posts/{slug}/`.
- Put featured header images under `public/blog-images/headers/`.
- Use relative blog links like `[Title](post-slug)` (not `/blog/post-slug`).
