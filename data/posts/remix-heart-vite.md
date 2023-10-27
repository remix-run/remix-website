---
title: Remix ❤️  Vite
summary: Today we're announcing that unstable support for Vite is available in Remix v2.2.0!
date: 2023-10-30
image: /blog-images/headers/remix_heart_vite.png
imageAlt: "Remix loves Vite"
authors:
  - Pedro Cattori
  - Mark Dalgleish
---

// TODO: link to docs
// TODO: link to known limitations / issues

Today we're excited to announce that unstable support for Vite is available in Remix v.2.2.0!
Now you can get all the benefits of Vite's lightning fast DX ⚡️ out-of-the-box when using Remix.

Try it out now:

```shellscript
npx create-remix@latest --template remix-run/remix/templates/unstable-vite
```

So how fast is _lightning fast_ ⚡️? Well, we did some quick testing on the [Indie Stack][indie-stack] with a M1 Max MacBook Pro and here's what we found:

> 10x faster HMR 🔥
> 5x faster [HDR][hdr] 🔥

But we didn't switch to Vite just for the speed. Unlike traditional build tools, [**Vite is specifically designed for building frameworks**][building-frameworks].

In fact, with Vite, Remix is no longer a compiler. **Remix itself is just a Vite plugin**:

```ts
// vite.config.ts
import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
});
```

You'll also get acess to the entire ecosystem of Vite plugins.
This lets us focus on making the core of Remix the best that it can be while Vite plugins handle the rest.
Want to use MDX? There's a [Vite plugin][plugin-mdx] for that.
Want to import SVGs as React components? [Vite plugin][plugin-svg]
Prefer to use Vanilla Extract? [Vite plugin][plugin-vanilla-extract]
Using `tsconfig` path aliases? [Vite plugin][plugin-path-alias]

Here are even more benefits you'll get when using the Remix Vite plugin:

- **Near-instant dev startup.** Vite lazily compiles your app code on-demand, so the dev server can boot immediately.
- **Pre-bundled dependencies.** Vite only processes dependencies once, so large libraries like Material UI and AntD don't become bottlenecks for rebuilds nor hot updates.
- **Incremental hot updates.** Vite keeps track of dependencies so it only needs to reprocess app code that depends on the changes.
- **Greatly reduced memory usage.** Vite understands `import` statements and can invalidate stale modules on the server efficiently without relying on memory-hungry tricks to bypass the `import` cache. This should eliminate existing out-of-memory errors during development.
- **Automatic route-based CSS splitting.** Vite's CSS splitting only loads the styles needed for the current page.
- **Better browser state preservation during HMR.** Vite's built-in HMR runtime and error overlay ensure that browser state stays intact even in the presence of server errors.
- **Automatic hot server updates.** Code changes that affect the server are immediately reflected in your running server without restarting and without any [`global` tricks][global-tricks]
- **ESM & CJS interop.** You author ESM, Vite outputs ESM. Your dependencies can be ESM or CJS. Vite handles the rest.
- **TypeScript for all your files.** No more `.js` or `.mjs` files needed at the root of your project. Use `vite.config.ts` and even run your custom server via `tsx server.ts` or `node --loader tsm server.ts`.
- **Workspaces.** Improved workspace compatibility for monorepos. Use with any package manager supported by Vite: `npm`, `yarn`, `pnpm`, etc.
- **Browser compatibility targets.** Use Vite's [`build.target`][build-target] or grab a [plugin for browserslist support][plugin-browserslist].

## Why now?

Let's start at the beginning.
Why didn't Remix start off using Vite?
The short answer is that a stable release of Vite didn't exist yet!

Remix development began in [July 2020][july-2020], but [Vite's first stable release][vite-stable] wasn't until [February 2021][february-2021].
Even then, there were three blockers for adopting Vite:

1. Stable SSR support
2. Non-Node runtime support (Deno, CloudFlare)
3. Server-aware, fullstack HMR

In the meantime, the Remix compiler switched from Rollup to esbuild in [March 2021][march-2021]

[indie-stack]: https://github.com/remix-run/indie-stack
[hdr]: https://www.youtube.com/watch?v=2c2OeqOX72s
[building-frameworks]: https://vitejs.dev/guide/philosophy.html#building-frameworks-on-top-of-vite
[plugin-mdx]: https://mdxjs.com/packages/rollup/
[plugin-svg]: https://github.com/pd4d10/vite-plugin-svgr
[plugin-vanilla-extract]: https://vanilla-extract.style/documentation/integrations/vite/
[plugin-path-alias]: https://github.com/aleclarson/vite-tsconfig-paths
[global-tricks]: https://remix.run/docs/en/main/guides/manual-mode#keeping-in-memory-server-state-across-rebuilds
[build-target]: https://vitejs.dev/config/build-options.html#build-target
[plugin-browserslist]: https://github.com/marcofugaro/browserslist-to-esbuild
[july-2020]: https://github.com/remix-run/remix/commit/4f03decc88a3b3a27ca08ee02750b5dbb6ff1542
[vite-stable]: https://github.com/vitejs/vite/issues/1207
[february-2021]: https://github.com/vitejs/vite/blob/v2.0.5/packages/vite/CHANGELOG.md
[march-2021]: https://github.com/remix-run/remix/commit/d87b60c1a52e4bb39d0fde6b0fe218d3cf6c7af2
