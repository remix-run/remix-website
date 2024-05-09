---
title: React Router v7
summary: We're remixing React Router (again), and we're convinced this is going to be the best version yet.
featured: true
date: 2024-05-15
# TODO: Add a new blog image
image: /blog-images/posts/remixing-react-router/image.jpg
imageAlt: React Router Logo
hidden: true
authors:
  - Brooks Lybrand
---

We've been building a bridge

<img alt="React Router logo with an arrow pointing to the Remix logo" src="/blog-images/posts/react-router-v7/react-router-to-remix.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

For nearly 4 years we've been working on Remix, a fullstack framework built on web standards to help you build better websites and applications. React Router has always been Remix's largest dependency aside from React itself. The projects are so closely aligned that we've [updated React Router][remixing-react-router] to include Remix's great loading patterns, and later [rewrote Remix][react-routering-remix] to _even more directly depend_ on React Router.

Remix has always sort of been **"React Router: The Framework"**, and since [the React docs recommend using a framework][use-a-framework], we wanted to create a bridge for the millions of projects using React Router to be able to upgrade to Remix.

Turns out we made that bridge a little two well, specifically with the introduction of [our Vite plugin][remix-vite-stable] and [SPA Mode][spa-mode]. We found ourselves looking at Remix, then looking at React Router, then looking back at Remix, and we could no longer meaningful see a difference.

So we're remixing React Router (again).

Actually, we're doing a little more than that. What we planned to release as **Remix v3** is now going to be released as **React Router v7**.

Here's the story.

## 10 years of React Router

We just pass the [10 year anniversary of the first React Router commit][react-router-first-commit]. Needless to say, [Ryan][ryan-florence] and [Michael][michael-jackson] have been building and maintaining React Router for a _long_ time, and it's undergone several major iterations. Some of those iterations have made individuals so angry they've expressed the desire to do bodily harm to these two maintainers (that's another story for another day). Don't worry, our team is much better at [smooth major version upgrades][future-flags] now.

For the first 6 years, React Router was just an open source project that Michael and Ryan would work on when they had breaks between teaching people how to use React through their company [React Training][react-training]. Fast forward to a global pandemic that forced them to find a new way to put food on the table. That's when they decided to found a new company with the goal of building **"React Router: The Framework"** (better known as Remix). 4 years and [1 acquisition][remixing-shopify] later they now have a team of 6 engineers actively working on React Router and Remix (and 1 who Tweets about that work).

For 10 years, React Router has found itself to steadily be one of the most widely used dependencies in the React Ecosystem. Just looking at the number of public GitHub repositories using React Router fills us on the Remix team with a tremendous amount of responsibility for these projects.

<img alt="React Router's repo on GitHub is used by 7.8m other projects" src="/blog-images/posts/react-router-v7/react-router-usage.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

Shopify itself heavily depends on React Router. In fact, we currently have a 5 million line application that is very core to Shopify's business running on React Router. That's just one of many Shopify sites using React Router.

<img alt="Shopify logo with text reading 5m lines and a ton of other apps" src="/blog-images/posts/react-router-v7/react-router-usage-shopify.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

## Building better websites

While React Router is great, Remix was created because it's a better way to build better websites with React. Remix gives you some really amazing features we want these millions of projects be able to take advantage of:

- Automatic code splitting
- Simplified data loading
- Form Actions, Server actions
- Simplified pending states
- Optimistic UI
- Server rendering
- Static pre-rendering
- RSC (soon)

In the past, [Create React App][cra] (CRA) was the simplest way to bootstrap a React application. It handled and hid the complexity of setting up webpack and Babel, and when new features were added to React, `react-scripts` supported them from the beginning.

However, CRA has never provided a router, a data fetching solution, or any of those features listed above. That wasn't the purpose of CRA. It was a simple React app starter that allowed you to use whatever libraries from the React ecosystem you liked. Many projects bootstrapped with CRA use React Router for routing, which means there are a large number of "CRA apps" that are also "React Router apps".

In 2024 CRA is no longer a viable way to bootstrap React applications, and it hasn't been for a while. It's been nearly a year since the last commit to CRA, and commits slowed down considerably leading up to it. At this point, CRA is considered unmaintained, and [the React docs don't even recommend using it][react-start-a-project].

So now not only do we feel a huge responsibility for all the React Router apps, we also believe there is a large, unmet need for a good CRA replacement.

<img alt="Create React App GitHub showing the last 3 commits from June 14, 2023, May 29, 2023, and Sep 8, 2022. There is a cartoon tombstone to the right with RIP engraved on it" src="/blog-images/posts/react-router-v7/rip-cra.png" class="rounded-md shadow-lg" />

At the same time, [Vite][vite] has risen substantially in popularity, offering a fast dev experience, optimized builds, and a rich plugin ecosystem and authoring experience.

Vite provides a default React starter, and for many has taken up the mantel of the "CRA replacement". This was good, but it still doesn't provide a solution like the React docs recommend, and it certainly doesn't provide all of the features we think React apps should care about. In fact, [the Vite team even prefers the CRA replacement come from deeper within the React community][patak-remix-cra-tweet].

<img alt="NPM trends of @vitejs/plugin-react vs react-scripts with @vitejs/plugin-react overtaking react-scripts" src="/blog-images/posts/react-router-v7/vite-ftw.png" class="rounded-md shadow-lg" />

Last fall we decided to [bet on Vite][remix-heart-vite] and start deprecating our classic compiler. The Vite team and community have been very accepting and supportive, and we're excited to be one of many great projects building on top of Vite.

Switching to Vite opens up Remix to even more users. We also added [SPA mode][spa-mode] mode and [Client Data][client-data] to create the best bridge we possibly could to _convince devs with React Router apps to migrate to Remix_ and take advantage of all the great features it has to offer. After all, at this point what is Remix but React Router + Vite?

<img alt="React Router logo plus Vite logo equals Remix logo" src="/blog-images/posts/react-router-v7/rr-plus-vite-is-remix.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

## Modern React without a rewrite

There's a problem with the statement

> convince devs with React Router apps to migrate to Remix

The problem is that 2-syllable, multi-sprint, call-for-tshirt-sizing, manager-fear-inducing, quarter-spanning word **_migration_**.

Our strategy up until now has been to make the bridge from a React Router app to Remix so seamless it doesn't even feel like a migration. From prior experience, we really prefer to keep our [poker planning][poker-planning] short. The problem is, no matter how good of a job we do building that bridge, it still _feels_ like a rewrite. Emotionally, changing an import from one package to another feels like a rewrite, otherwise it would just be a major version upgrade.

So we had a thought: _what if it was just a major version upgrade?_

Turns out we've been making that **Remix ➡️ React Router** bridge a little too well, and now Remix and React Router are basically the same thing (minus Vite). If we just ship a Vite plugin for React Router, the two projects could be merged.

So that's what we're gonna do.

<img alt="React Router logo plus Vite logo equals React Router logo with a v7 under it" src="/blog-images/posts/react-router-v7/rr-plus-vite-is-rr-7.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

We want everyone in the React ecosystem to have access to

- Automatic code splitting
- Simplified data loading
- Form Actions, Server actions
- Simplified pending states
- Optimistic UI
- Server rendering
- Static pre-rendering
- RSC (soon)

We want that 5 million line Shopify app, those 7+ million React Router projects, and all the other sites we don't know about to be able to easily upgrade and take advantage of the latest and greatest React has to offer. We want creating a new React app to be easy and scalable.

That's why we're just making it a major version upgrade.

## How to upgrade

As of today we've released an alpha version of React Router v7.

```sh
npm install react-router@alpha
```

Both Remix and React Router leverage [future flags][future-flags], and the general flow is:

1. Upgrade to the latest minor version of Remix or React Router
2. Enable all feature flags
3. Replace imports with `react-router`

We are committed to making both upgrade paths non-breaking except for changing imports, assuming you have all future flags enabled and are using Vite.

We also plan to provide codemods and keep our guides up-to-date to provide the most straightforward, pain-free upgrade path we possibly can:

- [Remix ➡️ React Router v7 guide][upgrade-guide-remix]
- [React Router v6 ➡️ React Router v7 guide][upgrade-guide-v6]

If you have any questions, please don't hesitate to [reach out on to us on Discord][remix-discord].

## What's happening to Remix

You may be wondering: _"what's going to happen to Remix?"_ Fair question.

We're not going anywhere. Remix the package is gonna take a little nap. We have a ton of ideas we've been workshopping and are eager to get right and get into your hands. The Remix team is going to be heads down shipping React Router v7 and delivering the smoothest upgrade process we possibly can. Our goal is that if you're on the latest minor or Remix v2 or React Router v6 you can just codemod and script your way to React Router v7.

In the meantime the `@remix-run` packages are gonna hibernate for a bit.

<img alt="Remix logo with a sleeping emoji" src="/blog-images/posts/react-router-v7/sleepy-remix.jpeg" class="w-full aspect-[16/9] rounded-md shadow-lg" />

But we don't expect Remix to be asleep forever.

With any project that's been around for 4 years (or 10 years) you learn a lot along the way, and have to wrestle with the urge to throw everything away and start from scratch without the baggage of early APIs and design decisions. On top of that, we believe React Server Components really change the game, but they're a new primitive to build on top of, and just like everyone we're discovering the best way to do that.

So [subscribe][remix-newsletter] (or stay subscribed) to our newsletter, follow us on [Twitter][remix-twitter], and join our [Discord][remix-discord] to stay up to date on all the latest.

We're more energized than ever to keep helping people **build better websites**.

---

[remix-vite-stable]: remix-vite-stable
[spa-mode]: https://remix.run/docs/en/main/guides/spa-mode
[remixing-react-router]: remixing-react-router
[react-routering-remix]: react-routering-remix
[use-a-framework]: https://react.dev/learn/start-a-new-react-project#can-i-use-react-without-a-framework
[react-start-a-project]: https://react.dev/learn/start-a-new-react-project#can-i-use-react-without-a-framework
[future-flags]: future-flags
[upgrade-guide-v6]: https://reactrouter.com/en/v7/upgrading/v6
[upgrade-guide-remix]: https://reactrouter.com/en/v7/upgrading/remix
[remix-discord]: rmx.as/discord
[react-router-first-commit]: https://github.com/remix-run/react-router/commit/987de78deb9687f15133188f2e8e51ffd653794d
[ryan-florence]: https://twitter.com/ryanflorence
[michael-jackson]: https://twitter.com/mjackson
[react-training]: https://reacttraining.com/
[remixing-shopify]: remixing-shopify
[cra]: https://create-react-app.dev/
[vite]: https://vitejs.dev/
[remix-heart-vite]: remix-heart-vite
[client-data]: https://remix.run/docs/en/main/guides/client-data
[remix-newsletter]: https://rmx.as/newsletter
[remix-twitter]: https://twitter.com/remix_run/
[patak-remix-cra-tweet]: https://twitter.com/patak_dev/status/1747890238058352988
[poker-planning]: https://en.wikipedia.org/wiki/Planning_poker
