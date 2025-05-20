---
title: Remix Declaration of Independence
summary: "React transformed web development with simplicity, stability, and style—but has grown complex. Remix v3 is our fresh take: a new, independent framework built to recapture that original feeling React gave us."
date: 2025-05-15
authors:
  - Ryan Florence
  - Michael Jackson
image: /blog-images/headers/doi.jpg
ogImage: /blog-images/headers/doi.jpg
imageAlt: "An image of what appears to be the Founding Fathers in a modern office workspace, surrounded by laptops and monitors, collaborating on documents as if drafting the Declaration of Independence."
---

React was the hero the web needed exactly when it needed one. After the release of the iPhone and innovative web UIs like those on facebook, user expectations jumped. While many tools popped up to answer the call, React stood out for its simplicity, stability, and style.

You created encapsulated components without any special types, wrote JavaScript instead of special templating syntax, data flowed down through props and up through prop callbacks, and finally you'd set state in response to user events. Like magic, the page updated, and updated fast. We'd never seen anything like it.

React's rise to popularity was driven by it's simplicity: both to use and understand. It inspired developers to build incredible new products and leveled up the front-end ecosystem with its concepts.

Fast forward a decade and React continues to lead the landscape with innovations like React Server Components and Server Functions. [As we posted recently](./rsc-preview), React Router now has preview support for these new strategies. We think React Router v7 is the best way to use React and we are very optimistic about its future.

As much as anybody, we've benefitted greatly by jumping on the React train and are indebted to everybody who has been a part of it. We hope our contributions are equally appreciated.

Which brings us to Remix.

## Wake Up Remix!

At [React Conference](./incremental-path-to-react-19) we noted that Remix v2 had become a thin wrapper around React Router, an artificial separation that added complexity to our work. So, we would remove the separation by moving the bundler and server runtime abstractions directly into React Router v7.

Well, we finished that work and headed back over to Remix to wake it up.

We expected Remix to wake up as a full-stack, RSC-first React framework. However, something was missing from what we were building:

Simplicity, stability, and style.

It didn't feel like the React we fell in love with anymore.

## Complexity

There's no question that React has become more complex over the last few years. The new APIs are difficult to understand, the implementation has been less stable, and the deployment requirements are so complex that Next.js on Vercel remains the only practical implementation of React's full feature set after several years of RSC releases.

The generally accepted answer to this complexity is to paper over it with "bundler-first development": where a bundler is required to _enable features_, instead of simply _optimizing_ already functional code. In our experience, bundler-first development doesn't remove complexity, it adds it.

Don't get us wrong, bundlers aren't terrible. They can be useful for optimizing code. However, React's reliance on bundlers to enable features compounds its own growing complexity. A framework like Remix not only inherits that complexity but is beholden to--and sometimes stuck behind--the road maps of React and the bundlers.

Additionally, React's feature set has expanded into our own. Some things are better directly in React, but others we think are worse. We have two choices in these cases: keep multiple ways to do similar things or churn application code by deprecating our overlapping features. Either choice adds even more complexity.

Of course, complexity is easy to criticize but hard to avoid. React Router has three "modes" for heaven's sake! We are not immune, nor do we mean to point any fingers.

We're simply struggling to build something that _feels like React did_ when we first found it.

<center>

_That's why Remix is moving on from React_

</center>

## Remix Independence

Remix v3 is a completely new thing. It's our fresh take on simplified web development with its own rendering abstraction in place of React.

Inspired by all the great tech before it (LAMP, Rails, Sinatra, Express, React, and more), we want to build the absolute best thing we know how to build with today's capable web platform.

This requires a declaration of independence from anybody else's roadmap.

## React Router

The Remix team will continue to maintain and improve React Router. In fact, most of the team will work primarily on React Router for the foreseeable future. Shopify, X.com, GitHub, ChatGPT, Linear, T3Chat, and [nearly 11 million dependents on GitHub](https://github.com/remix-run/react-router/network/dependents) rely on React Router. We are committed to its continued success.

We don't intend for React Router apps to migrate to Remix v3, they are different things. Our hope is you want to build something _new_ with Remix, not rebuild something you're already happy with.

Additionally, Remix is modular, so a lot of it will be usable from within React Router.

## Principles

While we aren't ready with a preview release, we do have the principles guiding our development.

1. **Practice Model-First Development**

   AI fundamentally shifts the human-computer interaction model for both user experience and developer workflows. Optimize the source code, documentation, tooling, and abstractions for LLMs. Additionally, develop abstractions for applications to utilize models in the product itself, not just as a tool to develop it.

2. **Build on Web APIs**

   Programming language context switching is bad for both humans and models so sharing abstractions across the stack is beneficial. Build on the foundation of Web APIs and JavaScript because it is the only full stack ecosystem.

3. **Be Religiously Runtime**

   Designing for bundlers/compilers/typegen (and any pre-runtime static analysis) leads to poor api design that eventually pollutes the entire system. All packages must be designed with no expectation of static analysis and all tests must run without bundling. Because browsers are involved, `--import` loaders for simple transformations like TypeScript and JSX.

4. **Avoid Dependencies**

   Dependencies lock you into somebody else's roadmap. Choose them wisely, wrap them completely, and expect to replace most of them with our own package eventually. The goal is zero.

5. **Demand Composition**

   Abstractions should be single-purpose and replaceable. A composable abstraction is _easy to add and remove from an existing program_. Every package must be useful and documented independent of any other context. New features should first be attempted as a new package. If impossible, attempt to break up the existing package to make it more composable. However, tightly coupled modules that almost always change together in both directions should be moved to the same package.

6. **Distribute Cohesively**

   Extremely composable ecosystems are difficult to learn and use. Therefore the packages will be wrapped up into a single package as dependencies and re-exported as a single toolbox for both distribution and documentation.

## Jam With Us

If this strikes a chord with you, we're excited to share more. We'll be checking in at [Remix Jam](link) with our progress and would love to see you there.
