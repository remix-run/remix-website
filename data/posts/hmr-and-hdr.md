---
title: HMR + Hot Data Revalidation in Remix
summary: TODO
date: 2023-02-22
image: TODO
imageAlt: TODO
authors:
  - Pedro Cattori
---

📢 Support for Hot Module Replacement and Hot Data Revalidation has landed in Remix under the `unstable_dev` future flag!

## Dreaming of DX

Development is all about _changing_ your code.
You reorder elements, add styles, or tweak your data query.

But propagating those changes to the browser can be tedious or slow. 😖
Worse, changes may require a full page refresh that wipes out form inputs, closes modals, and resets React state. 🫠

> That's a nice input-specific form error within a modal you're working on. Would be a shame if something happened to it...

Oof...

But, imagine 🌈 if your **code changes were reflected immediately in the browser** and
that all that beautiful **browser state stuck around**.
That's the sort of fast-feedback loop that feels like a superpower. 🦸
That's what we're aiming for.

## On the shoulders of giants

Luckily, we're not the first to explore the landscape of web DX.

Here's a quick list of some of the widely-used techniques:

- **Watch mode** : observes your source code and signals when changes occur
- **Incremental rebuild** : efficiently reuses data from previous builds to speed up current build
- **Live reload** : tells the browser to refresh when a new build is ready
- **Hot Module Replacement** : swaps out Javascript modules in a running app so that browser state is preserved

These techniques are not mutually exclusive.
For example, the default Remix dev server uses watch mode to trigger incremental rebuilds when you change your code and
then live reloads the app in your browser.

But Remix hasn't made the leap to HMR.
Until now.

## HMR

Remix now uses HMR to update your running components while keeping everything on the page intact.
You can add, remove, change, or reorder components.[^key-prop]
You can edit your CSS directly or change what CSS classes an element has.
The Remix dev server knows how to keep all these changes in sync without doing a full page refresh.

[^key-prop]: You might need a `key` prop for React to track your component changes!

Under the hood, we're relying on [React Refresh][react-refresh] so that React can participate in managing component changes.
That's the magic that lets tools like Remix preserve the React-based state (think `useState`) in your app during HMR.
We also use a couple other tricks—content hashing and timestamping asset chunks—to handle hot updates for non-React stuff like styles.

Remix is building on top of the HMR concepts [pioneered by Webpack][webpack] and
[Vite's ESM HMR implementation][vite].
A big thank you 🙏 goes out to everyone who worked on those.

## Hot Data Revalidation

HMR was designed for client-side updates, especially for Single Page Applications.
But Remix isn't limited to the client-side, so we needed to come up with something for **excellent DX for server-side changes** too.
Specifically, Remix uses `loader`s to fetch data for each route.
If you update your `loader`, how can Remix reflect those changes on the page?

Introducing _Hot Data Revalidation_ 🔥.
HDR detects `loader` changes on your Remix routes and refetches (i.e. revalidates) any data for the updated `loader`s.
It's smart, so it only revalidates data as needed:

- Change _just_ your component 👉 HMR
- Change _just_ your loader 👉 HDR
- Change your loader _and_ your component 👉 HMR + HDR

HDR only hot revalidates `loader`s for your current route, so no extra fetching happens if your `loader` is on another route.

We've loved pioneering HDR ❤️ and hope to see other frameworks build on those ideas! 🤝

## Demo!

[![TODO](todo)](https://www.youtube.com/watch?v=S_84Ty2sFfM "Remix Demo: HMR + Hot Data Revalidation")

Note: You won't need to grab the experimental release

You can try out HMR + HDR in Remix easily with the following templates:

- [Express template][express-template] used in the demo video 👆
- [Cloudflare Pages template][cf-pages-template]

For example:

```sh
npx create-remix@latest --template pcattori/remix-hmr-example my-remix-app
cd my-remix-app
# `npm install` now if you haven't already!
npm run dev
```

Then open up your favorite text editor and start making changes to your app!

## How to add HMR + HDR to your Remix app

🚨 HMR + HDR support relies on the new dev server, which is currently unstable 🚨

We're confident in our technical approach but may change the API for the new dev server before it stabilizes.
To help us stabilize the new dev server more quickly, [please report any bugs you encounter in GitHub][issues]

---

🚨 The Remix App Server is not currently compatible with HMR + HDR 🚨

To check if you are using the Remix App Server see if you have `@remix-run/serve` installed or
if you call `remix-serve build` in your `package.json` scripts.

We're working on a bug fix for the Remix App Server so that it can play nicely with the new dev server.
In the meantime, you can use the example templates 👆 from the previous section to try things out.

---

1. Enable the new dev server

```js
// remix.config.js
{
  future: {
    unstable_dev: true,
    // see other configuration options here: https://github.com/remix-run/remix/releases/tag/remix%401.12.0
  }
}
```

2. Watch for server-side changes

If your `server.js` includes code for purging the `require` cache, you can skip this step.

Otherwise, install `nodemon` or similar[^node-watch] tool able to watch for file changes.

[^node-watch]:
    Any tool capable of running your app server and watching for changes to `build/` works here.
    For example, on Node v18 you can also use `node --watch`.

```sh
npm install -D nodemon
```

3. Update your `dev` script

Install `npm-run-all` or similar[^concurrently] to run the dev server and app server at the same time.

[^concurrently]: For example, you could use `concurrently` for this instead.

Then, in your `package.json` setup the `dev` scripts:

```json
{
  "scripts": {
    "dev": "run-p 'dev:*'",
    "dev:remix-dev": "NODE_ENV=development remix dev",
    "dev:remix-app": "NODE_ENV=development nodemon --watch build/ ./server.js"
  }
}
```

## Limitations

- Inherent limitations from React and React Refresh
  - React cannot track ambiguous component reordering unless you use a `key` prop
  - React loses state for components when hooks are added or removed (like `useLoaderData`)

## Known issues

- Fix bug in Remix App Server (`@remix-run/serve`/`remix-serve build`) that makes it incompatible with the new dev server
- Detect loader changes when a loader's _dependencies_ change
- Only revalidate subset of changed `loader`s for active route
  - Currently, any `loader` change on the active route triggers revalidation for _all_ loaders
- Pre-bundle app dependencies instead of separately chunking specific dependencies
- Remove HMR-only metadata (like loader hashes) in assets manifest sent to browser in development

[react-refresh]: https://github.com/facebook/react/issues/16604#issuecomment-528663101
[webpack]: https://webpack.js.org/concepts/hot-module-replacement/
[vite]: https://vitejs.dev/guide/features.html#hot-module-replacement
[issues]: https://github.com/remix-run/remix/issues
[express-template]: https://github.com/pcattori/remix-hmr-example
[cf-pages-template]: https://github.com/jacob-ebey/remix-cf-pages-template-hmr
