---
title: "Remix Jam 2025 Recap"
summary: Remix Jam was really good. In case you missed it, here's a recap.
date: 2025-10-17
image: /blog-images/headers/remix-jam-2025-recap.jpg
ogImage: /blog-images/headers/remix-jam-2025-recap.jpg
imageAlt: Glowing tree
imageDisableOverlay: false
authors:
  - Brooks Lybrand
---

Last Friday (October 10, 2025) we hosted Remix Jam at the Shopify offices in Toronto. We haven't hosted a conference since Remix Conf in May of 2023, and gathering in-person with so many of our biggest fans again felt great.

People from all over the world joined us as we celebrated and shared the past, present, and future of Remix. This conference was an invitation to _"our house"_ so we could open up _"our garage"_ and jam. We invited some friends to first show you what they've been working on that's inspiring us, and then we had some _"demo tapes"_ we wanted to spin as well.

That's pretty heavy on the metaphors, maybe we should just dig into it.

Kick back, put on [a mixtape we made for you](https://open.spotify.com/playlist/1jnKC0fjhyOSwZVxllJ1me?si=2adf8604b6204899), and check out what you missed:

## Talks

_[The full livestream](https://youtu.be/xt_iEOn2a6Y?t=656) is still up on our YouTube if you want to watch the whole thing, or you can just watch each talk on its own._

### "Interactive MCP with React Router" by Kent C. Dodds

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/3cX2Zsr7jBQ?si=P0I3BFxBSiExF2i5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The one and only Kent C. Dodds kicked off the day by arguing that it’s time to stop "adding a chatbot to your app" and instead start "adding your app to the chatbot".  He talked about how to make your app agent friendly with the Model Context Protocol (MCP).

Kent shared how Evan Bacon's ["Universal React Server Components"](https://www.youtube.com/watch?v=djhEgxQf3Kw) talk at React Conf 2024 started the gears turning for him, not because of RSC per se, but because Evan showed a model responding with UI. Kent saw the advent and proliferation of AI as our opportunity to build [JARVIS](https://en.wikipedia.org/wiki/J.A.R.V.I.S.). But now with companies like OpenAI allowing developers to leverage protocols like [MCP-UI](https://mcpui.dev/) Kent's takeaway is that we don't have to build JARVIS, we can just build JARVIS's hands.

Kent demoed building an MCP server and a journaling app using React Router, and how to wire it up with some new APIs from OpenAI. Simply by prompting, Kent was able to contribute to his online journal and see the UI he developed directly in ChatGPT's interface.

We were especially glad to have Kent here with his eye on the future of development and the industry. We were inspired by the talk and hope you will be too.

### "Remixing Shopify's Admin" by Craig Brunner

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/AHDqWjYcrYU?si=LfjUHUZNiQlgMlXk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Craig Brunner, a Principal Engineer at Shopify, took us inside one of the largest TypeScript and React Router apps on the planet: Shopify Admin. He showed how his team leveraged Remix concepts, patterns, and tools to improve the developer experience and performance of the app.

Shopify Admin has:

- ~67M daily page views
- ~3M lines of TypeScript
- 100+ contributing teams
- 350+ PRs merged every day
- 1,000+ routes

Craig shared how the team migrated to Vite and React Router's Data Mode, leveraged route manifests as the source of truth for routing, and leaned into `loaders`/`actions` to initialize data fetching as early as possible and keep data and mutations close to routes. His team did a lot of work to standardize patterns, such as lazy-loading code and assets, and replaced skeletons with [View Transitions](https://reactrouter.com/how-to/view-transitions) so the UI feels instant while avoiding any flickering or jank. Craig also demoed some cool internal devtools his team built to help with debugging, made possible by the consolidation of route definitions.

Craig wrapped up by showing off a brand new feature called _Intents_. Intents are a way to launch any page from anywhere inside Shopify Admin as a new router instance that stacks on top of the current UI. It’s a great abstraction for third-party app developers, as well as for an AI agent to interact with directly (see the next talk).

### "Building Sidekick: An AI Assistant People Actually Use" by Felipe Leusin

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/dig9aslqSVc?si=Rg9b9Jz7Vr9rLrRc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Building on the foundation Craig and his team laid with Shopify Admin, Senior Development Manager Felipe Leusin shared how his team built Sidekick, Shopify's AI Assistant. Kent urged us to stop putting chatbots in our apps, but Felipe showed that Sidekick is no ordinary chatbot.

In 2023, Shopify Admin had ~700 routes, 4 form libraries, multiple data-loading patterns, and a runtime-heavy app. Shopify wanted to build a chatbot that did more than just wrap an LLM to give you summaries of your data. They wanted to build an agent to navigate Shopify Admin and help merchants do actual work such as creating products, generating reports, initiating store-wide sales, and much more.

Felipe walked through the various approaches, challenges, and learnings the team went through over the years in building Sidekick. They discovered that the DOM doesn't provide enough metadata for LLMs to act reliably, so to effectively build something like Sidekick you have to operate at the framework layer. In this case, that meant using React Router's `loaders`/`actions`, route manifests, and consistent schemas so an agent can do more than just "chat".

Paired with Admin Intents, Sidekick now has a straightforward workflow for opening the correct page from anywhere, extracting the schema, filling out forms, and submitting them.

The work that the Sidekick team has done at Shopify has been a huge inspiration to the Remix team. We want to build a framework that's not only simple and productive for developers, but also a strong foundation for building complex AI-enabled products.

### "Introducing Remix 3 (Parts 1 & 2)" by Michael Jackson and Ryan Florence

Back in May, Michael and Ryan published a blog post called ["Wake up, Remix!"](./wake-up-remix) where they shared the direction they were planning to take Remix. The details at the time were sparse, but they shared that Remix 3 would not be built on React, and would follow [6 principles](./wake-up-remix#principles) for development:

1. Model-First Development
2. Build on Web APIs
3. Religiously Runtime
4. Avoid Dependencies
5. Demand Composition
6. Distribute Cohesively

#### Climbing a Mountain

Ryan and Michael kicked off their 3.25 hours worth of demos by talking about their history with React, what they like and dislike about it, the direction they see it going, and consequently why Remix is forging ahead without React.

Michael and Ryan have been a part of the React community and ecosystem since the very beginning. At the time, React was a breath of fresh air with its declarative and composable API and component model, allowing developers to create reusable and rich user interactions.

For more than a decade now, working in the React ecosystem has felt like climbing a mountain. There's been a lot of cool things, and especially recently they've been inspired by the direction of newer APIs like Suspense, Server Components, Server Actions, etc. But now that they're at what feels like the top of the mountain, and experiencing the complexity of modern React, they find themselves looking around from this new vista and think they might see a better mountain they want to hike up next.

Continuing with the metaphor, Michael and Ryan setup their talks saying they're hiking back down the mountain and taking stock of what the web and JavaScript gives us these days, things that were not true back when React first came around. Things like:

- ES Modules
- TypeScript
- Service Workers
- Web Streams
- Fetch API

And a number of other web APIs that have made it both in the browser and in JS server runtimes.

Back at the base of the mountain and with a dedication to use the platform, they gathered all these tools and started hiking up this new mountain. With that mental framework set, one by one they shared some new and interesting APIs they'd built that will make up the Remix framework.

As outlined in the principals, the philosophy of Remix is to build a number of small, composable modules that work together to form a complete framework. Once we're ready we'll ship the full-stack framework as a single package called `remix`.

#### Remixing UI

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/iZl0IKj0HHc?si=FymcZpys5Wsvi0lW" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Ryan kicked things off by spinning up a [demo CD he burned](https://x.com/wesbos/status/1976730072150425809) and showing off Remix's new events and components model.

At a quick glance, Remix components look a little like this:

```tsx
import { tempo } from "./tempo";
import { createRoot, type Remix } from "@remix-run/dom";

function App(this: Remix.Handle) {
  let bpm = 60;

  return () => (
    <button
      on={tempo((event) => {
        bpm = event.detail;
        this.update();
      })}
    >
      BPM: {bpm}
    </button>
  );
}

createRoot(document.body).render(<App />);
```

Now that you've been completely triggered by the presence of `this`, `let`, and `on`, we want to encourage you to carve out some time to go watch Ryan introduce these concepts one by one as he builds his drum machine demo.

There's a ton that was captured in this portion of the talk which we'll be sharing more about in the near future. There's still a ton of work to do (this repository isn't even open source yet), but you can play with these examples yourself if you can find a copy of the source code on LimeWire[^1].

And it doesn't stop there. Ryan briefly hinted at a Component Library and theming support that will eventually be built into the `remix` framework as well.

#### Remixing the Server

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/dZbZgxWlzr8?si=4j3rkzJJOvarL8_Q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

After a break, Michael Jackson took the stage to talk about the backend pieces of Remix 3. Unlike Ryan's talk, just about everything Michael showed is already [open sourced](https://github.com/remix-run/remix), benchmarked, tested, and available on NPM.

All the way back when working on Remix v1, it was a goal that Remix would be able to run inside of any JavaScript server runtime, which these days means: Node, Cloudflare Workers, Deno, Bun, Service Workers, etc.

The goal was for Remix to be a full-stack JavaScript framework, but for Michael it always stopped a little short on the server side, and was only ever what he would consider "center stack".

Seeing the server side of the new mountain they want to hike up, Michael deconstructs what a server is, what routes are, what handlers are, and puts all the pieces back together. He starts to build a JavaScript server from scratch, bringing in various packages as he goes:

- [`@remix-run/route-pattern`](https://github.com/remix-run/remix/tree/main/packages/route-pattern)
- [`@remix-run/node-fetch-server`](https://github.com/remix-run/remix/tree/main/packages/node-fetch-server)
- [`@remix-run/form-data-parser`](https://github.com/remix-run/remix/tree/main/packages/form-data-parser)
- [`@remix-run/multipart-parser`](https://github.com/remix-run/remix/tree/main/packages/multipart-parser)
- [`@remix-run/file-storage`](https://github.com/remix-run/remix/tree/main/packages/file-storage)

The bulk of the application is handled by the [`@remix-run/fetch-router`](https://github.com/remix-run/remix/tree/main/packages/fetch-router) package, an expressive, type-safe router built on the web Fetch API and `route-pattern`.

### Bringing it all together (`hydrated()` and `Frame`)

After showing how you can use these tools to easily build a simple CRUD (Create, Read, Update, Delete) application complete with file uploads, Michael switched to showing off the [bookstore app](https://github.com/remix-run/remix/tree/main/demos/bookstore) he and Ryan built that puts all these pieces together.

It's definitely worth watching the full talk to see Michael walk through the code, as well as cracking it open yourself to see how all the various pieces work together. A simplified example of the core pieces looks like this:

`fetch-router` requires named routes, separate from your route handlers. This is important for type-safety, code splitting, and static analysis (see the prior talks about Shopify Admin and Sidekick on why this is important.)

```ts
// routes.ts
import { route, formAction, resources } from "@remix-run/fetch-router";

export let routes = route({
  assets: "/assets/*path",
  images: "/images/*path",
  uploads: "/uploads/*key",

  // Public book routes
  books: {
    index: "/books",
    genre: "/books/genre/:genre",
    show: "/books/:slug",
  },
});
```

Next, you need to define what happens at each route using your route handlers. Everything is very composable and you can map multiple handlers at once with `router.map`.

```ts
// router.ts

import { createRouter } from "@remix-run/fetch-router";
import { logger } from "@remix-run/fetch-router/logger-middleware";
import { routes } from "../routes.ts";
import { storeContext } from "./middleware/context.ts";
import { uploadHandler } from "./utils/uploads.ts";
import booksHandlers from "./books.tsx";
import * as publicHandlers from "./public.ts";
import { uploadsHandler } from "./uploads.tsx";

export let router = createRouter({ uploadHandler });

router.use(storeContext);

if (process.env.NODE_ENV === "development") {
  router.use(logger());
}

router.get(routes.assets, publicHandlers.assets);
router.get(routes.images, publicHandlers.images);
router.get(routes.uploads, uploadsHandler);

router.map(routes.books, booksHandlers);
```

Then in each handler you can return a simple response or render Remix components.

```tsx
// books.tsx
import type { RouteHandlers } from "@remix-run/fetch-router";
import { Frame } from "@remix-run/dom";
import { routes } from "../routes.ts";

export default {
  use: [loadAuth],
  handlers: {
    index() {
      let books = getAllBooks();

      return render(
        <Layout>
          <h1>Browse Books</h1>
          {/* ... search and filter UI ... */}
        </Layout>,
      );
    },

    show({ params }) {
      let book = getBookBySlug(params.slug);
      if (!book) {
        return render(<Layout>{/* ... 404 ... */}</Layout>, { status: 404 });
      }

      return render(
        <Layout>{/* ... book details and add to cart form ... */}</Layout>,
      );
    },
  },
} satisfies RouteHandlers<typeof routes.books>;
```

Finally, Ryan joined Michael to tie it all together and showed two of the most exciting pieces:

`hydrated()` and `Frame`.

There's a lot more that needs to be said about these new APIs, but essentially:

- `hydrated()` is the way to selectively hydrate a component to run JavaScript on the client-side (kind of like React's `"use client"`)
- `Frame` is the primitive for async UI, heavily inspired by iframes (though not actually built on them)

Ryan and Michael demoed how you can interop hydrated components inside of Frames and vice versa. And best of all, when you mutate some data and need to revalidate a frame, the response is raw HTML which our new, hybrid reconciler intelligently morphs into the existing DOM.

It's a simple model with powerful primitives and technology, inspired by the best of the web and many other open source projects like React RSC, HTMX's [idiomorph](https://github.com/bigskysoftware/idiomorph), and much more.

## What's Next

![Remix Demo CDs in a display case with a hand reaching in to grab one](/blog-images/posts/remix-jam-2025-recap/remix-demo-cd.webp)

You're probably wondering when we'll release Remix 3, what else we plan to include, and how to play with the code yourself.

In terms of timeline, we don't have a hard commitment yet, but we want to get this to everyone in a stable state as soon as possible. Our goal right now is to continue shipping everything as small, composable modules (like we've been doing), and give you the first version of the full-stack framework package `remix` in early 2026.

In the meantime:

- [Watch the repo](https://github.com/remix-run/remix) (check out the bookstore demo)
- Check out Remix team member Mark Dalgleish's [collection of Remix 3 resources](https://github.com/markdalgleish/remix3-resources) with demo apps, third-party integration examples, and timestamped links to every API shown at Remix Jam
- [Subscribe to our newsletter](https://rmx.as/newsletter)
- Keep reading our blog

Hope to see many of you at Remix Jam 2026 💿

[^1]: Long time community member @rossipedia put up [an improved version of the demo on GitHub](https://github.com/rossipedia/remix-jam-mk2/tree/main)
