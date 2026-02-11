# base node image
FROM node:24-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp

RUN corepack enable && corepack prepare pnpm@latest --activate
ADD package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Setup production node_modules
FROM base as production-deps

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm prune --prod

# Build the app
FROM base as build

WORKDIR /remixapp

COPY --from=deps /remixapp/node_modules /remixapp/node_modules

ADD . .
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm run build

# Finally, build the production image with minimal footprint
FROM base

ENV PORT="8080"
ENV NODE_ENV="production"

WORKDIR /remixapp

COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --from=build /remixapp/build /remixapp/build
COPY --from=build /remixapp/server.ts /remixapp/server.ts
COPY --from=build /remixapp/server /remixapp/server
COPY --from=build /remixapp/package.json /remixapp/package.json
COPY --from=build /remixapp/start.sh /remixapp/start.sh

CMD ["pnpm", "start"]
