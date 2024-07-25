---
title: Fog of War
summary: "Introducing Fog of War: infinitely scalable Remix and React Router applications"
featured: false
date: 2024-07-10
image: /blog-images/headers/fog-of-war.png
ogImage: /blog-images/headers/fog-of-war.png
imageAlt: Fog of War
imageDisableOverlay: true
authors:
  - Matt Brophy
---

Remix is designed to make your application performant by default. Our latest feature, [Fog of War][remix-fog-of-war][^1] (a.k.a. "Lazy Route Discovery")[^2], helps your application stay performant no matter how large it grows.

[^1]: The Fog of War feature was released behind an `unstable` flag in Remix [v2.10][remix-2-10] for early beta testing—we hope to stabilize it in an upcoming release
[^2]: This was released behind the `future.unstable_fogOFWar` flag in v2.10, but the flag was renamed to `future.unstable_lazyRouteDiscovery` in v2.11. We found that without the context behind "Fog of War" we discuss in this post, the flag naming could be a bit confusing 🙂.

## How Remix Makes Fetch(es) Happen

Remix has primarily been a compiler and server-runtime on top of React Router aimed at giving you the idiomatic and performant way we would have written a React Router SSR app. Could you build your own React Router SSR application without using Remix? Absolutely! However, to get the same kind of performance optimizations, you'd very likely end up writing your own compiler and server-runtime, mimicking a lot of the optimizations Remix has built-in.

Most of Remix's optimizations share a common goal of eliminating network waterfalls.

In order to avoid "render then fetch" waterfalls, Remix [decouples rendering from fetching][when-to-fetch] (see also: [Remixing React Router][remixing-rr]). In order to do this, Remix needs to know your route tree up front so it can kick off the data fetches and download the route modules in parallel whenever a link is clicked. This results in the inverted and more performant approach of "fetch then render" (or "fetch while render" if you're [streaming data][streaming]).

In a "render then fetch" world, your application downloads the route implementation, then kicks off the data fetches while rendering the component—causing a waterfall:

<img alt="Render then Fetch network diagram" src="/blog-images/posts/fog-of-war/render-then-fetch.png" class="m-auto w-4/5 border rounded-md shadow" />

With "fetch then render", the module fetch and data fetch can be parallelized:

<img alt="Fetch then Render network diagram" src="/blog-images/posts/fog-of-war/fetch-then-render.png" class="m-auto w-4/5 border rounded-md shadow" />

You can take this one step further in Remix via [`<Link prefetch>`][link-prefetch], which allows you to prefetch the route data and components before a user even clicks a link. That way, when the link is clicked the navigation can be instantaneous:

<img alt="Prefetching network diagram" src="/blog-images/posts/fog-of-war/prefetch.png" class="m-auto w-4/5 border rounded-md shadow" />

## The Route Manifest

First of all, let's define a few important terms for clarity:

- **Route tree**: A tree of routes which defines the URLs your app can match via parent/child relationships
- **Route definition**: Parts of the route used to match a URL (`path`, `index`, `children`)
- **Route implementation**: Parts of the route used to load data and render the UI (`loader`, `Component`, `ErrorBoundary`, etc.)

In order to implement optimizations mentioned in the previous section, Remix needs to know all of your route _definitions_ in the client so that it can match routes based on nothing more than a `<Link to>`. Once a link is clicked and routes are matched, Remix can fetch data and download the route _implementations_ in parallel.

To do this, Remix ships a **Route Manifest** to the client that contains all of your route definitions plus a small amount of metadata. This manifest allows Remix to build a client-side route tree without including the underlying route implementations. Those implementations are loaded via [route.lazy][route-lazy] when a route is navigated to.

Here's a sample route manifest entry for the root route on https://remix.run:

```json
"root": {
  "id": "root",
  "path": "",
  "hasAction": false,
  "hasLoader": true,
  "hasClientAction": false,
  "hasClientLoader": false,
  "hasErrorBoundary": true,
  "module": "/assets/root-x1zXK6d6.js",
  "imports": [
    "/assets/entry.client-uo5Ucqv5.js",
    "/assets/utils-c6MmN8mv.js",
    "/assets/color-scheme-y8FjcTs4.js",
    "/assets/icons-6-7TeyZS.js"
  ],
  "css": [
    "/assets/root-Wq_jPy7B.css"
  ]
}
```

Over time, as the user navigates around—more and more route implementations are downloaded via `route.lazy` and the route tree becomes more and more complete.

This approach works for most applications - since the manifest is pretty lightweight and compresses well since it's a repetitive key/value JSON structure. For example, the manifest for https://remix.run/ contains 50 routes, weighs 19.6Kb uncompressed, but only sends 2.6Kb over the wire after compression.

However, Remix doesn't only want to to provide good performance for small-to-medium sized applications—we want _large_ and _extremely large_ applications to be fast by default too! Because we love dog-fooding React Router and Remix on the myriad of applications at Shopify, both internal and public-facing, we knew our current strategy was not cutting it for those larger applications.

As we began rolling out Remix to https://www.shopify.com, we realized _just how big_ that site is. When you take into account all of the routes and their internationalized URLs (i.e., `/pricing`, `/en/pricing`, `/es/precios` and many more)—the app had over 1300 routes! And because Remix doesn't have a good solution for URL aliasing (yet!), many of the route entries were duplicates pointing to the same route module, and thus duplicating the module information (its path, its other module `imports`, etc.). This resulted in a manifest that was ~85Kb compressed, and ~10Mb uncompressed. On slower devices, this could have a noticeable impact on page load times for the device to decompress, parse, compile, and execute the JS module.

## Fog of War

At Remix, we're big fans of the Retro vibes of our younger years: from old school web development using HTML `<form>` elements and HTTP `POST` requests, to '90s music, to retro video games with [ever expanding maps][wikipedia-fog-of-war]. These expanding game maps provided the inspiration for (at the very least) the name of our solution to this problem of ever-growing route manifests.

A Remix route tree is not so different from a map in a video game. In a game, the map may be huge, but the player doesn't start with the ability to see the entire map. They start with only the initial portion of the map exposed. As they move around, more and more of the map loads in.

Why can't the Remix manifest work this way? Why can't we just load only the matched initial routes on SSR and fill them in as the user navigates around? Well the simple answer is: it can and it did. Sort of.

Prior to v1.0, Remix actually worked this way! Only the initial routes were included during SSR, and then when a link was clicked we would make a request to the server to get the new routes and fetch the data and route modules. It looked something like:

<img alt="Remix v0 network diagram" src="/blog-images/posts/fog-of-war/v0.png" class="m-auto w-4/5 border rounded-md shadow" />

But, as you can see, that approach leads to a network waterfall—and we hate those! It also means we can't implement `<Link prefetch>` anymore because we don't even have the routes to match, let alone their metadata for fetching data and modules.

So for Remix 1.0 the full manifest was shipped to eliminate waterfalls and allow link prefetching. The "partial manifest" optimization was left for another day - and that day finally came in Remix [v2.10][remix-2-10] with the release of the `future.unstable_fogOfWar` flag (renamed to `future.unstable_lazyRouteDiscovery` in [v2.11][remix-2-11])[^2].

## Eager Route Discovery

The key to implementing this in Remix without introducing network waterfalls and without sacrificing optimizations such as `<Link prefetch>` was, ironically, the `<Link prefetch>` approach itself. Just like we can perform eager fetching of destination route data and modules _before the link is actually clicked_, we can also perform eager _discovery_ of destination routes before a link is clicked.

Consider the above diagram, with the discovery aspect done eagerly:

<img alt="Fog of War network diagram with eager discovery" src="/blog-images/posts/fog-of-war/fow-eager.png" class="m-auto w-4/5 border rounded-md shadow" />

Instead of waiting for a link to be clicked to discover routes, we can eagerly do this based on which links are rendered, since links represent the potential paths the user could go to next. Remix batches up all rendered links and makes a single `fetch` call to the Remix server to get back the routes required by that set of links. If we do this as soon as those links are rendered, then it's highly likely those routes will be discovered and added to the route tree before the user has had time to find and click their chosen link. If we patch these in before a link is clicked, then the Remix behavior won't have changed _at all_—even though we're shipping only the matched routes on initial load.

If we combine this eager discovery with the `<Link prefetch>` optimization above, we can still achieve instantaneous navigation!

<img alt="Fog of War network diagram with eager discovery" src="/blog-images/posts/fog-of-war/fow-eager-prefetch.png" class="m-auto w-4/5 border rounded-md shadow" />

It's also worth noting that because this is all just an optimization, the application works fine without it—just a bit slower because of the network waterfall. So if a user _does_ click that link within the short amount of time it takes to patch the manifest, then that link navigation will encounter the waterfall. This is like `<Link prefetch>` where if the prefetch doesn't complete in time, the fetch happens on click and the user sees a spinner during the navigation. It's also worth noting that a route only has to be discovered once per session. Subsequent navigations to the same route won't require a discovery step.

## Visual Explanation

Let's take a step back and see how this looks from a more visual "route tree" standpoint. Let's look at the current state" of Remix today, where the full manifest is shipped on initial load.

In the below route tree, the red dots represent the actively rendered route, and the white area is the route manifest, which contains all possible routes:

<img alt="Route tree showing the entire manifest without Fog of War enabled" src="/blog-images/posts/fog-of-war/tree-1.png" class="m-auto w-4/5 border rounded-md shadow" />

Now, if we enable Fog of War, we'll only ship the active routes in the manifest on initial load:

<img alt="Route tree showing the initial manifest with Fog of War enabled" src="/blog-images/posts/fog-of-war/tree-2.png" class="m-auto w-4/5 border rounded-md shadow" />

As we hydrate (render) the UI client side, we'll encounter a handful of links to other routes that are currently unknown to the manifest:

<img alt="Route tree showing destination links rendered on the current page" src="/blog-images/posts/fog-of-war/tree-3.png" class="m-auto w-4/5 border rounded-md shadow" />

Remix will discover those routes via a `fetch` call to the Remix server and patch them into the manifest:

<img alt="Route tree with expanded manifest including destination links" src="/blog-images/posts/fog-of-war/tree-4.png" class="m-auto w-4/5 border rounded-md shadow" />

As you can see - this type of "discovery" allows for the route manifest to start small and grow with the user's path through the app, thus allowing your app to scale to any number of routes without incurring a performance hit on the app's initial load.

As mentioned earlier, we've been dog-fooding this on https://shopify.com and we're loving the results. Prior to Fog of War, their route manifest contained **1300 routes** and weighted over **10MB uncompressed**. Once Fog of War was enabled, their initial homepage manifest dropped to just **3 routes** and **1.9Kb uncompressed**.

We've also deployed this to https://remix.run, dropping the uncompressed size of the initial manifest from **~20Kb** to **~4Kb**.

## React Router Implementation

As with most routing features in Remix, it's all React Router under the hood. Fog of War is made possible by a new [`unstable_patchRoutesOnMiss`][rr-patch-routes-on-miss] API. This API allows you to provide an implementation to add new routes to the route tree anytime React Router is unable to match a path in the current route tree. You can implement any async logic you want in this method to discover the appropriate routes and patch them into the current tree at any location you need.

```js
const router = createBrowserRouter(
  [
    {
      id: "root",
      path: "/",
      Component: RootComponent,
    },
  ],
  {
    async unstable_patchRoutesOnMiss({ path, patch }) {
      if (path === "/a") {
        let route = await getARoute(); // { path: 'a', Component: A }
        // Patch the `a` route into the tree as a child of the `root` route
        patch("root", [route]);
      }
    },
  },
);
```

You can expand on this async logic and move towards a manifest-like approach, not too different from what Remix uses, but without the server-aspect:

```js
// Manifest mapping route prefixes to sub-app implementations
let manifest = {
  "/account": () => import("./account"),
  "/dashboard": () => import("./dashboard"),
};

let router = createBrowserRouter(
  [
    {
      path: "/",
      Component: Home,
    },
  ],
  {
    async unstable_patchRoutesOnMiss({ path, patch }) {
      let prefix = Object.keys(manifest).find((p) => path.startsWith(p));
      if (prefix) {
        let children = await manifest[prefix]();
        patch(null, children);
      }
    },
  },
);
```

This ability to implement async logic also lends itself very well to Micro Frontend and Module Federation architectures in React Router, since you now have an async insertion point to load sub-portions of your application.

We'd also like to give a huge shout-out to [Shane Walker][twitter-swalker326] for working with us during the initial release to put together a [great example][rr-mf-example] of using this new API in a federated `rsbuild` React Router application. Make sure to give it a look if you're interested in using Module Federation in your React Router app!

[rr-patch-routes-on-miss]: https://reactrouter.com/en/main/routers/create-browser-router#optsunstable_patchroutesonmiss
[remix-fog-of-war]: https://remix.run/docs/en/main/guides/fog-of-war
[when-to-fetch]: https://www.youtube.com/watch?v=95B8mnhzoCM
[remixing-rr]: https://remix.run/blog/remixing-react-router
[streaming]: https://remix.run/docs/en/main/guides/streaming
[link-prefetch]: https://remix.run/docs/en/main/components/link#prefetch
[route-lazy]: https://reactrouter.com/en/main/route/lazy
[wikipedia-fog-of-war]: https://en.wikipedia.org/wiki/Fog_of_war
[remix-2-10]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v2100
[remix-2-11]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v2110
[twitter-swalker326]: https://twitter.com/swalker326
[rr-mf-example]: https://github.com/swalker326/react-router-fog-of-war-example/
