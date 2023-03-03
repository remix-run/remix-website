---
title: Future Proofing Your Remix App
summary: We've introduced the concept of future flags to give you a best-in-class upgrade path for your Remix app.
featured: true
date: 2023-03-02
image: /blog-images/headers/the-future-is-now.jpg
imageAlt: The Future is Now
authors:
  - Matt Brophy
---

At Remix, we know first-hand just how painful it can be to go through a major version upgrade. Especially for something as foundational to your application as the framework or router it's built on. We want to do our very best to provide you a best-in-class upgrade experience -- let's talk about **"Future Flags"**.

## Status Quo

Every[^1] framework (or library) out there will _at some point_ have to introduce a breaking change. Something that will cause your code _as it's written today_ to not work right anymore on the new version. This could result in a build-time (or even worse, a run-time) error. But these changes are good! It's how our frameworks evolve, get faster, adopt new platform features, implement community-driven feature requests, and so-on. Out of this inherent need for breaking changes came the [Semantic Versioning][semver] (SemVer) specification which defines that breaking changes dictate a new _major_ release version. This is great because it lets application developers know when they should expect their code to require changes on an upgrade, versus when they should expect the upgrade to "just work". Remember though, you should always be reading the release notes and not just blindly upgrading 😉).

[^1]: "Every" and not "All" because I'm sure there's _some_ library out there like `add` that has been humming along at v1.0.0 for years without breaking changes because ... well the semantics of mathematics don't change all that frequently. But you get the idea - things evolve and require breaking changes, unless you're the [DOM][dom] which does a wonderful job with backwards-compatibility.

Conveniently enough, the same day I started writing this article, `@devagrawal09` [tweeted][tweet-5-years] the following which generated a relevant thread of the current state of frameworks and their handling of "major rewrites."

<img alt="Tweet from @devagrawal09 asking 'which javascript framework has lived more than 5 years without causing major rewrites?'" src="/blog-images/posts/future-flags/tweet.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Check back with Remix in 2026!</figcaption>

It's clear from the thread that folks have varying interpretations of "major rewrites," and that frameworks have done this with varying degrees of success over the years. Part of why things are not cut-and-dry here is that while SemVer gives us a way to communicate _when_ breaking changes exist - we do not have a similar agreed-upon process of _how_ to introduce breaking changes in our frameworks and communicate them to application developers. Generally speaking the minimal bar for a major [SemVer][semver] release is a set of release notes which outline the breaking changes in the major release. Ideally these also include instructions on how to go about changing your code to adopt the breaking changes. But that's really it - beyond that there's very little standardization around how to best prepare and help your users adopt breaking changes across major releases.

For that reason, we've seen a ton of different approaches over the years, including but not limited to:

- Writing a [detailed][angular-v2-migration-guide] [migration][react-router-v6-migration-guide] [guide][express-v4-migration-guide]
- Releasing a [preparation version][angular-1.5.0] prior to the major release to better prep your code to adopt the breaking changes
- Releasing a separate package that allows you to run [both][ngupgrade] [versions][vue-migration-build] together
- Creating code-mod tooling that can help update your application code automatically
  - **TODO: Do we know of any good examples here?**

We've seen approaches that work well, and some that don't. However there seems to be a concept consistent across the success stories which is providing a path for application developers to upgrade their applications **iteratively**. At scale, the inability to iteratively upgrade portions of an application becomes problematic. You end up with a long lived `version-N-upgrade` branch that some engineer ends up thanklessly rebasing onto the latest `main` branch on a regular basis, and probably pulling their hair out bit-by-bit in the process.

These long-lived feature branches also tend to be very slow to move along since our stakeholders don't _want_ to stop feature development for a few weeks so we can upgrade our stacks (which are invisible to the customer). They want to keep shipping new features in parallel, so not only are teams only allocating a portion of their capacity to the upgrade, their also dealing with the inherent context switching between the old and new worlds, which causes the upgrade to move even slower.

## Feature Branches

If we look at the how some of the above approaches play out for the application developers, we often see that they involve some form of a long-lived feature branch which incurs the downsides mentioned above.

TODO: Unsure the best way to diagram this. I have a whiteboard of a git-branch-type diagram of the 4 approaches but unsure if there's a better non-git-branch diagram. Mainly want to show how with future flags (ideally) you don't need a long lived branch at all. Each future flag opt-in is just a normal "feature" branch in your v12 app that ships.

- You follow the migration guide in a long-lived feature branch.
- If you're using a "preparation" version, that usually just splits the work into 2 medium-lived feature branches - one to upgrade to the preparation version and another for the major version.
- Migration builds and/or backwards compatibility flags do a better job of eliminating long lived feature branches, but they have a downside of giving you _all_ the new features at once. So when v2 releases, you can "upgrade" but then you are playing catch up for a while as you adopt the breaking changes iteratively and eventually remove the compatibility build or back-compat flags. This also presents a bit of underlying technical risk as running two packages side by side (v2 and v2 "back-compat") is not quite the same as running v2 - so there is a non-zero surface area for bugs to pop up across the inter-communication of the packages.

## Introducing Future Flags

When we first started talking about how to handle breaking changes for Remix, I couldn't help but think back to the [Stability without Stagnation][stability-without-stagnation] talk I watched Yehuda Katz give at [Philly ETE 2016][philly-ete-2016]. I wasn't an Ember developer but that talk left a huge impression on me[^2] about how frameworks could ease the pain of new feature adoption on their users through the use of feature flags. Ryan Florence, however, _was_ an active Ember developer so when I mentioned this talk he immediately knew the "Stability without Stagnation" phrase.

[^2]: Totally unrelated, but just 2 months before that talk AngularJs 1.5.0 had been released in an attempt to provide a smoother path to Angular v2. I was the lead developer on a large AngularJs 1.4.0 e-commerce checkout app at the time and we were well on our way to realizing that Angular v2 was not going to be an upgrade, but rather a full-rewrite 😕.

Later on in my career working on a Vue SSR application, we were preparing for a Vue 2 -> 3 upgrade and I was very excited to see the [Feature Flags][vue-migration-build-feature-flags] they were introducing in their build (although I switched jobs prior to performing that upgrade).

We knew at Remix that this concept of feature flags was crucial if we wanted to be able to provide a smooth upgrade experience for our users. But we wanted to go even further than we'd seen frameworks go before. Even in the best approaches above with back-compt flags - devs are still left with an "here's all the new stuff at once" dump in a major version - leaving them to play catch-up for a period of time. Furthermore this also sort of stacks up all of the v2 code changes one after another, giving you a compacted surface area for potentially nuanced bugs. We wanted to see if we could do better!

At Remix, our goal introducing breaking changes in major versions is two-fold:

1. _Eliminate_ the need for a long-lived feature branch
2. Let you opt-into breaking changes individually _as they are released_

Most approaches try to give you an off-ramp from v1 to v2 _after v2 is released_. Instead, Remix aims to provide you an incremental on-ramp to _eventual_ v2 features as they are released _during the v1 releases_. And if all goes as plan and you stay up to date as new future flags come out, then your code _as it's written today_ will "just work" when you upgrade to a new major version - effectively making major version upgrades no more painful than minor version upgrades 🤯. Additionally, by introducing these features over-time in v1 - we provide a much larger surface area in which application developers can spread out their v2-related code changes. We understand this is a lofty goal, and we know it may not work out exactly as we plan all the time, but we're serious about stability and want to makes rue that our process is considering the burden a major version upgrade can put on our application developers.

We plan to do this via what we're calling **future flags** in the `remix.config.js` file. As we implement new features, we always try to do them in a backwards-compatible way. But when we can't and decide a breaking change is warranted, we don't table that feature up for an eventual v2. We add a future flag and implement the new feature alongside the current behavior in a v1 minor release. This allows users to start using the feature _immediately_ and provide feedback, identify bugs. This means that we can work out some of the kinks _before_ releasing v2 and also allow our developers to eagerly implement v2 breaking while still on v1. Eventually we also then add deprecation warnings to the v1 releases to nudge users to the new behavior. Then in v2 we remove the v1 approach, remove the deprecations, and remove the flag - thus making the flagged behavior the new default. If at the time v2 is released, an application has opted into _all_ future flags and updated their code - then they should just be able to update their Remix dependencies to v2 and delete the future flags from their `remix.config.js` and be running on v2 in a matter of minutes.

## Unstable vs. V2 Flags

Future flags can come in one of 2 forms: `future.unstable_feature` or `future._v2_feature` and the lifecycle of a flag will depend on the natur eof the change and if it's breaking or not.

Consider a new feature we want to implement in Remix - let's call it "speedy routing" since speed is all the hype these days. the decision flow for this new feature would go something like this:

- Can we implement this feature in a backwards-compatible way?
  - If yes, are we confident in the API for this feature?
    - If yes, awesome! We can implement it and ship it without any flags 🚀
    - If no, that's ok too!
      - Let's get this out to the community for feedback on the API
      - We implement this feature behind a `future.unstable_speedyRouting` flag
      - Early adopters can use the feature and provide feedback and we can iterate if needed
      - When we feel the API is stable, we remove the future flag and the non-breaking change lands in v1
  - If no, are we confident in the API for this feature?
    - If yes, awesome!
      - We implement this feature behind a `future.v2_speedyRouting` flag
      - Early adopters can use the feature and report any bugs they find
      - At some pint we add deprecation warnings to v1
      - When v2 releases this becomes the new default behavior
    - If no, that's ok too!
      - Let's get this out to the community for feedback on the API
      - We implement this feature behind a `future.unstable_speedyRouting` flag
      - Early adopters can use the feature provide feedback and we can iterate if needed
      - When we feel the API is stable, we convert it to a `future.v2_speedyRouting` flag
      - Early adopters can use the feature and report any bugs they find
      - At some pint we add deprecation warnings to v1
      - When v2 releases this becomes the new default behavior

The lifecycle is thus either:

- Non-Breaking + Stable API Feature -> Lands in v1
- Non-Breaking + Unstable API -> `future_unstable_` flag -> Lands in v1
- Breaking + Stable API Feature -> `future.v2_` flag -> Lands in v1
- Breaking + Unstable API -> `future_unstable_` flag -> `future.v2_` flag -> Lands in v1

And for clarification - `unstable_` here _does not mean_ that we think the feature is bug-ridden! It means that we're not 100% confident the API won't undergo some minor changes before it stabilizes. We _absolutely_ want Early Adopters to start using these features so we can iterate on (or gain confidence in) the API.

And furthermore, a `v2_` flag does not mean the feature is bug-free - no software is! This means that we are confident in the API and consider it the stable API for the default behavior in v2. This means that if you update your code to use this new API in v1, you can make your v2 upgrade _much_ smoother.

## Current Future Flags in Remix v1

Here's a list of the current flags in Remix v1 today:

- `unstable_cssModules` - Enable CSS Modules Support
- `unstable_cssSideEffectImports` - Enable CSS Side Effect imports
- `unstable_dev` - Enable the new development server (including HMR/HDR support)
- `unstable_postcss` - Enable PostCSS Support
- `unstable_tailwind` - Enable TailwindCSS support
- `unstable_vanillaExtract` - Enable Vanilla Extract Support
- `v2_errorBoundary` - Combine `ErrorBoundary`/`CatchBoundary` into a single `ErrorBoundary`
- `v2_meta` - Enable the new API for your `meta` functions
- `v2_routeConvention` - Enable the flat routes style of file-based routing

**TODO: Link to docs**

[semver]: https://semver.org/
[dom]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
[react-router-v6-migration-guide]: https://reactrouter.com/en/main/upgrading/v5
[angular-v2-migration-guide]: https://angular.io/guide/upgrade
[ngupgrade]: https://angular.io/guide/upgrade#upgrading-with-ngupgrade
[angular-1.5.0]: https://www.infoworld.com/article/3031266/angular-150-paves-the-way-for-angular-2.html
[tweet-5-years]: https://twitter.com/devagrawal09/status/1631153991215202304
[express-v4-migration-guide]: https://expressjs.com/en/guide/migrating-4.html
[vue-migration-build]: https://v3-migration.vuejs.org/migration-build.html
[vue-migration-build-feature-flags]: https://v3-migration.vuejs.org/migration-build.html#feature-reference
[philly-ete-2016]: https://2016.phillyemergingtech.com/schedule/
[stability-without-stagnation]: https://www.youtube.com/watch?v=R6x7ZGUL3Sk
