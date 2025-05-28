---
title: Wake up, Remix!
summary: It's time to go wake up Remix! Here's what we're building and what it means for React Router.
date: 2025-05-26
authors:
  - Michael Jackson
  - Ryan Florence
image: /blog-images/headers/wake-up-remix.jpg
ogImage: /blog-images/headers/wake-up-remix.jpg
imageAlt: "Neon glowing compact disc coming up behind a hill as if it were the rising sun."
---

At React Conf last summer we announced that Remix was going to "take a nap".

Remix v2 had become such a thin wrapper around React Router that an artificial separation developed between the two projects. We simplified the projects by moving the bundler and server runtime code from Remix directly into React Router v7, merging everything that made Remix great into React Router v7 “framework mode”. We also announced we'd be adding limited support for RSC in React Router.

We finished that work, releasing v7 last November and previewing RSC support last week.

It's time to go wake up Remix!

## React Router is Really Good

When we set out to evolve Remix, we expected it to become a full-stack, RSC-first React framework — a fresh take on the full-stack React architecture.

But something unexpected happened along the way: React Router v7 became really, really good.

Thanks to the work on RSC support in React Router, we now have a smooth, incremental adoption path that supports returning server components directly from loaders and actions. We even built a first-class story for server-only routes — something we originally imagined as part of Remix's next chapter.

If all your routes are server routes, React Router v7 already feels a lot like where Remix was headed. The differences are subtle, not structural.

And it's not just technically solid — it's battle-tested. React Router now powers apps at Shopify, X.com, GitHub, ChatGPT, Linear, T3Chat, and countless others, including nearly 11 million GitHub projects. It's just one minor release away from fully supporting the complete React architecture. It has a dedicated team, long-term backing, and an [open governance model](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md) to keep it growing for years to come.

So what does that mean for Remix?

It means we're free to go build what comes next.

## A New Path

Over the past few years, the web platform has made remarkable progress—and so have the tools we use to build on it. But as much as we've gained, we've also seen complexity grow in ways that feel… heavy. At times, modern web development can feel more like navigating a toolchain than building for the web.

We've had ideas that felt too disruptive to pursue in the past. But with Remix no longer tied to a specific paradigm, we have the freedom to explore them.

Remix v3 is a reimagining of what a web framework can be—a fresh foundation shaped by decades of experience building for the web. Our focus is on simplicity, clarity, and performance, without giving up the power developers need.

It's a modular toolkit that works well together but can also stand on its own—from first-class database drivers to a built-in component library. (time to wake up Reach UI too!)

This isn't just a new version—it's a new direction. One that's faster, simpler, and closer to the web itself.

To do that, we need to own the full stack—without leaning on layers of abstraction we don't control. That means no critical dependencies, not even React.

If you've ever wished for a development experience that feels lighter, faster, and more aligned with how the web works, Remix v3 is being built for you.

## Principles

While we aren't ready with a preview release, we do have the following principles guiding our development:

1. **Model-First Development.** AI fundamentally shifts the human-computer interaction model for both user experience and developer workflows. Optimize the source code, documentation, tooling, and abstractions for LLMs. Additionally, develop abstractions for applications to utilize models in the product itself, not just as a tool to develop it.
2. **Build on Web APIs.** Sharing abstractions across the stack greatly reduces the amount of context switching, both for humans and machines. Build on the foundation of Web APIs and JavaScript because it is the only full stack ecosystem.
3. **Religiously Runtime.** Designing for bundlers/compilers/typegen (and any pre-runtime static analysis) leads to poor API design that eventually pollutes the entire system. All packages must be designed with no expectation of static analysis and all tests must run without bundling. Because browsers are involved, `--import` loaders for simple transformations like TypeScript and JSX are permissible.
4. **Avoid Dependencies.** Dependencies lock you into somebody else's roadmap. Choose them wisely, wrap them completely, and expect to replace most of them with our own package eventually. The goal is zero.
5. **Demand Composition.** Abstractions should be single-purpose and replaceable. A composable abstraction is _easy to add and remove from an existing program_. Every package must be useful and documented independent of any other context. New features should first be attempted as a new package. If impossible, attempt to break up the existing package to make it more composable. However, tightly coupled modules that almost always change together in both directions should be moved to the same package.
6. **Distribute Cohesively.** Extremely composable ecosystems are difficult to learn and use. Therefore the packages will be wrapped up into a single package as dependencies and re-exported as a single toolbox (remix) for both distribution and documentation.

## Jam With Us

If this strikes a chord with you, we'll be checking in at [Remix Jam](https://remix.run/jam) with our progress and would love to see you there.
