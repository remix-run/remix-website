# base node image
FROM node:24-bullseye-slim as base

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

WORKDIR /remixapp

COPY --chown=node:node --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --chown=node:node app ./app
COPY --chown=node:node public ./public
COPY --chown=node:node server.ts tsconfig.json remix.json _redirects package.json ./
COPY --chown=node:node data ./data

USER node
CMD ["node", "--import", "remix/node-tsx", "server.ts"]
