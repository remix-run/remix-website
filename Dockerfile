# base node image
FROM node:16-bullseye-slim as base

RUN apt-get update && apt-get install -y openssl

ENV NODE_ENV=production
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG REPO
ENV REPO=$REPO
ARG REPO_DOCS_PATH
ENV REPO_DOCS_PATH=$REPO_DOCS_PATH
ARG REPO_LATEST_BRANCH
ENV REPO_LATEST_BRANCH=$REPO_LATEST_BRANCH
ARG SITE_URL
ENV SITE_URL=$SITE_URL

# install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp/

ADD package.json package-lock.json .npmrc ./
RUN npm install --production=false

# setup production node_modules
FROM base as production-deps

WORKDIR /remixapp/

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json .npmrc /remixapp/
RUN npm prune --production

# build remixapp
FROM base as build

WORKDIR /remixapp/

COPY --from=deps /remixapp/node_modules /remixapp/node_modules

# schema doesn't change much so these will stay cached
ADD prisma .

# remixapp code changes all the time
ADD . .

RUN npx prisma migrate reset --force --skip-seed
RUN npx prisma generate
RUN npm run seed

RUN npm run build

# build smaller image for running
FROM base

WORKDIR /remixapp/

COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --from=build /remixapp/node_modules/.prisma /remixapp/node_modules/.prisma
COPY --from=build /remixapp/public /remixapp/public
COPY --from=build /remixapp/prisma /remixapp/prisma
COPY --from=build /remixapp/build /remixapp/build
ADD . .

CMD ["npm", "run", "start"]
