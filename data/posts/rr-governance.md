---
title: "React Router Open Governance"
summary: "React Router is moving to an Open Governance Model"
date: 2025-06-04
image: /blog-images/headers/react-router-v7.jpg
imageAlt: React Router Logo
authors:
  - Matt Brophy
  - Brooks Lybrand
---

Michael Jackson, co-creator of React Router, [said it best](https://x.com/mjackson/status/1927739177149382991):

> React Router isn’t just mine and Ryan’s baby anymore. It is a mature OSS project with millions of dependents. We want everyone to have a say in how the project moves forward.

React Router has been around for over 10 years under the development and oversight of [Michael](https://x.com/mjackson) and [Ryan](https://x.com/ryanflorence). When they obtained funding for Remix in 2021 and built a team around Remix, they also indirectly built a team around React Router. That team has been working on React Router for a few years now and it's time to formalize the process we've loosely been using internally for a while now.

Last week in our ["Wake Up, Remix!"](https://remix.run/blog/wake-up-remix) post, we announced a new [Open Governance Model](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md) for React Router. We planned to announce these in the reverse order: first the governance model so folks knew that React Router wasn't going anywhere, followed by our plans for Remix v3.

However, a leak of an old version of the Remix announcement (you can go find that yourself) forced our hand and we had to get that post out quicker than anticipated. This meant we didn't get to give the new governance model the proper focus and announcement, so we're doing that now. We think it's just as exciting for the community and the future of React Router!

## Motivation

React Router has gone through many major evolutions in it's 10+ year lifetime, many of those dictated by the evolution of React itself (i.e., the introduction of hooks). Recently, with the creation of the Remix framework and merging that into React Router "Framework Mode" in v7, the API surface has increased even more. With the introduction of React 19 and [(soon) RSC support](./rsc-preview), aspects previously handled by React Router are going to be able to be handled by React.

While we don't want to ignore new features moving forward (we have lots of ideas we want to see shipped!), we do want to be cognizant of the increasing surface area and focus on areas in which we can shed some API surface and keep React Router "lean". In addition to shedding responsibility to `React`, we also see opportunities to introduce new APIs that encapsulate the behavior of multiple existing APIs that we can deprecate later on.

## Design Goals

To ensure we're headed in the right direction we want to keep the following design goals in mind as we consider new features moving forward, and we think a more formalized process guided by a [Steering Committee](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#steering-committee) is the best way to do that:

- **Less is More**. React Router has gained a _lot_ of functionality in the past years, but with that comes a bunch of new API surface. It's time to hone in on the core functionality and aim to reduce API surface _without sacrificing capabilities_. This may come in multiple forms, such as condensing a few existing APIs into a singular API, or deprecating a current APIs in favor of a new React API.
- **Routing and Data Focused.** Focus on core router-integrated/router-centric APIs and avoid adding first class APIs that can be implemented in user-land
- **Simple Migration Paths.** Major version upgrade's don't have to stink. Breaking changes should be implemented behind future flags. Deprecations should be properly marked ahead of time in code and in documentation. Console warnings should be added prior to major releases to nudge developers towards the changes they can begin make to prep for the upgrade.
- **Lowest Common Mode.** Features are added at the lowest mode possible (`declarative -> data -> framework`) and then leveraged by the higher-level modes. This ensures that the largest number of React Router applications can leverage them.
- **Regular Release Cadence**. Aim for major SemVer releases on a ~yearly basis so application developers can prepare in advance.

We also hope that this new process will permit more community-driven evolution of React Router and reduce any bottlenecks that can arise in a founder-leader model.

## What's Next?

TODO: clean up all these bullet points, provide links to RFCs, call out all our existing unstable APIs, better point out what React is has solve, instill confidence that we're not removing things that we think are better than React's APIs

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
