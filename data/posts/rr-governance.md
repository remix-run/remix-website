---
title: "React Router Open Governance"
summary: "React Router is moving to an Open Governance Model"
date: 2025-06-03
image: /blog-images/headers/react-router-v7.jpg
imageAlt: React Router Logo
authors:
  - Brooks Lybrand
  - Matt Brophy
---

Michael said it best in his [tweet](https://x.com/mjackson/status/1927739177149382991), let's not bury the lede.

> React Router isn’t just mine and Ryan’s baby anymore. It is a mature OSS project with millions of dependents. We want everyone to have a say in how the project moves forward.

React Router has been around for over 10 years under the development and oversight of [Michael](https://x.com/mjackson) and [Ryan](https://x.com/ryanflorence). When they obtained funding for Remix in 2021 and built a team around Remix, they also indirectly built a team around React Router. That team has been working on React Router for a few years now and it's time to formalize the process we've loosely been using internally for a while now.

This week in our [Wake Up, Remix](https://remix.run/blog/wake-up-remix) post, we announced a new [Open Governance Model](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md) for React Router. We planned to announce these in the reverse order - first the governance model so folks knew that React Router wasn't going anywhere, followed by our plans for Remix v3. However, a leak of an old version of the Remix announcement forced our hand and we had to get that post out quicker than anticipated. This meant we didn't get to give the new governance model the proper focus and announcement — we think it's just as exciting for the community and the future of React Router!

## Motivation

_high level bullets - see below for the original long form text from the post_

- API has grown over the years
- Remix merging in brought more APIs
- New ways of doing the old things
- Time to step back and take a wholistic look at the API
- React is improving and in some cases introducing duplicate surface area which can cause confusion for devs
- We want to lower the cognitive load for RR devs
- Use React Apis where possible (`<title>`, `<meta>`, `<link>`, `<ViewTransition>`)
  - ⚠️ TODO: Add links
- Collapse/Combine our APIs where possible (`useRouterState`)
  - ⚠️ TODO: Add link to RFC
- Time to reduce the surface area, ideally without sacrificing functionality
  - Give folks a pathway to the new stuff and beign to deprecate the old stuff.
  - Potential example - descendant `<Routes>` patterns could migrate to `patchRoutesOnNavigation`, opening up the ability to deprecate/remove descendant `<Routes>` in the future
- Set official design goals to guide the ongoing development
- Open it up to the community and provide a formalized process of getting features into RR
- This should ensure RR can continue to evolve for years to come
