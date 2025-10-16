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

Last Friday (October 10, 2025) we hosted Remix Jam at the Shopify offices in Toronto. This was our first conference since Remix Conf in May of 2023.

People from all over the world joined us as we celebrated and shared the past, present, and future of Remix. Our goal was to invite you into "our house" and open up "our garage". We invited some friends to show you some of what they've been working on, and we had some demo tapes we wanted to spin as well. That's pretty heavy on the metaphor, so let's dig into it.

So kick back, put on [a playlist we made for you](https://open.spotify.com/playlist/1jnKC0fjhyOSwZVxllJ1me?si=2adf8604b6204899), and checkout what you missed:

## Talks

_[The full livestream](https://youtu.be/xt_iEOn2a6Y?t=656) is still up on our YouTube if you want to watch the whole thing, or you can just watch each talk on its own (linked throughout)_

### "Interactive MCP with React Router" by Kent C. Dodds

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/3cX2Zsr7jBQ?si=P0I3BFxBSiExF2i5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The one and only Kent C. Dodds kicked off the day by showing us the direction that companies like Open AI are going with powerful protocols like MCP-UI.

Kent walked us through the paradigm shift we're experiencing with AI, going from embedding chatbots in every website to instead integrating our tools into AI agents directly using the Model Context Protocol.

Using our powerful framework, React Router, Kent demonstrated how to develop MCP servers with AI tools, highlighting the potential for reactive, efficient, user-centric application development.

We were especially glad to have Kent here, with his eye on the future of development and the industry. We were inspired by talk and hope you will be too.

- been a huge part of the Remix community
- Evan Bacon's demo inspired him, more than the impact of React Server Components, it was the idea of AI responding with UI
- What is the future of user interaction, how is AI changing it?
  - boiled down to JARVIS, we can build this
  - we don't need to build JARVIS, we can just build it's "hands"
- Done adding chatbots to apps, now it's time to add your app to the chatbot
- Demos a a journaling MCP that he built

### "Remixing Shopify's Admin" by Craig Brunner

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/AHDqWjYcrYU?si=LfjUHUZNiQlgMlXk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

- Applied simple concepts from Remix to Shopify Admin
  - ~67MM Daily Page Views
  - ~3MM Lines of TypeScript
  - ~100 Contributing teams
  - ~350 Daily PRs Merging
  - Over 1000 routes

One of the largest TypeScript codebases in existence

Needs to support a lot of existing features, rapid development, and multiple teams. And as of 2024, it needed to be AI enabled (see next talk)

- migrated to vite + react router
- lots of chaos, inconsistency, source of truth for routes,

Uses Route Manifests, `actions`/`loaders`, everything is split up and lazy-loaded well

Showed custom dev tools, prefetching of data, lazy loading assets, replacing skeleton loaders with view transitions

Recently they released "Intents", which basically lets you launch a page (new instance of React Router) from anywhere that can stack

- Scale of Shopify Admin
- Route Manifest
- Intents

In this talk, Craig, a developer at Shopify, explains how they leveraged Remix to revamp Shopify's admin platform (admin.shopify.com), which handles around 67 million daily page views and involves contributions from over a hundred teams. Craig discusses the scale issues they faced, including slow page loads, inconsistent designs, and the need for an AI-enabled experience. They addressed these challenges by migrating to VE and React Router, creating route manifests for a unified source of truth, using loaders for performance optimization, and implementing view transitions to eliminate loading skeletons. Additionally, Craig introduces a new feature called Intents, which allows opening any admin page globally accessible on top of any other page, enhancing the AI's ability to interact programmatically with forms and improving third-party integration. He also highlights their future focus on dynamic UIs, integrating components with chatbots, and ensuring efficient offline functionality.

### "Building Sidekick: An AI Assistant People Actually Use" by Felipe Leusin

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/dig9aslqSVc?si=Rg9b9Jz7Vr9rLrRc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Sidekick goes beyond a typical chatbot (remember Kent saying we shouldn't be building chatbots, well Shopify did)

Challenges of Shopify Admin in 2023:

- 700 routes
- 4 form libraries
- multiple data loading patterns
- runtime based

They had to solve for letting the agent actually take actions on the users behalf

How can you have it navigate the admin (route manifests were a bit part of this)

The DOM wasn't good enough for LLms to work on, there's not enough metadata there. The framework layer is actually the best layer to operate and late AI do stuff.

"never build your own form library"

Schema first APIs with zod were key here

Moved toward making "the Shopify Admin an MCP server" for sidekick. Client tools like:

Admin Intents also became a great abstraction for Sidekick to use as well as 3rd party app developers

As developers, our job is shifting to be about providing the models the best context possible

- `get_form_schema`
- `fill_form`
- `navigate_user`

>  like I said, for me, the biggest unlock that we got with like moving to React router, moving to loaders and actions is that now all of this happens without the browser having to navigate.

- What is Sidekick
- What it took to build it
- Why this inspires us

In this script, Felipe discusses the development and functionality of Sidekick, an AI-driven assistant integrated into Shopify. He begins with the vision for making entrepreneurship easier by providing constant, non-judgmental support tailored to individual business needs. Sidekick was conceived to go beyond simple chatbots, leveraging AI to assist with tasks like analytics, form-filling, and navigating complex administrative routes in Shopify. Felipe explains the technological underpinnings, including the use of LLMs (Large Language Models), schemas, React Router, and the challenges faced in providing accurate and context-aware AI assistance. He highlights the importance of metadata and developer annotations for optimizing Sidekick's capabilities. Felipe also delves into ongoing improvements, including voice integration, the shift from a sidebar to a full-screen interface, and future potential with MCP Y and web models. The session encapsulates the transformative journey of integrating advanced AI into Shopify to empower entrepreneurs more effectively.

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
