---
title: "Remix Jam 2025 Recap"
summary: Remix Jam was really good. In case you missed it, here's a recap.
date: 2025-10-17
image: /blog-images/headers/rsc-framework-mode-preview.jpg
ogImage: /blog-images/headers/rsc-framework-mode-preview.jpg
imageAlt: Glowing tree
imageDisableOverlay: true
authors:
  - Brooks Lybrand
---

TODO: add header image

Last Friday (October 10, 2025) we hosted Remix Jam at the Shopify offices in Toronto. We haven't hosted a conference since Remix Conf in May of 2023, and it felt great to get some of our biggest fans back together.

People from all over the world joined us as we celebrated and shared the past, present, and future of Remix. Our goal was to invite you into "our house" and open up "our garage". We invited some friends to show you what they've been working on and what's inspired us, and we had some demo tapes we wanted to spin as well.

That was pretty heavy on the metaphors, maybe we should just dig into it.

Kick back, put on [a mixtape we made for you](https://open.spotify.com/playlist/1jnKC0fjhyOSwZVxllJ1me?si=2adf8604b6204899), and checkout what you missed:

## Talks

_[The full livestream](https://youtu.be/xt_iEOn2a6Y?t=656) is still up on our YouTube if you want to watch the whole thing, or you can just watch each talk on its own._

### "Interactive MCP with React Router" by Kent C. Dodds

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/3cX2Zsr7jBQ?si=P0I3BFxBSiExF2i5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The one and only Kent C. Dodds kicked off the day by arguing that it’s time to stop shoving chatbots into every app and instead wire our apps into agents. The shift is from “add a chat UI” to “give models real tools” with the Model Context Protocol (MCP) as the bridge.

Kent shared how Evan Bacon's ["Universal React Server Components"](https://www.youtube.com/watch?v=djhEgxQf3Kw) talk at React Conf 2024 started the gears turning for him, not because of RSC per se, but because Evan showed a model responding with UI. Kent saw the advent and proliferation of AI as our opportunity to build [JARVIS](https://en.wikipedia.org/wiki/J.A.R.V.I.S.). But now with company's like Open AI allowing developers to leverage protocols like [MCP-UI](https://mcpui.dev/) Kent's takeaway is that we don't have to build JARVIS, we can build JARVIS’s hands. Clear tools, strong schemas, and good metadata.

Kent demoed building an MCP server and a journaling app using React Router, and how to wire it up with some new APIs from OpenAI. Simply by prompting, Kent was able to contribute to his online journal and see the UI he developed directly in ChatGPT's interface.

We were especially glad to have Kent here with his eye on the future of development and the industry. We were inspired by the talk and hope you will be too.

### "Remixing Shopify's Admin" by Craig Brunner

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/AHDqWjYcrYU?si=LfjUHUZNiQlgMlXk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Craig Brunner, a Principal Engineer at Shopify, took us inside one of the largest TypeScript apps on the planet: Shopify Admin. He showed how they leveraged Remix concepts, patterns, and tools to improve the developer experience and performance of the app.

To put it into perspective, Shopify Admin has:

- ~67M daily page views
- ~3M lines of TypeScript
- 100+ contributing teams
- 350+ PRs merged every day
- 1,000+ routes

Craig shared how the team migrated to Vite and React Router; leveraged route manifests as the source of truth for routing; and leaned into `loaders`/`actions` to initialize data fetching as early as possible and keep data and mutations close to routes. They did a lot of work to standardize patterns—such as lazy-loading code and assets—and replaced skeletons with [View Transitions](https://reactrouter.com/how-to/view-transitions) so the UI feels instant, without flicker. Craig also demoed some cool internal devtools they built to help with debugging, made possible by the consolidation of route definitions.

Craig wrapped up by showing off a brand new feature called **Intents**. Intents are a way to launch any page from anywhere inside Shopify Admin as a new router instance that stacks on top of the current UI. It’s a great abstraction for third-party app developers, as well as for an AI agent to interact with directly in a chat interface (see the next talk).

### "Building Sidekick: An AI Assistant People Actually Use" by Felipe Leusin

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/dig9aslqSVc?si=Rg9b9Jz7Vr9rLrRc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Building on the foundation Craig and his team laid with Shopify Admin, Senior Development Manager Felipe Leusin shared how they built Sidekick, Shopify's AI Assistant. Kent urged us to stop putting chatbots in our apps, but Felipe showed that Sidekick is no ordinary chatbot.

In 2023, Shopify Admin had ~700 routes, 4 form libraries, multiple data-loading patterns, and a runtime-heavy app. Shopify wanted to build a chatbot that did more than just wrap an LLM to give you summaries of your data. They wanted to build an agent to navigate Shopify Admin and help merchants do actual work such as creating products, generating reports, initiating a store-wide sale, and much more.

Felipe walked through the various approaches, challenges, and learnings the team went through over the years in building Sidekick. They discovered that the DOM doesn't provide enough metadata for LLMs to act reliably, so to effectively build something like Sidekick you have to operate at the framework layer. In their case, that meant using React Router's `loaders`/`actions`, route manifests, and consistent schemas so an agent can do more than chat.

Pair that with Admin Intents and you get a clean loop: open the correct page from anywhere, extract the schema, fill, and submit.

The work that the Sidekick team has done at Shopify has been a huge inspiration to the Remix team. We want to build a framework that's not only simple and productive for developers, but also a strong foundation for building complex AI-enabled products.

### "Introducing Remix 3 (Parts 1 & 2)" by Michael Jackson and Ryan Florence

TODO: YouTube embed

Back in May, [Michael and Ryan shared the direction](./wake-up-remix) they were planning to take Remix. We didn't share a lot, just that Remix 3:

- Would not be built on Remix
- Would follow [6 principals](./wake-up-remix#principles) for development

As a recap, those principals are:

1. Model-First Development
2. Build on Web APIs
3. Religiously Runtime
4. Avoid Dependencies
5. Demand Composition
6. Distribute Cohesively

After spinning up the demo tape (TODO: link to a tweet or something here), this is what they showed.

#### Remix UI

#### Routing in Remix

#### Frames

## What's next

TODO: add image here

You're probably wondering when we'll release Remix 3, what else we plan to include, and how to play with the code yourself.

In terms of timeline, we don't have a hard commitment yet, but we want to get this to everyone in a stable state as soon as possible. Our goal right now is to continue shipping everything as small, composable modules (like we've been doing), and give you the first version of the packages up full-stack framework `remix` early 2026.

In the meantime:

- [Watch the repo](https://github.com/remix-run/remix) (checkout the bookstore demo)
- [subscribe to our newsletter](https://rmx.as/newsletter)
- Keep reading our blog

Hope to see a lot more of you at Remix Jam 2026 💿
