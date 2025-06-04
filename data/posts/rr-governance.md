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

> React Router isn't just mine and Ryan's baby anymore. It is a mature OSS project with millions of dependents. We want everyone to have a say in how the project moves forward.

React Router has been around for over 10 years under the development and oversight of [Michael](https://x.com/mjackson) and [Ryan](https://x.com/ryanflorence). When they obtained funding for Remix in 2021 and built a team around Remix, they also indirectly built a team around React Router. That team has been working on React Router for a few years now and it's time to formalize the process we've loosely been using internally for a while now.

Last week in our ["Wake Up, Remix!"](./wake-up-remix) post, we announced a new [Open Governance Model](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md) for React Router. We planned to announce these in the reverse order: first the governance model so folks knew that React Router wasn't going anywhere, followed by our plans for Remix v3.

However, a leak of an old version of the Remix announcement (you can go find that yourself) forced our hand and we had to get that post out quicker than anticipated. This meant we didn't get to give the new governance model proper focus and an announcement, so we're doing that now. We think it's _just as_ exciting for the web community and the future of React Router!

## Motivation

React Router has gone through many major evolutions in its 10+ year lifetime, many of those dictated by the evolution of React itself (i.e., the introduction of hooks). With the recent integration of [Remix v2 into React Router v7](./react-router-v7), the API surface has increased even more. And with the arrival of React 19 and [(soon) RSC support](./rsc-preview), React has taken on aspects previously handled by React Router.

While we don't want to ignore new features moving forward (we have lots of ideas we want to ship!), we do want to be cognizant of the increasing surface area and focus on where we can shed some APIs to keep React Router "lean". In addition to shedding responsibility to `React`, we also see opportunities to introduce new APIs that encapsulate the behavior of multiple existing APIs so we can simplify the project by deprecating them in a future major versions.

## Design Goals

To ensure we're headed in the right direction we want to keep the following design goals in mind as we consider new features moving forward, and we think a more formalized process guided by a [Steering Committee](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#steering-committee) is the best way to do that:

- **Less is More**. React Router has gained a _lot_ of functionality in the past years, but with it comes a bunch of new API surface. It's time to hone in on the core functionality and aim to reduce API surface _without sacrificing capabilities_. This may come in multiple forms, such as condensing a few existing APIs into a singular API, or deprecating current APIs in favor of a new React API.
- **Routing and Data Focused.** Focus on core router-integrated/router-centric APIs and avoid adding first class APIs that can be implemented in user-land
- **Simple Migration Paths.** Major version upgrades don't have to stink. Breaking changes should be implemented behind future flags. Deprecations should be properly marked ahead of time in code and in documentation. Console warnings should be added prior to major releases to nudge developers towards the changes they can begin to make to prep for the upgrade.
- **Lowest Common Mode.** Features are added at the lowest mode possible (`declarative -> data -> framework`) and then leveraged by the higher-level modes. This ensures that the largest number of React Router applications can leverage them.
- **Regular Release Cadence**. Aim for major SemVer releases on a ~yearly basis so application developers can prepare in advance.

We also hope that this new process will permit more community-driven evolution of React Router and reduce any bottlenecks that can arise in a founder-leader model.

## What's ~~Next~~ Coming Up?

In case you haven't noticed, our team has been cooking (we can't spend all our time leaking blog posts and confusing you with our branding).

### Stabilizing Current Unstable Features

React Router v7 has been out just over 6 months, and if you've been watching our [changelog](https://reactrouter.com/changelog) closely, your `react-router.config.ts` file _may_ look like this:

```ts
import type { Config } from "@react-router/dev/config";

export default {
  future: {
    unstable_middleware: true, // finally
    unstable_splitRouteModules: true, // lean, mean route modules
    unstable_subResourceIntegrity: true, // that seems useful
    unstable_viteEnvironmentApi: true, // RSC wen?
    unstable_optimizeDeps: true, // better dev
  },
} satisfies Config;
```

We're feeling pretty good about a lot of these features, so it's about time we start documenting and stabilizing each of them. Hopefully at that point your Staff Engineer will stop yelling at you for using something with an `unstable_` prefix.

### Upcoming Features

We already have plans to add the following:

- [`useRouterState()`](https://github.com/remix-run/react-router/issues/13073) a hook to consolidate router state
- a more type-safe alternative to `useRouteLoaderData()` (should probably write that RFC up 😅)
- a new fancy, faster, and more flexible route pattern matcher (that could be good for Remix _and_ React Router 🤔)
- did we mention [RSC](./rsc-preview) yet?
- even an [`AbsoluteRoutes` component](https://github.com/remix-run/react-router/issues/12959) to help people who are still on v5 upgrade (we see you, you're not alone)

### Opportunities to Simplify React Router

Plus, as mentioned above, we want to take a look at any APIs we can start deprecating in lieu of just-as-good or better React APIs ([`<title>`](https://react.dev/reference/react-dom/components/title), [`<meta>`](https://react.dev/reference/react-dom/components/meta), [`<link>`](https://react.dev/reference/react-dom/components/link), [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition), etc.). Some words of comfort here before you start throwing tables:

- For widely-used APIs such as `meta` and `links` exports, we'll likely deprecate in v8 and remove in v9
- We will not remove an API unless we believe React has an alternative that's _at least as good_ (_cough_ `useFetcher` _cough_)
- If the idea of us deprecating and eventually removing APIs in major versions makes you uncomfortable, please see design goal #1, followed by our post-v4 history of backwards compatibility, as well as our blog post ["Future Proofing Your Remix App"](./future-flags).
  - If you are still upset, please see a Therapist[^1]

The goal here is to simplify React Router's APIs and reduce the number of ways you can do the same thing. This will make it easier for you (and LLMs) to use React Router, and for us to write it. If you are happy with the number of APIs we have, please see our [API reference](https://api.reactrouter.com/v7/modules/react_router.html) and consider if it still sparks joy.

The roadmap to React Router v8 is looking pretty good if we do say so ourselves. We've got some proposals to write and some work to do.

## Open Means Open

While the Steering Committee consists only of members of the Remix team (for now), we genuinely want more feedback and contributions from the wider React Router community.

From the [Governance doc](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#new-feature-process):

> The process for new features being added to React Router will follow a series of stages loosely based on the [TC39 Process](https://tc39.es/process-document/). It is important to note that entrance into any given stage does not imply that an RFC will proceed any further. The stages will act as a funnel with fewer RFCs making it into subsequent stages such that only the strongest RFCs make it into a React Router release in a stable fashion.

Exact details may change (always refer to `GOVERNANCE.md` for the latest), but the basic gist is:

- **Stage 0 - Proposal**: Anyone can write an RFC in GitHub Discussions outlining the use-case and potential API surfaces.
- **Stage 1 - Consideration**: Two or more SC members show support, a GitHub issue is created, and the proposal becomes eligible for PR implementation.
- **Stage 2 - Alpha**: A PR implementing the feature with `unstable_` prefix is opened for early community testing before merging.
- **Stage 3 - Beta**: After SC approval, the feature is merged and included in releases for broader beta testing.
- **Stage 4 - Stabilization**: After one month in beta, a PR is opened to remove `unstable_` prefixes and add documentation.
- **Stage 5 - Stable**: After SC approval of stabilization PR, the stable feature is merged and included in the next appropriate release.

These changes to how React Router is developed are only a slight tweak to how we've been working for years, and will ensure React Router continues evolving for years to come

Time to keep Building Better Websites!

[^1]: This is a joke. Therapy is a legitimate and very useful tool that has helped countless people (including within our team) deal with mental and emotional issues. It should probably not be used for something as small as periodic breaking changes in open source software.
