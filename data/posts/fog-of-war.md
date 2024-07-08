---
title: Fog of War
summary: The Fog of War concept in Remix and React Router provides infinite scalability for your applications
featured: false
date: 2024-07-10
image: /blog-images/headers/react-router-v6.3.0.jpg
imageAlt: Fog of War
authors:
  - Matt Brophy
---

Remix is built to ensure your applications are performant by default. With [Fog of War][remix-fog-of-war][^1], we're ensuring this is the case no matter the size of your application.

[^1]: The Fog of War feature was released behind an unstable flag in Remix [v2.10][remix-2-10] for early beta testing - we hope to stabilize it in an upcoming release.

## Background

Remix has always been mostly a compiler and server-runtime on top of React Router aimed at giving you the idiomatic and performant way we'd have written a React Router SSR app. Could you build your own React Router SSR application without using Remix? Absolutely! However, to get the same kind of performance optimizations, you'd very likely end up writing your own compiler and server-runtime.

Most of these Remix optimizations share a common goal of eliminating network waterfalls.

In order to avoid "render then fetch" waterfalls, Remix [decouples rendering from fetching][when-to-fetch] (also see the [Remixing React Router][remixing-rr] post). In order to do this, Remix needs to know your route tree up front so that when a link is clicked - it can immediately kick off the data fetches for all matching routes in parallel with downloading the route component implementations. This results in the opposite approach of "fetch then render" (or "fetch while render" if you're [streaming data][streaming]). In a "render then fetch" world, Remix would need to first download the route implementation, then render which would kick off the data fetches - causing a waterfall.

TODO: Replace with excalidraw?

```txt
# Render then Fetch
Click /blog link
                |- Fetch <Blog> ->
                                  |- Render <Blog> ->
                                                    |- Fetch blog.json ->
                                                                         |-- Render <Blog>

# Fetch Then Render
Click /blog link
                |- Fetch <Blog> ->
                |- Fetch blog.json ->
                                     |- Render <Blog>
```

Another optimization Remix implements is [`<Link prefetch>`][link-prefetch] which allows you to prefetch the route data and components before a user even clicks a link, so that when the link is clicked the navigation can be instantaneous.

## The Route Manifest

In order to implement both of these optimizations, Remix needs to know your applications entire route tree in the client so that it can match routes based on nothing more than an `<a href>`. Once the matched routes are known for a given path, Remix can download the route modules and make the data fetches in parallel. To do this, Remix ships a **Route Manifest** to the client that contains all of your routes and a small amount of metadata for them (i.e., does it have a server `loader`/`action`? What is it's client module path?), but not the actual route module code (i.e., `Component`, `ErrorBoundary`, `clientLoader`, etc.). This manifest allows Remix to build a complete client-side tree of route _definitions_ (`path`, `index`, `children`), without including the underlying route implementations (`Component`, `ErrorBoundary`) which are loaded via [route.lazy][route-lazy]) when a route is navigated to.

Over time, as the user navigates around - more and more route _implementations_ are downloaded and the route tree becomes more and more complete (effectively replacing `route.lazy` with the actual implementations).

This approach works for most applications - since the manifest is pretty lightweight and compresses very well since it's a very repetitive key/value JSON structure. For example, the manifest for https://remix.run/ contains 50 routes, weighs 19.6Kb, but only sends 2.6Kb over the wire after compression.

However, Remix doesn't only want to to provide good performance for small-to-medium sized applications - we want _large_ and _extremely large_ applications to be fast by default too! Thankfully, we love dog-fooding React Router and Remix on the myriad of applications at Shopify, both internal and public-facing. As we began rolling out Remix to https://www.shopify.com we realized _just how big_ that site is. when you take into account all of the routes, and their internationalized URLs (i.e., `/pricing`, `/en/pricing`, `/es/precios` and many more) - the app had over 1300 routes. And because Remix doesn't have a good solution for URL aliasing (yet!), many of the route entries were duplicates pointing to the same route module - and thus duplicating the module, it's path, all of it's other module `imports`, etc. This resulted in a manifest that was over 8Mb uncompressed, and over 100Kb compressed (TODO: Confirm this numbers). On slower devices, this could have a noticeable impact on page load times for the deice to decompress the JS module and then parsed/compiled/executed.

## Fog of War

At Remix, we're big fans of the Retro vibes of our younger years - from old school web development using HTML `<form>` elements and HTTP `POST` requests, to 90's music, to retro video games with [ever expanding maps][wikipedia-fog-of-war]. These expanding game maps provided the inspiration for (at the very least) the name of our solution to this problem of ever-growing route manifests.

TODO: Insert image of video game fog of war

A Remix route tree us not so different from a map in a video game. In a game, the map may be huge, but the player doesn't start with the ability to see the entire map. They start with only the initial portion of the map exposed -and as they move around more and more of the map loads in.
Why can't the Remix manifest work this way? Why can't we just load only ythe matched initial routes on SSr and fill them in as the user navigates around? Well the simple answer is - we can and we did. Sort of.

Prior to v1.0, Remix actually worked this way. Only the initial routes were included on SSR, and then when a link was clicked, we made a request to the server to get the new routes, and then we fetched the data and route modules for the new routes. This looked something like:

```txt
Click /link
           |-- discover new routes -->
                                      |-- load data -->
                                      |-- load module -->
                                                         | render /link

```

As you can see, that approach leads to a network waterfall - and Remix hates those! It also means we can't implement `<Link prefetch>` anymore because we don't even have the routes to match, let alone their metadata for fetching data and modules.

So for Remix 1.0 the full manifest was shipped to eliminate waterfalls and allow link prefetching. The "partial manifest" optimization was left for another day - and that day finally came in Remix [v2.10][remix-2-10] with the release of the `future.unstable_fogOfWar` flag.

## Eager Route Discovery

The key to implementing this in Remix without introducing network waterfalls and without sacrificing optimizations such as `<Link prefetch>` was actually `<Link prefetch>` itself. Just like we can perform eager fetching of destination route data and modules _before the link is actually clicked_, we can also perform eager _discovery_ of destination routes before a link is clicked.

Consider the above diagram, with the discovery aspect done eagerly:

```txt
Render /link
            |-- discover new routes -->
...
Click /link
           |-- load data -->
           |-- load module -->
                              | render /link
```

Instead of waiting for a link to be clicked to decide to discover the routes for the link - we can look at all links rendered on the page and send a single `fetch` to the Remix server for all route definitions required to match the current set of links. If we do this as oon as those links are rendered, then it's highly likely those routes will be discovered and added to the route tree before the user has had time to find and c lick their chosen link. And so long as we can patch these in before that - Then the Remix behavior won't have changed _at all_ - even though we're shipping only the matched routes on initial load.

Also, it's worth noting that because this is all just an optimization, the application works fine without it - just maybe a bit slower because of the network waterfalls. So if a user _does_ click that link within the ~100ms it takes to patch it into the manifest, then that link navigation will encounter the waterfall. But, now that the route has been patched into the tree - that route can be matched/fetched instantly for any subsequent navigations to the same route for the rest of the user session. This is like like `<Link prefetch>` where if the prefetch doesn't complete in time, the fetch happens on click and the user sees a spinner during the navigation.

## Visual Explanation

Lets take a step back and see how this looks from a more visual "route tree" standpoint:

TODO: Bullets for now - work with Tim to get diagrams integrated
TODO: Do we want to attach URLs to the diagram or remain high level?

- Let's assume we have a large route tree and we start at a given URL
  - Image: Route tree with 3 initial red dots
- Remix SSR will only include the manifest for those initially matched routes
  - Image: Add gray area (manifest) around those 3 red dots
- Upon render, let's say we have these links on the page
  - Image: Make a few dots blue (?) as rendered link destinations
- Remix will detect these links and ask the Remix server for the corresponding route definitions
- These are then patched into the Route manifest, thus expanding the "visible" area of the route tree
  - Image: Expand grey area to include route branches for all blue dots

As you can see - this type of "discovery" allows for the route manifest to start small and grow with the user's path through the app, thus allowing your app to scale to any number of routes without incurring a performance hit on app load.

## React Router Implementation

- TODO:
  - Show full route tree
  - Introduce [patchRoutesOnMiss][rr-patch-routes-on-miss]
  - Mention applications for MFE and MF

[rr-patch-routes-on-miss]: https://reactrouter.com/en/main/routers/create-browser-router#optsunstable_patchroutesonmiss
[remix-fog-of-war]: https://remix.run/docs/en/main/guides/fog-of-war
[when-to-fetch]: https://www.youtube.com/watch?v=95B8mnhzoCM
[remixing-rr]: https://remix.run/blog/remixing-react-router
[streaming]: https://remix.run/docs/en/main/guides/streaming
[link-prefetch]: https://remix.run/docs/en/main/components/link#prefetch
[route-lazy]: https://reactrouter.com/en/main/route/lazy
[wikipedia-fog-of-war]: https://en.wikipedia.org/wiki/Fog_of_war
[remix-2-10]: https://github.com/remix-run/remix/blob/main/CHANGELOG.md#v2100
