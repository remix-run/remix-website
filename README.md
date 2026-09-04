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

To enable HMR:

```sh
pnpm run hmr
```

## Production Preview

```sh
pnpm run preview
```

Preview runs the TypeScript server with the production asset configuration.

## Deployment

- Production deploys from `main`.
- Staging deploys from the `stage` tag via:

```sh
pnpm run push:stage
```

### CDN caching

The app keeps browsers conservative while serving shared content from Fastly:

| Response                                    | Cache policy                                                                        | Deploy purge    |
| ------------------------------------------- | ----------------------------------------------------------------------------------- | --------------- |
| Rendered HTML                               | Browsers revalidate; Fastly caches for 5 minutes with 1 week stale-while-revalidate | `documents`     |
| Root `public/` files                        | Browsers and Fastly cache for 1 hour                                                | `static-assets` |
| Fingerprinted `/assets/*`                   | Browsers and Fastly cache immutable URLs for 1 year                                 | Never           |
| Personalized, mutation, and error responses | `private, no-store`                                                                 | Not cached      |

`app/middleware/render.ts` applies the document policy unless an action sets its own `Cache-Control`. `app/router.ts` tags root `public/` files. The production workflow completes the Fly rollout, then purges the `documents` and `static-assets` surrogate keys twice to cover Fastly edge/shield propagation.

Surrogate keys are public cache tags, not credentials; Fastly normally removes them before responding to browsers. Purge requests are authorized with the GitHub Actions `FASTLY_API_TOKEN` secret. Fingerprinted assets are not purged so older documents and open tabs can continue loading their matching assets.

## Contributing

- Create a branch from the latest target branch.
- Push your branch and open a PR.
- Run `pnpm run validate` before shipping a PR.
- See `AGENTS.md` for repo-specific rules (routes, assets, tests). Remix framework patterns live under `.agents/skills/remix/`.

## Codebase

- **`app/`** — Remix 3 site: `routes.ts` (URL contract), `router.ts` (middleware and route wiring), `actions/`, `ui/`, `data/`, etc.
- **`server.ts` (repo root)** — Node HTTP server used in development and production.
- **`data/`** — Blog posts and author metadata (separate from `app/data/`, which holds app-layer server modules such as blog queries).

## Content

### Newsletter Archive

- The `/newsletter` archive renders issues from the private
  `remix-run/newsletter` GitHub repository at runtime via a single tarball
  fetch.
- Because the repo is currently private, set `NEWSLETTER_GITHUB_TOKEN` (see
  `.env.example`) locally and in production to enable archive rendering.
  Without it, `/newsletter` returns a 503 when no cached snapshot exists.
- Issue directories are strict integers (`newsletter-<N>`); markdown
  filenames carry the UTC publication date (`YYYY-MM-DD-remix-newsletter-N.md`).

### Authoring Blog Posts

- Add a markdown file at `data/posts/{slug}.md`.
- Keep post author names aligned with `data/authors.yml`.
- Put post images under `public/blog-images/posts/{slug}/`.
- Put featured header images under `public/blog-images/headers/`.
- Use relative blog links like `[Title](post-slug)` (not `/blog/post-slug`).
