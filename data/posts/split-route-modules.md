---
title: Split Route Modules
summary: React Router v7.2's framework mode now supports automatic code splitting of route modules
date: 2025-02-27
image: /blog-images/headers/react-router-v7.jpg
ogImage: /blog-images/headers/react-router-v7.jpg
imageAlt: "The React Router logo"
imageDisableOverlay: true
authors:
  - Mark Dalgleish
---

With the release of [React Router v7.2.0](https://github.com/remix-run/react-router/releases/tag/react-router%407.2.0), we’ve introduced a new opt-in framework feature called Split Route Modules. In this post, we’ll explore the performance problem that Split Route Modules solves, how it works, and how to use it today.

## Route Modules

One of React Router’s defining features in framework mode is the [Route&nbsp;Module&nbsp;API](https://reactrouter.com/start/framework/route-module) which lets you define everything a route needs in a single file. While convenient, this API can sometimes come with a performance tradeoff.

Take, for example, the following route module:

```ts
import { MassiveComponent } from "~/components";

export async function clientLoader() {
  return await fetch("https://example.com/api").then(
    (response) => response.json()
  );
}

export default function Component({ loaderData }) {
  return <MassiveComponent data={loaderData} />;
}
```

Here we have a minimal `clientLoader` that makes a basic fetch call to an external API. The route component, on the other hand, is much larger.

Unfortunately, because these exports are both contained within the same module, the client loader has to wait for the rest of the route module to download before it can start running. If the client loader needs to perform an async operation, like hitting an external API, this delay can be felt by the user.

To visualize this as a timeline:

```
Get Route Module:  |--=======|
Run clientLoader:            |-----|
Render:                            |-|
```

The `clientLoader` is delayed from calling the external API since it has to wait for the hypothetical `MassiveComponent` to download. Since we can't render the component without the data from the client loader, the user has to wait for this network waterfall to complete before the page is rendered.

Ideally we’d like to be able to download the `clientLoader` export independently and run it as soon as it’s available:

```
Get clientLoader:  |--|
Get Component:     |=======|
Run clientLoader:     |-----|
Render:                     |-|
```

At a framework level, the easiest way for us to solve this would be to force you to author your route in multiple files (`route/clientLoader.ts`, `route/component.tsx`, etc.) — but we really didn't want to give up on the convenience of the Route Module API. The question is, how do we achieve this?

## Splitting the Route Module

What if the React Router Vite plugin could automatically split these route module exports into multiple smaller modules during the production build?

With the `future.unstable_splitRouteModules` flag enabled, this is exactly what happens.

Using our previous example, our singular route module would end up being split into two separate [virtual modules](https://vite.dev/guide/api-plugin#virtual-modules-convention) — one for the client loader and one for the component.

```ts
// route.tsx?route-chunk=clientLoader
export async function clientLoader() {
  return await fetch("https://example.com/api").then((response) =>
    response.json(),
  );
}
```

```ts
// route.tsx?route-chunk=main
import { MassiveComponent } from "~/components";

export default function Component({ loaderData }) {
  return <MassiveComponent data={loaderData} />;
}
```

Since these exports have now been split into separate modules, the React Router Vite plugin can ensure that they can be downloaded independently.

This optimization is even more pronounced when more of the Route Module API is used. For example, when using `clientLoader`, `clientAction` and `HydrateFallback`, the timeline for a single route module during a client-side navigation might look like this:

```
Get Route Module:     |--~~~++++=======|
Run clientLoader:                      |-----|
Render:                                      |-|
```

This would instead be optimized to the following:

```
Get clientLoader:     |--|
Get clientAction:     |~~~|
Get HydrateFallback:  SKIPPED
Get Component:        |=======|
Run clientLoader:        |-----|
Render:                        |-|
```

This looks much better! As before, the client loader doesn't need to wait for the component to download — and now it doesn't need to wait for the `clientAction` or `HydrateFallback` exports to download either. In fact, it doesn't even need to download the `HydrateFallback` export at all during client navigations since it's only ever used on the initial page load.

## Try it out

This feature will be enabled by default in a future release, but you can try it out today by setting the `future.unstable_splitRouteModules` flag in your React Router config:

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    unstable_splitRouteModules: true,
  },
} satisfies Config;
```

If your project is especially performance sensitive, you can set `future.unstable_splitRouteModules` to `"enforce"`. This will break the build if any route module cannot be split.

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    unstable_splitRouteModules: "enforce",
  },
} satisfies Config;
```

As always, we'd love to hear your feedback. If you run into any problems or have any suggestions for improvements, please [file an issue](https://github.com/remix-run/react-router/issues) or [start a discussion](https://github.com/remix-run/react-router/discussions).
