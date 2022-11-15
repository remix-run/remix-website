---
title: Migrate from Webpack to Remix
summary: Apps that depend on Webpack loaders and plugins weren't able to incrementally migrate to Remix. Until now!
date: 2022-11-15
# TODO image, imageAlt
image: /remix-v1.jpg
imageAlt: "The Remix logo"
authors:
  - Pedro Cattori
---

Previously, we'd written a [guide for migrating your React Router apps to Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app).
But apps that depend on Webpack loaders and plugins weren't able to incrementally migrate to Remix.
That includes tons of existing React Router apps using [Create React App](https://create-react-app.dev/).

## Example: Migrating a CRA app

For example, let's say your CRA app uses a specific CSS solution like [CSS Modules](https://github.com/css-modules/css-modules) or [Styled Components](https://styled-components.com/).
Either you are relying on CRA's built-in Webpack config to wire up the necessary loaders or you've ejected and wired up some loaders yourself.
In either case, you'd run into errors when trying to incrementally migrate to Remix.

I'm using CSS libraries as an example, but the same goes for any other Webpack loader you rely on.

For CSS specifically, we're always looking to improve our support for different CSS solutions in Remix, but there are nuances and trade-offs that we actively are working through.
In the meantime, we still want an incremental migration path to Remix for Webpack apps.

## Webpack-based Remix compiler

Today, we're excited to share a way for Webpack-based apps to incrementally migrate to Remix.
We've created a Webpack-based Remix compiler and dev server so that you can use all your Webpack loaders and plugins from day 1 of the migration.

To be clear, the Webpack-based Remix compiler is **designed solely for enabling incremental migrations to Remix**.

The idea is that you can get up and running on day one with the Webpack-based Remix compiler.
Then you can migrate each route in isolation.
As you do so, you can remove that route's dependence on Webpack loaders. 
That way, when you've migrated every route to Remix, you can switch over to the official Remix compiler and dev server.

If you aren't actively migrating away from Webpack, then we do not recommend that you use the Webpack-based Remix compiler.
The Webpack-based Remix compiler is not guaranteed to support all current and/or future Remix functionality.

## Demo repository + migration guide

To see this all in action, check out our [Remix + Webpack demo repository](https://github.com/pcattori/remix-webpack-demo).
You can find [instructions in the README](https://github.com/pcattori/remix-webpack-demo#setup) for running the demo app, but more importantly you can also find our [migration guide for Webpack apps](https://github.com/pcattori/remix-webpack-demo/blob/main/docs/migration-guide.md).

Remember that if you're app might not depend on any problematic Webpack loaders, so try doing the migration using the [standard migration guide](https://remix.run/docs/en/v1/guides/migrating-react-router-app) first if you aren't sure.
If you run into any issues when [replacing your bundler with Remix](https://remix.run/docs/en/v1/guides/migrating-react-router-app#replacing-the-bundler-with-remix), then you'll know that the Webpack migration guide is worth checking out.
