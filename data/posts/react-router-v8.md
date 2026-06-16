---
title: React Router v8
summary: React Router v8 is available now.
date: 2026-06-17
image: /blog-images/headers/react-router-v8.jpg
ogImage: /blog-images/headers/react-router-v8.jpg
imageAlt: "A big, floating, v8"
imageDisableOverlay: true
featured: true
authors:
  - Brooks Lybrand
---

Today we are excited to announce React Router v8!

React Router has evolved many times over its 12-year history. We're so grateful for the thousands of developers, millions of projects, and billions of downloads that have trusted in this project.

For the veterans in the room, you may remember a time when a new major version of React Router meant a number of breaking changes and you reaching for your inhaler. Michael and Ryan send their appologies and I kindly request you to recheck the record: with our [future flags](./future-flags) we've released multiple boring upgrades, and we're on track for our most boring one yet.

We've learned a lot since the early days of React Router (before most of us were even on the team), and our aim for the past several major versions has been to make them _as boring as possible_. We did our absolute best this time. And to make our major versions from here on out even more predictable, and consequently more boring, we are adopting a yearly major release schedule.

The only downside of a boring release is it makes it hard to hype up in a blog post (for which I drew the short straw). Nevertheless, let's recap what the team has been up to since v7, what v8 brings, how to upgrade, and what the future holds.

## Quick Recap of v7

The big headline for [React Router v7](./react-router-v7) was the introduction of Framework Mode: a Vite plugin that upgrades your React application with:

- type-safe Route Module API
- intelligent code splitting
- SPA, SSR, and static rendering strategies
- data loading and mutations
- and much more!

Our goal with v7 was for React Router to be your one-stop package for developing any React-based application. You can use React Router like many have for years as a simple client-side router, you can build your own custom framework with Data Mode, or take it all the way to being your full-stack framework.

We will continue to support and improve [all three React Router modes](https://reactrouter.com/start/modes), while also adopting whatever other features React introduces, such as Server Components and Server Actions (more on that later).

When working with React, we think you should be in charge. We don't force you into using Server Components, SSR, SSG, or any other acronym. Use the tools that make sense to you, and develop the application your users need. Do it all with the decade-old, battle-tested library: `react-router`.

## What's New

Like I said, the problem with boring major versions is they make for boring blog posts. So allow me a moment to brag about the 40+ releases we've shipped since v7.

- Middleware/better context support
- Split Route Modules
- `useRoute`/`useRouterState`
- Type-safe `href`
- `fetcher.reset`
- Vite Environment API support
- Instrumentation API
- Link masking
- Call-site revalidation
- Improvements to SPA mode
- Improvements to pre-rendering
- Configurable Lazy Route Discovery
- `useTransitions`
- Object-based `route.lazy`
- Subresource integrity
- RouterProvider `onError`
- Pass-through Requests
- Tons of performance improvements
- Agent Skills
- (unstable) RSC Support

That's not even an exhaustive list (just needed to make it long enough for you to get exhausted reading it).

## What's Changing

It's not a major version if nothing broke. The breaking changes for v8 are quite minimal, and all of them are changes you can make in v7. Let's break it down by updated baseline support for peer dependencies, [future flags](./future-flags), and deprecations.

### Baseline Support

In React Router v8 the following are the new minimum supported versions:

- Node 22.22.0+
- React 19.2.6+
- Vite 7+

To modernize the library, React Router is now published as an ESM-only module, and tsconfig `target`/`lib` fields have been updated to ES2022 across the board.

A note on [Node version](https://nodejs.org/en/about/previous-releases) support: Starting with v8, React Router will officially support all Active LTS Node versions and only the latest minor branch of Maintenance LTS versions. That means that at the time of publishing this blog post:

- Node 24 is in _Active LTS_ status, so React Router officially supports all 24.x versions
- Node 22 is in _Maintenance LTS_ status, so React Router only officially supports 22.22.x versions
  - If a Node 22.23.x line is released, React Router will bump it's minimum Node support to 22.23.x in a Minor release
  - When Node 22 goes EOL, React Router will drop support in a Major release

This allows us to bump minimum Maintenance LTS versions to account for newly released security patches. It also allows us to more quickly and easily adopt new Active LTS features backported to Maintenance LTS lines. Upgraded minimum Maintenance LTS versions will be done in React Router minor releases.

### Adopted Future Flag Behavior

The following v8 future flags have been removed and their behaviors are now the default:

- `future.v8_trailingSlashAwareDataRequests`
- `future.v8_passThroughRequests`
- `future.v8_middleware`
- `future.v8_viteEnvironmentApi`
- `future.v8_splitRouteModules` has moved to a top-level `splitRouteModules` config option and is enabled by default

### Deprecations

We only had a few minor deprecations in React Router:

- Removed `react-router-dom`. It was just a mirror of `react-router` to help smooth the v6 -> v7 upgrade. If you're still using it, you can safely remove it. Use `react-router` and `react-router/dom` instead.
- Removed the deprecated `data` parameter in favor of `loaderData` for meta APIs.
- Removed our Cloudflare dev proxy (`@react-router/dev/vite/cloudflare`) in favor of Cloudflare's Vite plugin (`@cloudflare/vite-plugin`).
- Removed the The `@react-router/architect` `createRequestHandler` `useRequestContextDomainName` option.

## How to Upgrade

Basically, just look at 👆.

- Update peer dependencies
- Adopt future flags
- Remove deprecated APIs/`react-router-dom`

Then just `pnpm i react-router@latest` and you're off to the races!

You can check out the [full upgrade guide](https://reactrouter.com/upgrading/v7) (or, let's be honest, throw it at your AI agent) for more details.

As always, please open a ticket if you run into a bug or [reach out on Discord](https://discord.gg/xwx7mMzVkA) if you have any questions.

## React Router Moving Forward

We're incredibly happy with how the Open Governance model has been working, and hope we receive many more quality proposals and bug fixes via [our process](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#new-feature-process).

As mentioned above, we are also planning to move to a yearly major release cadence for React Router. This will make our major versions regular, predictable, and most of all boring.

With the release of React Router v8 we are officially marking React Router v6 and Remix v2 as End of Life (EOL) so they will no longer be receiving security updates. React Router v7 will continue to receive security updates, just like v6 (and Remix v2) did. If you haven't already upgraded from either of those versions to v7, now is a good time (again, the [upgrade](https://reactrouter.com/7.18.0/upgrading/v6) should be pretty boring).

With React Router, we intend to always support the latest React features. One feature we haven't talked about much here is support for Server Components and Server Actions. That work is still in progress and unstable, but only because we want to be absolutely sure we're happy with the APIs before committing to them. We have [several templates](https://github.com/remix-run/react-router-templates/) and [docs](https://reactrouter.com/how-to/react-server-components), and are eager for community feedback. Server Components are an opt-in architecture and feature, and we anticipate stabilizing support soon in a minor version.

Finally, I want to quote directly from [our design goals](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#design-goals). When we think about improving React Router, we aim for the following:

- Less is More
- Routing and Data Focused
- Simple Migration Paths
- Lowest Common Mode

That's our creed and commitment as we continue improving React Router.

## A Word on Remix

If you made it to the bottom of a blog post about React Router, you're likely already up to date. But in case you're wondering, "wait, whatever happened to Remix?", here's the short version: [React Router is our React meta-framework](./merging-remix-and-react-router), and [we're taking Remix in a different direction](./wake-up-remix). You should also [check out the Remix 3 beta](./remix-3-beta-preview). It's pretty cool.

This diagram gives a quick visual history of how both projects have evolved, and how we plan to keep developing them moving forward. Think of Remix v0.x–2.x as a feature branch of React Router. Once it matured, we merged those ideas and APIs back into React Router. That frees Remix to become a truly [full-stack, zero-dependency JavaScript web framework](/) without stopping us from continuing investing in the many React-based websites built on React Router.

One team. Two projects. One goal: build better websites.

![Timeline of Remix/React Router history](/blog-images/posts/react-router-v8/remix-history.avif)

> But Brooks, should I use React Router or Remix?!?!

If you need something battle-tested, stick with React Router. It's awesome. I just wrote a whole blog post about the 40+ releases we've shipped, the easy upgrade path, and the future work ahead. We clearly believe in this project.

If you believe nothing is static in tech, and that the web and open source should keep pushing forward and trying new things, [check out the principles behind Remix 3](https://github.com/remix-run/remix#welcome-to-remix-3). If they click for you, consider giving Remix a try the next time you start a new project.
