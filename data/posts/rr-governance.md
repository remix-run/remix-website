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

## What's ~~Next~~ Coming Up?

In case you haven't noticed, our team has actually been cooking (we can't spend all our time leaking blog posts and confusing you with our branding).

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

We're feeling pretty good about a lot of these features, so it's about time to documenting and stabilizing each of them so your Staff Engineer can stop yelling at you for using something with an `unstable_` prefix.

Additionally, we have plans to add:

- [`useRouterState()`](https://github.com/remix-run/react-router/issues/13073) a hook to consolidate router state
- a more type safe alternative to `useRouteLoaderData()` (should probably write that RFC up 😅)
- a new fancy, faster, and more flexible route pattern matcher (that could be good for Remix _and_ React Router 🤔)
- did we mention [RSC](./rsc-preview) yet?
- even an [`AbsoluteRoutes` component](https://github.com/remix-run/react-router/issues/12959) to help people who are still on v5 upgrade (we see you, you're not alone)

Plus, as mentioned above, we want to take a look at any APIs we can start deprecating in lieu of just-as-good or better React APIs ([`<title>`](https://react.dev/reference/react-dom/components/title), [`<meta>`](https://react.dev/reference/react-dom/components/meta), [`<link>`](https://react.dev/reference/react-dom/components/link), [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition), etc.). Some words of comfort here before you start throwing tables:

- For integral APIs such as `meta` and `links` exports, we'll likely deprecate in v8 and remove in v9
  - Thanks React for showing OSS the way on this one, although we'll try to move a little faster than `forwardRef`
- We will not remove APIs if we don't feel React has _at least_ as good of a replacement (_cough_ `useFetcher` _cough_)
- If the idea of us deprecating and eventually removing APIs in major versions makes you uncomfortable, please see design goal #1, followed by our post-v4 history of backwards compatibility and blog post ["Future Proofing Your Remix App"](./future-flags.md).
  - If you are still upset, please see a Therapist[^1]

The goal here is to simplify React Router's APIs and reduce the number of ways you can do the same thing. This will make it easier for you (and LLMs) to use React Router, and for us to write it. If you are happy with the number of APIs we have, please see our [API reference](https://api.reactrouter.com/v7/modules/react_router.html).

The roadmap to React Router v8 is looking pretty good. We've got some proposals to write and some work to do.

## Open Means Open

While the Steering Committee consists only of members of the Remix team (for now), we genuinely want more feedback and contributions from the wider React Router community.

From the [Governance doc](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#new-feature-process):

> The process for new features being added to React Router will follow a series of stages loosely based on the [TC39 Process](https://tc39.es/process-document/). It is important to note that entrance into any given stage does not imply that an RFC will proceed any further. The stages will act as a funnel with fewer RFCs making it into subsequent stages such that only the strongest RFCs make it into a React Router release in a stable fashion.

Exact details may change (always refer to the `GOVERNANCE.md` for the latest), but the basic gist is:

- **Stage 0 - Proposal**: Anyone can write an RFC in GitHub Discussions outlining the use-case and potential API surfaces.
- **Stage 1 - Consideration**: Two or more SC members show support, a GitHub issue is created, and the proposal becomes eligible for PR implementation.
- **Stage 2 - Alpha**: A PR implementing the feature with `unstable_` prefix is opened for early community testing before merging.
- **Stage 3 - Beta**: After SC approval, the feature is merged and included in releases for broader beta testing.
- **Stage 4 - Stabilization**: After one month in beta, a PR is opened to remove `unstable_` prefixes and add documentation.
- **Stage 5 - Stable**: After SC approval of stabilization PR, the stable feature is merged and included in releases.

These changes to how React Router is developed in practice is only a slight tweak to how we've been working for years. The benefit is it will ensure React Router continue evolving for years to come

Time to keep Building Better Websites!

[^1]: This is a joke. Therapy is a legitimate and very useful tool that has helped countless people (including members of our team) deal with mental and emotional issues. It should probably not be used for something as small as periodic OSS breaking changes.
