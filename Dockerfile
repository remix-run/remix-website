# base node image
FROM node:24-bullseye-slim as base

# Install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm prune --prod

# Build the app
FROM base as build

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules

COPY . .
RUN corepack enable && pnpm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /remixapp

COPY --chown=node:node --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --chown=node:node --from=build /remixapp/build /remixapp/build
COPY --chown=node:node --from=build /remixapp/server.ts /remixapp/server.ts
COPY --chown=node:node --from=build /remixapp/server /remixapp/server
COPY --chown=node:node --from=build /remixapp/_redirects /remixapp/_redirects
COPY --chown=node:node --from=build /remixapp/shared /remixapp/shared
COPY --chown=node:node --from=build /remixapp/data /remixapp/data
COPY --chown=node:node --from=build /remixapp/package.json /remixapp/package.json

USER node
CMD ["node", "server.ts"]
