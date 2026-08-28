---
title: Remix 3 Release Candidate
summary: Remix 3 is ready for you to test, build with, and help us prepare for a stable release.
date: 2026-08-28
featured: true
authors:
  - Brooks Lybrand
image: /blog-images/headers/remix-3-release-candidate.png
ogImage: /blog-images/headers/remix-3-release-candidate.png
imageAlt: "A glowing blue race car driving down a dark racetrack beneath a starry sky."
imageDisableOverlay: true
---

Today we published the first release candidate for Remix 3.

The last time we shared updates about Remix 3 was when we announced our [beta preview][remix-3-beta-preview] 4 months ago. We're incredibly proud of what we've built and all the improvements we've made since our first beta, and we're excited to start sharing with you why exactly we think Remix is so awesome.

This post barely scratches the surface of everything we've packed into Remix 3: database management, schema validation, a fast, type-safe router, an unbundled asset server, and a brand-new UI runtime complete with composable event handling, styles, animations, and built-in components. Remix is more capable than it has ever been, and it's all in a single `remix` package.

We're going to dig into all the details in the coming weeks and months, and we'll release Remix 3 on October 2 at [Remix Jam][remix-jam-2026] (tickets are still available).

## What's New

If you've ever planted a tree, you might have heard an adage that goes something like this:

> The first year your tree won't grow a whole lot. That's because it's rooting, adjusting to the new soil, and building a strong foundation for growth. In year 2, it's going to suddenly take off, doubling, even tripling in size.

At least that's what I was told.

The journey of Remix 3's development has been a lot like planting a tree. Last year at [Remix Jam][remix-jam-2025], we metaphorically invited you into our "garage" to hear our [demo tape][remix-jam-2025-demo-tape]. We talked about the ideas we love from React and React Router (previously [Remix v2][remix-history]). We also talked about the things we don't love so much about those projects, and where we want to take Remix. With Remix we want to provide a fully stacked web framework, unapologetically built on web primitives and productive out the gate in an agentic programming landscape.

From that point up until we released our first beta, we were focused on establishing and rooting all of those ideas and APIs. We were giving every piece it's proper place, making sure the packages would work well together and that the majority of them [could be used independently][solid-remix-cookie].

Since that beta, Remix has grown a lot:

- A complete database workflow with migrations, seeding, status checks, resets, wipes, and rollbacks built into the CLI.
- Full-stack HMR (hot module replacement) that reloads server modules and updates compatible UI components in place.
- Improved unbundled asset serving for JavaScript, CSS, images, fonts, and npm packages, with built-in preloading.
- Safer, faster route matching and URL generation, composable routing with `router.mount()`, and improved TypeScript inference.
- An expanded UI library with tabs, toggles, context menus, and more.
- SPA support that brings the same router, middleware, controllers, and Request-to-Response model to client-rendered apps.
- Improved navigation for links and forms, whether updating the whole document or a targeted frame.
- `remix.json` for configuring databases, assets, tests, and `remix doctor`, plus CLI tooling for inspecting browser-reachable assets.

And that just scratches the surface. We've also made numerous bug fixes and stability improvements across 350+ commits this summer (or winter for Mark).

## Why Remix is Good

We have been a lot quieter about Remix than we like or intended. It's not for lack of excitement about Remix. We have genuinely struggled to wrap exactly what is exciting about Remix into simple, straightforward explanations that we can deliver in quick videos, blog posts, demos, etc.

This is largely for 2 reasons:

1. AI and agentic programming have made it very difficult to talk about technology through the lens of code, which has always been our modus operandi.
2. Remix 3 is so much bigger than just a React or metaframework replacement. It is a true full-stack JavaScript framework unlike anything we've yet to see in this ecosystem.

This has meant that we've defaulted a lot more to building than to showing. But no more.

We've been putting Remix through its paces, particularly by migrating this very website as well as the [Remix Store][remix-store] (works on my machine, I really should deploy it). We have been gathering feedback from early adopters, both externally and internally here at Shopify, some of whom you may or may not hear from at [Remix Jam][remix-jam-2026].

Overall, our best pitch for Remix is that we like it. Everyone is trying to pitch that they're building _for agents_. No one really knows what that means. We built this for ourselves, and we use agents. We use agents a lot. We're the most biased of the bunch, but we're finding again and again that:

- Agents get Remix because it's built on web primitives, it's type-safe, and treats things like UI state as Just JavaScript™ scope.
- On those occasions when we do still happen to look at the code, we get what the agent has produced, not because we totally get Remix, but because we find Remix so get-able.

You shouldn't (and really can't) take our word for it, though. Try it out. Build something. And if you don't find Remix to be as grokable as we say, we still have 1 trick up our sleeve. The default `remix` template `package.json` looks like this:

```json
"dependencies": {
  "remix": "3.0.0-rc.1"
},
```

With Remix, you can build truly full-stack applications, not merely a backend-for-frontend (though you can do that) or a server-rendered app that punts on the database (no offense, React Router; we still do love you and are making you better all the time). No more middle-stack. No more leaning on other libraries for anything interesting you want to do on the server, or punting in the browser and relying on React (which we do still love and have a ton of respect for, by the way).

Remix is a truly full-stack framework in a single dependency. That means less surface area in your `package.json` for the next npm supply-chain attack. It also means less churn from you or your agent cobbling together various packages just to build your blog with 4 posts (guilty). And if you don't like one of our choices, you can swap out just that piece. For example, use Zod instead of `@remix-run/data-schema` (it's compatible), or pull in Drizzle instead of `@remix-run/data-table`. Heck, you can even swap our `render` middleware with a React-based one if you really want to. It's composable by design so that you always stay in charge.

We built Remix to be something we want to use, and we hope to see agents continue to excel with it and other humans come to love it.

## What's Left

You're probably wondering at this point how long it will be before we call Remix 3 stable. We know many are waiting to give Remix a real try until we mark the software as stable, or at least until we have some better docs (that one's mostly on me, but the first few entries in our [guides][remix-guides] are pretty decent if you haven't checked them out).

At this point, we are done adding features to Remix 3 before the official release. We have plenty of ideas for continuing to expand and improve the framework (I've had multiple people ask me if we're gonna include background jobs), and we probably could spend years in pre-3 release mode if we wanted. Agents only enable our addiction to enhancing and improving and expanding Remix. But endlessly perfecting the perfect framework is no good for you, and we really want Remix to help you build your ideas. So it's time to ship and start binding ourselves to SemVer so you can trust Remix with your ideas.

The Release Candidate marks the end of feature development (if we can help it) and allows us to clean up known bugs, perform thorough security audits, gather feedback from early adopters, write more docs, and, oh yeah, prepare for [Remix Jam][remix-jam-2026] (where we will release Remix 3).

<figure>
  <img alt="Michael Jackson presenting onstage to an audience at Remix Jam 2025" src="/blog-images/posts/remix-3-release-candidate/remix-jam-2025-photo-139.jpg" />
  <figcaption class="pt-2">Michael Jackson and co-founder of Remix presenting at Remix Jam 2025.</figcaption>
</figure>

## Try it out

Want to take this RC for a spin?

```sh
npx remix@next new my-remix-app
```

You can also learn more and stay up-to-date by checking out:

- [The docs][remix-guides] (which we're actively updating)
- [This website's source code][remix-website-github] for a real-world site
- [Our Discord][remix-discord] to connect with other folks building with Remix
- [Our newsletter][remix-newsletter] to receive monthly updates

Alright, back to work for us, we've gotta ship this thing! See you in person or online at [Remix Jam][remix-jam-2026]!

[remix-3-beta-preview]: /blog/remix-3-beta-preview
[remix-jam-2026]: /jam/2026
[remix-jam-2025]: /jam/2025
[remix-jam-2025-demo-tape]: /jam/2025/gallery?photo=120
[remix-history]: /remix-history
[remix-store]: https://shop.remix.run
[remix-guides]: https://guides.remix.run
[remix-website-github]: https://github.com/remix-run/remix-website
[remix-discord]: https://remix.run/discord
[remix-newsletter]: /newsletter
[solid-remix-cookie]: https://github.com/solidjs/templates/blob/8de24f5f769429c9c030721f2a454edd20501f3a/solid-v2/fullstack/package.json#L30
