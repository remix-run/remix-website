---
title: Faster Lazy Loading in React Router v7.5+
summary: React Router v7.5 now supports a faster, more granular approach to lazy loading route code in Data Mode
date: 2025-04-17
image: /blog-images/headers/faster-lazy-loading.jpg
ogImage: /blog-images/headers/faster-lazy-loading.jpg
imageAlt: "A close-up of a abstract stylized colored tubes"
imageDisableOverlay: true
authors:
  - Mark Dalgleish
---

<!-- Diagrams, exported as PNG @ 2x scale: https://excalidraw.com/#json=vlUxqYtuQD20IjsupqbRx,f_SWu-qs-A_0ea0JS2rBGw -->

With the release of [React Router v7.5](https://reactrouter.com/changelog#v750), we’ve introduced a more granular way to lazy load route code in [Data Mode](https://reactrouter.com/start/modes). This new API is specifically designed to support the upcoming middleware API, but it also allows for some additional performance optimizations across the board.

This post will look at React Router’s pre-existing approach to lazy loading routes, explain its limitations and the challenges it presented for middleware, and show how our new approach allows for much better lazy loading performance.

## Background

In [React Router v6.4](https://reactrouter.com/changelog#v640), we introduced support for [lazy loading of routes](/blog/lazy-loading-routes) via an async `route.lazy()` function. Most commonly this was used to dynamically import a route module, for example:

```tsx
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "projects",
        lazy: () => import("./projects"), // 💤 Lazy load!
        children: [
          {
            path: ":projectId",
            lazy: () => import("./project"), // 💤 Lazy load!
          },
        ],
      },
    ],
  },
];
```

Since each `route.lazy()` function is returning the result of a dynamic import, the imported modules need to provide route properties as exports:

```tsx
// projects.tsx
export async function loader() {
  /* ... */
}

export default function Component() {
  /* ... */
}
```

When clicking a link to a new route, each matching route’s lazy function would be invoked before calling loaders. Visualized in a timeline, it looks like this:

<img alt="Waterfall diagram showing `Click /projects/123` with a row for the matching routes of `projects` and `:projectId`, with each matching route’s `route.lazy()` function being called in parallel followed by calling its loader, with each route being handled in parallel" src="/blog-images/posts/faster-lazy-loading/lazy-with-loaders.png" class="m-auto sm:w-4/5 lg:w-full border sm:p-3 rounded-md shadow" />

With this `route.lazy()` API, we were able to provide a nice, simple way to split route code out of the main bundle and only load it when needed.

## How middleware challenged our approach

As we were working on the upcoming middleware API, we realized that our approach to lazy loading had a critical limitation.

Up to this point, lazy routes could be loaded in parallel with their loaders/actions used as soon as they’re available. However, middleware is completely different. Middleware doesn’t just affect the route it’s defined on — it affects all of its descendant routes too. This means that we need to know whether any of the matched routes contain middleware before we can call any loaders or actions.

If we were to continue using the existing `route.lazy()` API with middleware, we wouldn’t be able to start executing middleware until every single `lazy` function for all matching routes had been resolved:

<img alt="Waterfall diagram showing `Click /projects/123` with a row for the matching routes of `projects` and `:projectId`, with each matching route’s `route.lazy()` function being called in parallel, followed by the first route’s middleware being called once all `route.lazy()` functions have resolved, followed by all routes loaders being called in parallel" src="/blog-images/posts/faster-lazy-loading/lazy-with-loaders-and-middleware.png" class="m-auto sm:w-4/5 lg:w-full border sm:p-3 rounded-md shadow" />

To make matters worse, you’d have to pay this performance penalty even if you weren’t using any middleware at all. It’s entirely possible to wait for all `route.lazy()` functions to resolve only to discover that none of the matching routes even have middleware.

<img alt="Waterfall diagram showing `Click /projects/123` with a row for the matching routes of `projects` and `:projectId`, with each matching route’s `route.lazy()` function being called in parallel, followed by all route loaders being called in parallel once all `route.lazy()` functions have resolved" src="/blog-images/posts/faster-lazy-loading/lazy-with-loaders-without-middleware.png" class="m-auto sm:w-4/5 lg:w-full border sm:p-3 rounded-md shadow" />

In the example above, all loaders were delayed unnecessarily, waiting on some potential lazy middleware that ultimately wasn’t there.

This problem meant that the existing `route.lazy()` API couldn’t support middleware without seriously degrading performance for all consumers, whether or not they’re using middleware. We needed to find a better approach.

## The new granular lazy loading API

To address this, React Router v7.5 introduces a more granular, object-based `route.lazy` API that allows you to lazy load individual route properties rather than having to load them all at once.

Instead of a single `route.lazy()` function, you can now define a `lazy` object with an async function for each property.

```tsx
// Before
const route = {
  lazy: () => import("./projects"),
};

// After
const route = {
  lazy: {
    loader: async () => {
      return (await import("./projects")).loader;
    },
    Component: async () => {
      return (await import("./projects")).Component;
    },
  },
};
```

With this level of granularity, you’re also now able to split the code for lazy-loaded route properties into separate files:

```ts
const route = {
  lazy: {
    loader: async () => {
      return (await import("./projects/loader")).loader;
    },
    Component: async () => {
      return (await import("./projects/component")).Component;
    },
  },
};
```

This API gives us a couple of major benefits.

First, we now know up front whether any of the matched routes contain lazy-loaded middleware.

Note that, for this to be the case, we’ve also had to limit the existing `route.lazy()` API so that it can’t be used to lazy load middleware. If you want to lazy load middleware, you _must_ use the new granular lazy loading API.

Additionally, since you can now split the code for lazy-loaded route properties into separate files, we can ensure that we’re only waiting on the minimum amount of code needed for each step of a navigation. For middleware, this means that we’re only waiting on `route.lazy.unstable_middleware()` to resolve before executing it.

If we modify our earlier example to take advantage of the new granular `route.lazy` API, it looks like this:

```tsx
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "projects",
        lazy: {
          unstable_middleware: async () => {
            return (await import("./projects/middleware")).middleware;
          },
          loader: async () => {
            return (await import("./projects/loader")).loader;
          },
          Component: async () => {
            return (await import("./projects/component")).Component;
          },
        },
        children: [
          {
            path: ":projectId",
            lazy: {
              loader: async () => {
                return (await import("./project/loader")).loader;
              },
              Component: async () => {
                return (await import("./project/component")).Component;
              },
            },
          },
        ],
      },
    ],
  },
];
```

To visualize this on a timeline:

<img alt="Waterfall diagram showing `Click /projects/123` with a row for the matching routes of `projects` and `:projectId`, with each matching route’s `route.lazy.middleware()`, `route.lazy.loader()`, and `route.lazy.Component()` functions being called in parallel. The lazy middleware is only present for the first route, and the middleware is called as soon as `route.lazy.middleware()` resolves. Once the middleware has finished being called, the route loaders are called in parallel." src="/blog-images/posts/faster-lazy-loading/granular-lazy-routes.png" class="m-auto sm:w-4/5 lg:w-full border sm:p-3 rounded-md shadow" />

Now we’re only waiting on a single `route.lazy.unstable_middleware()` function to resolve during the middleware phase, executing it as soon as it’s available. Meanwhile, we’re also downloading the lazy `loader` and `Component` route properties in parallel.

## Further optimizations

This API was initially introduced to support lazy loading of middleware. However, we quickly realized that it allowed for some additional performance improvements.

When executing loaders/actions, we only need to wait for `route.lazy.loader()` or `route.lazy.action()` to resolve before calling them, whereas previously we had to wait for _all_ lazy-loaded properties to load.

We also skip `route.lazy.HydrateFallback()` / `hydrateFallbackElement()` when navigating client-side. If you author the code for these properties in separate files, you can avoid downloading the `HydrateFallback` entirely since it’s only used for the initial page load. Note that this specific optimization is available in React Router v7.5.1+.

Both of these optimizations allow you to get similar runtime performance to Framework Mode’s [Split Route Modules](./split-route-modules) feature, but since you’re in Data Mode, you now have more control over the file structure.

## Try it out

If you’re a Framework Mode consumer on React Router v7.5+, your app is already using the new granular lazy loading API under the hood.

If you’re a Data Mode consumer using the existing `route.lazy()` API, you might want to consider updating to the new granular lazy loading API and splitting your loader/action and `Component` / `HydrateFallback` code out into separate files. How you choose to split your code is up to you, and this new API provides the flexibility needed to get the best loading performance for your app.

We’re excited to see what you build with this new API ❤️
