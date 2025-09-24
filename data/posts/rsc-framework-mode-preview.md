---
title: "React Router RSC Framework Mode Preview"
summary: React Router's preview support for RSC Framework Mode is now available
date: 2025-09-18
image: /blog-images/headers/rsc-framework-mode-preview.jpg
ogImage: /blog-images/headers/rsc-framework-mode-preview.jpg
imageAlt: Glowing tree
imageDisableOverlay: true
authors:
  - Mark Dalgleish
---

Recently we shipped a [preview of React Router with support for React Server Components (RSC)](./rsc-preview) as well as low-level APIs for [RSC support in Data Mode](./react-router-and-react-server-components). With the release of React Router v7.9.2, we're excited to announce that preview support for [RSC](https://react.dev/reference/rsc/server-components) is now also available in Framework Mode.

## In short

- React Router v7.9.2 has preview support for React Server Components in Framework Mode, provided as a new unstable Vite plugin.
- Server-rendered apps are supported in the initial preview release.
- SPA Mode, pre-rendering and custom build entries will be supported in a future release.

## Try it out

To get started, you can quickly scaffold a new app from our [unstable RSC Framework Mode template](https://github.com/remix-run/react-router-templates/tree/main/unstable_rsc-framework-mode):

```sh
npx create-react-router@latest --template remix-run/react-router-templates/unstable_rsc-framework-mode
```

## Framework Mode vs Data Mode

In case you're unfamiliar with React Router's Framework Mode and Data Mode, here's a quick overview.

**Data Mode** provides the core APIs for routing, data loading and action handling. In this mode, you're responsible for the overall structure of your project, potentially managing multiple builds and the communication between them at runtime, wiring everything up to a bundler including HMR etc.

All of this can be tricky to get right. You're effectively building your own meta-framework on top of React Router.

With **Framework Mode**, all of this build setup is handled for you via our official Vite plugin, including additional features like typegen and optional file system routing. For most people starting a new project, Framework Mode provides the most streamlined developer experience.

So, while many consumers were excited to see RSC support in Data Mode, we know that many more of you were instead patiently waiting for RSC support to land in Framework Mode.

## Layering on Framework Mode

When introducing RSC to React Router, it was important that we first started at the lowest level with RSC Data Mode. Not only did this ensure we have a stable foundation that could be used with any RSC-enabled bundler, but it also gave us a clear compilation target for RSC Framework Mode.

Now that RSC Data Mode is in place, we're able to provide an RSC-powered Vite plugin that compiles to these lower level APIs.

As noted in our post on ["React Router and React Server Components: The Path Forward"](./react-router-and-react-server-components), the great thing about RSC is that this new Framework Mode plugin is much simpler than our earlier non-RSC work. Most of the framework-level complexity is now implemented at a lower level in RSC Data Mode, with RSC Framework Mode being a more lightweight layer on top.

## Getting started

Today, when using the regular non-RSC Framework Mode, you add the React Router plugin to your Vite config:

<!-- prettier-ignore -->
```ts
// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [
    reactRouter(),
  ],
});
```

To enable RSC Framework Mode, you simply swap this out for the new `unstable_reactRouterRSC` Vite plugin, along with the official (experimental) [@vitejs/plugin-rsc](https://www.npmjs.com/package/@vitejs/plugin-rsc) as a peer dependency.

```sh
npm install @vitejs/plugin-rsc
```

<!-- prettier-ignore -->
```ts
// vite.config.ts
import { defineConfig } from "vite";
import { unstable_reactRouterRSC } from "@react-router/dev/vite";
import rsc from "@vitejs/plugin-rsc";

export default defineConfig({
  plugins: [
    unstable_reactRouterRSC(),
    rsc(),
  ],
});
```

With these new plugins, all of the features described in our [RSC preview blog post](./rsc-preview) will be available in your Framework Mode app:

- The ability to return RSC content from loaders/actions.
- RSC-first "Server Component Routes" by exporting a `ServerComponent` instead of the usual `default` component export.
- Client components with the `"use client"` directive.
- Server Functions with the `"use server"` directive.

Note that some Framework Mode features are not available in our initial preview release. Most notably, SPA Mode, pre-rendering and custom build entries are not yet supported, but rest assured we plan on supporting these before a stable release.

## Build output

We've worked to keep the build output as close as possible to non-RSC Framework Mode. In fact, the top-level structure is exactly the same:

- `build/server` - Server code
- `build/client` - Browser assets

What's changed is the content of `build/server/index.js`.

In non-RSC Framework Mode, the exports from `build/server/index.js` form a React Router `ServerBuild` object. In order to make use of this, you need to pass it through an adapter to your desired runtime, e.g. `createRequestListener` from `@react-router/node`, or `createRequestHandler` from `@react-router/express`.

```ts
import { createRequestHandler } from "@react-router/express";
import express from "express";

const app = express();
const build = await import("./build/server/index.js");
app.all("*", createRequestHandler({ build }));
```

In RSC Framework Mode, `build/server/index.js` exports a plain old request handler function (`(request: Request) => Promise<Response>`) designed for handling document/data requests.

```ts
import { createRequestListener } from "@remix-run/node-fetch-server";
import express from "express";

const app = express();
const build = await import("./build/server/index.js");
app.all("*", createRequestListener(build.default));
```

Importantly, even though these new RSC features rely on having both an "RSC server" and "SSR server" set up, **the build output is still just a single server runtime.** That means it can be deployed just like any other non-RSC Framework Mode app today.

So, the obvious question is — if it's this straightforward to use RSC with Framework Mode, why not give it a try?

## What's Next?

For more details on how to use RSC Framework Mode in React Router, check out our [React Server Components guide](https://reactrouter.com/how-to/react-server-components).

Stay tuned for more updates to both RSC Data Mode and RSC Framework Mode as we work towards a stable release!
