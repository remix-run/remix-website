# base node image
FROM node:24-bookworm-slim as base

# Install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm prune --prod

# Build the production image with a minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"
# Bound glibc allocator arenas so native compiler/image work retains less
# fragmented memory between requests on our single-CPU Fly machines.
ENV MALLOC_ARENA_MAX="2"

WORKDIR /remixapp

COPY --chown=node:node --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --chown=node:node app ./app
COPY --chown=node:node public ./public
COPY --chown=node:node server.ts warm-image-cache.ts tsconfig.json remix.json _redirects package.json ./
COPY --chown=node:node data ./data

# Resize blog images at build time so new machines don't do it in their first
# requests. The cache only ships with the image it was built from, so a fixed
# key can't go stale.
ENV ASSET_FILE_CACHE_DIR="/remixapp/.asset-cache"
ENV ASSET_FILE_CACHE_KEY="image"
RUN install -d -o node -g node "$ASSET_FILE_CACHE_DIR"

USER node
RUN node --import remix/node-tsx warm-image-cache.ts

CMD ["node", "--import", "remix/node-tsx", "server.ts"]
