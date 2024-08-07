---
title: "Incremental Path to React 19: React Conf Follow-Up"
summary: React Router v7 will provide an incremental path to the entire, full stack feature set of React. Upgrading from to React Router v7 is non-breaking for both React Router v6 and Remix v2.
featured: true
date: 2024-05-21
image: /blog-images/headers/reactconf-2024.jpg
imageAlt: Ryan Florence presenting at React Conf
authors:
  - Ryan Florence
---

Last week [I gave a talk](https://www.youtube.com/watch?v=ZcwA0xt8FlQ) about React Router and Remix at React Conf and [we posted an announcement](./merging-remix-and-react-router) here. Now that the dust has settled, I wanted to provide some more insight into the decision announced there and answer some common questions.

## tl;dr

**For React Router**

- React Router v6 to v7 will be a non-breaking upgrade
- The Vite plugin from Remix is coming to React Router in v7
- The Vite plugin simply makes existing React Router features more convenient to use, but it isn't required to use React Router v7
- v7 will support both React 18 and React 19

**For Remix**

- What would have been Remix v3 is React Router v7
- Remix v2 to React Router v7 will be a non-breaking upgrade
- Remix is coming back better than ever in a future release with an incremental adoption strategy enabled by these changes

**For Both**

- React Router v7 comes with new features not in Remix or React Router today: RSC, server actions, static pre-rendering, and enhanced Type Safety across the board

## Background

### Remix Became a Wrapper

Remix features have historically found their way back to React Router. In fact, for the last year or so all new features start in React Router and Remix simply calls into it.

At this point, Remix is just a Vite plugin that makes React Router more convenient to use and deploy. Outside of the plugin, Remix pretty much just re-exports React Router.

Splitting the code, docs, issues, discussions, and development between two projects serves no technical purpose anymore. Instead it adds artificial overhead for us and confusion for users.

So, we're moving the Vite plugin to React Router and calling it v7.

### RSC Changes Remix

React 19 with RSC allows us to rethink assumptions about how to build React apps that cross the center of the stack. It changes routing, bundling, data loading, revalidation, pending states, almost everything!

After experimenting with RSC, and running it in production with Hydrogen v1 for years now, we think we've designed a new API for Remix that's simpler and more powerful than ever. Internally we've code-named it "Reverb". At an in-person preview with folks from across Shopify, one of the engineers said quietly: "Wow, that's really beautiful".

We think it's beautiful too, but it's very different! <small>(We'll show it to you soon, but not yet.)</small>

The model was different enough that it seemed like we should name it something else to distinguish it from Remix today and to enable simpler incremental adoption by running both versions in parallel.

But we love Remix! The brand, the community, the ethos.

When Remix apps upgrade to React Router v7, this opens up space in your package.json to run both current and future Remix in parallel for a future incremental upgrade path. It also let's us keep the name!

So while it may look like needless package shuffling, the technical fact is that Remix today is just a wrapper and this shuffling enables the smoothest upgrade path into the future.

## Frequently Asked Questions

### What Does This Mean for React Router?

React Router v7 will not require Vite. You can keep using it exactly as you do today.

Upgrading from v6 to v7 will be a non-breaking upgrade as long as you're up to date on current [future flags in v6](https://reactrouter.com/en/main/guides/api-development-strategy#current-future-flags).

If you adopt the Vite plugin, you'll get easy access to automatic code-splitting, SSR, RSC, static pre-rendering, the route module API with server loaders, client loaders, actions, and more. These features are all possible by combining a bundler with already existing features in React Router.

One more time for people on Reddit: if you are up-to-date on current future flags, you can simply upgrade to v7 and change nothing.

Once upgraded to v7, you can adopt the Vite plugin and incrementally update parts of your code to take advantage of it if you would like to, but it is not required.

<small>(Did anybody notice the chiasmus? Kent?)</small>

### What Does This Mean for Remix?

Upgrading from Remix v2 to React Router v7 will be a non-breaking upgrade if you are caught up on [current Remix future flags](https://remix.run/docs/en/main/start/future-flags#current-future-flags).

Of course, you'll need to update your package.json to the new React Router packages and update your imports in app code, but we expect to have a codemod to do this for you.

### What Should I Use Today?

We recommend using Remix today. You can deploy a single page app if you're not interested in server rendering, or take advantage of React and Remix's server features like streaming, server loaders, actions and more.

## New Features and the Path to React 19

The future of React involves servers and build workflows to take advantage of React's new full stack composition story. Rewriting your React Router apps to Remix or another framework isn't a good enough answer for us.

Moving the Vite plugin to React Router provides a way for apps using either project to incrementally adopt new features where you need them, without having to mess with code that's working just fine today. Features like:

- SSR
- RSC
- Server actions
- Static pre-rendering (including RSC)

You'll also get enhanced type safety across the board from route configuration, params, to loader and action data, even type hints on `<Link>`, `navigate` for known paths in your app.

React 19 has challenged the assumptions of the last 10 years, these changes give React Router and Remix an incremental path into the next 10.

Build Better Websites! (incrementally)
