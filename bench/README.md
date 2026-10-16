# Server benchmark

Measures production server throughput for the home, blog, blog post, and Jam
2026 pages so changes to Remix or the app can be compared on the same machine.
Every page renders from local data.

## Run it

Compare two clean checkouts, each with its own `pnpm install`:

```sh
git worktree add ../remix-website-main main
git worktree add ../remix-website-branch HEAD
pnpm --dir ../remix-website-main install --frozen-lockfile
pnpm --dir ../remix-website-branch install --frozen-lockfile

node bench/run.ts \
  --variant main=../remix-website-main \
  --variant branch=../remix-website-branch
```

Use worktrees rather than this checkout: `app/utils/env.ts` loads `.env` from
the working directory, and clean worktrees keep local tokens out of the
comparison.

The first variant is the baseline. Results are written to `bench/results/` and
summarized as a Markdown table.

| Option          | Default | Meaning                                     |
| --------------- | ------: | ------------------------------------------- |
| `--rounds`      |       5 | Fresh server per variant per round          |
| `--warmup`      |       3 | Seconds of unmeasured load before each page |
| `--duration`    |      10 | Measured seconds per page                   |
| `--threads`     |       2 | `wrk` threads                               |
| `--connections` |      10 | `wrk` keep-alive connections                |

It needs Node 24 and [`wrk`](https://github.com/wg/wrk) (`brew install wrk`).
Close other busy apps first; the load generator shares the machine.

## What it does

- Starts each checkout's `server.ts` the way the Dockerfile does
  (`NODE_ENV=production`, `MALLOC_ARENA_MAX=2`, `--import remix/node-tsx`),
  with a placeholder `CONVERTKIT_KEY` and no other environment.
- Renders each page once and fails if its visible text differs between
  variants or any request is not a 200.
- For each page, runs `wrk` for the warmup, then the measured window, sampling
  the server's RSS once per second.
- Sends `X-Forwarded-For` from a pool of 4,000 addresses
  (`rotate-ips.lua`), so the per-IP rate limit stays enabled without rejecting
  load.
- Alternates variant order every round.

HTML is uncompressed because `wrk` sends no `Accept-Encoding`. Peak RSS includes
compiling every page's browser modules on first render.
