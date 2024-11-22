---
title: React Router v7
summary: React Router v7 brings all the great things you love from Remix back to React Router
date: 2024-11-22
image: /blog-images/headers/react-router-v7.jpg
ogImage: /blog-images/headers/react-router-v7.jpg
imageAlt: "The React Router logo"
authors:
  - Michael Jackson
---

Today we are happy to announce the stable release of [React Router v7](https://reactrouter.com).

React Router v7 brings everything you love about [Remix](https://remix.run) back into React Router proper. We encourage all Remix v2 users to upgrade to React Router v7.

For the majority of the React ecosystem that has been around for the last 10 years, we believe React Router v7 will be the smoothest way to bridge the gap between React 18 and 19.

## Upgrading

For React Router v6 users, this release brings a wealth of features from Remix back into React Router [in the form of "framework mode"](https://reactrouter.com/upgrading/component-routes). In addition to the handful of components and hooks that you already use, you now have access to a compiler with broad support for dependencies (based on Vite), server rendering, bundle splitting and optimization, vastly improved type safety, a world-class development environment with HMR, and much more. Read the [React Router v6 upgrade guide](https://reactrouter.com/upgrading/v6) for more information on how we've made the upgrade path as smooth as possible for you, and what you have to look forward to in v7.

For Remix v2 users, this release brings a host of improvements to the type safety in Remix, as well as support for improved routing [via `routes.ts`](https://reactrouter.com/start/framework/routing) and [pre-rendering static pages](https://reactrouter.com/start/framework/rendering). Check out [the Remix v2 upgrade guide](https://reactrouter.com/upgrading/remix) for more information on how you can upgrade to React Router v7.

## New Apps

If you're starting a new app today with React Router, you have a choice: do you want to use React Router as just a library and bring the rest of the pieces yourself? Or do you want a full framework, ala Remix? It really depends on how much of your stack you'd like to invent yourself, and how much leverage you'd like to get out of React Router.

We have some guides to help you get started building new apps with React Router v7:

- [as a framework, using `create-react-router`](https://reactrouter.com/start/framework/installation)
- [as a library, using `create-vite`](https://reactrouter.com/start/library/installation)

If you'd like to get a head start in framework mode, we have [a number of templates you can choose from](https://github.com/remix-run/react-router-templates) that include:

- Server rendering
- Integrated dev server with HMR
- Asset bundling and optimization
- Data loading and mutations
- Styling using Tailwind
- and much more!

All of our templates come with built-in deployment pipelines as well, whether you're [using Docker and hosting on a VPS](https://github.com/remix-run/react-router-templates/tree/main/default) or deploying to a cloud solution [like Cloudflare Workers](https://github.com/remix-run/react-router-templates/tree/main/cloudflare-d1).

You will get a ton of mileage out of these templates when building a new app with React Router v7!

As always, please check out [the docs](https://reactrouter.com/home) for a full run down of everything React Router v7 has to offer.

Enjoy!
