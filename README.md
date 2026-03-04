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

If you need cache-busting while developing server-rendered content:

```sh
NO_CACHE=1 pnpm run dev
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

Repo-specific implementation rules live in `AGENTS.md` and `remix/README.md`.

## Content

### Authoring Blog Posts

- Add a markdown file at `data/posts/{slug}.md`.
- Keep post author names aligned with `data/authors.yml`.
- Put post images under `public/blog-images/posts/{slug}/`.
- Put featured header images under `public/blog-images/headers/`.
- Use relative blog links like `[Title](post-slug)` (not `/blog/post-slug`).
