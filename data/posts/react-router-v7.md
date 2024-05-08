---
# TODO: clean up title and summary
title: React Router v7
summary: Remix v3 (SIKE!)
featured: true
date: 2024-05-15
# TODO: Add a new blog image
image: /blog-images/posts/remixing-react-router/image.jpg
imageAlt: A waterfall down a series of rocks shaped like a stairway
authors:
  - Brooks Lybrand
---

We've been building a bridge.

<img alt="React Router logo with an arrow pointing to the Remix logo" src="/blog-images/posts/react-router-v7/react-router-to-remix.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

For nearly 4 years we've been building Remix, a fullstack framework built on web standards with the purpose of helping you build better websites and applications. Next to React, React Router has always been the largest Remix dependency, so much so that we've [rewritten React Router][remixing-react-router] to include Remix's great loading patterns, and even [rewrote Remix][react-routering-remix] to _even more directly_ depend on React Router.

Remix has always sorta been "React Router: The Framework", and since [React recommends using a framework][use-a-framework], we wanted to create a great bridge for the millions of React Router users to upgrade to Remix if they were so inclined.

Turns out we made that bridge a little two well, specifically with the introduction of [our Vite plugin][remix-vite-stable] and [SPA Mode][spa-mode]. We found ourselves looking at Remix, then looking at React Router, then looking back at Remix, and we could no longer meaningful see a difference.

So we're remixing React Router (again).

Actually, we're doing a little more than that. What we originally planned to release as **Remix v3** is now going to be released as **React Router v7**.

## 10 years of React Router

We just pass the [10 year anniversary of the first commit to React Router][react-router-first-commit]. [Ryan][ryan-florence] and [Michael][michael-jackson] have been building and maintaining React Router for a _long_ time, and it's undergone several major iterations. Some of those iterations have made individuals so angry they've expressed the desire to do bodily harm to these two maintainers (that's another story for another day).

For the first 6 years, React Router was just an open source project that Michael and Ryan worked on when they had breaks between teaching people how to use React at [React Training][react-training]. They then founded a company and decided to build _React Router: The Framework_ (better known as Remix). 4 years and [1 acquisition][remixing-shopify] later, and they now have a team of 6 actively working on React Router and Remix (and 1 employee who Tweets about the work).

Next to the core React packages themselves, it's not a far-fetched statement to say that React Router is the largest used dependency in the React Ecosystem. Just looking at the number of public GitHub repositories using React Router, we feel a tremendous amount of responsibility for all of these projects.

<img alt="React Router's repo on GitHub is used by 7.8m other projects" src="/blog-images/posts/react-router-v7/react-router-usage.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

On top of that, Shopify itself heavily depends on Remix for a very core 5 million line application, as well as a number of other sites.

<img alt="Shopify logo with text reading 5m lines and a ton of other apps" src="/blog-images/posts/react-router-v7/react-router-usage-shopify.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

## Building better websites

We have been building Remix because we think it's the best way to build better websites with React. Remix gives you some really amazing features we want to see all of these projects be able to take advantage of:

- Automatic code splitting
- Simplified data loading
- Form Actions, Server actions
- Simplified pending states
- Optimistic UI
- Server rendering
- Static pre-rendering
- RSC is coming

In the past, [Create React App][cra] (CRA) was the simplest way to bootstrap a React application. It handled and hid the complexity of setting up webpack and Babel, and when new features were added to React, `react-scripts` supported them from the beginning.

However, CRA has never provided a router, a data fetching solution, or any of the features listed above. That wasn't the purpose of CRA, it was a simple React app starter that allowed you to use whatever libraries from the React ecosystem you liked. Many CRA apps, reached for React Router, which means there's a large number of "CRA apps" that are also "React Router apps".

At this point in time though, CRA is no longer a viable way to bootstrap React applications. It's been nearly a year since the last commit to CRA, and commits slowed down considerably leading up to it. At this point, CRA is considered unmaintained, and [the React docs don't even recommend using it][react-start-a-project]. So not only do we feel a responsibility for all the CRA/React Router apps, we also feel there is a large, unmet need in the React ecosystem right now.

<img alt="Create React App GitHub showing the last 3 commits from June 14, 2023, May 29, 2023, and Sep 8, 2022. There is a cartoon tombstone to the right with RIP engraved on it" src="/blog-images/posts/react-router-v7/rip-cra.png" class="rounded-md shadow-lg" />

At the same time, [Vite][vite] has risen substantially in popularity, offering a fast dev experience, optimized builds, and a rich plugin ecosystem and authoring experience.

Vite provides a default React starter, and for many has taken up the mantel of the "CRA replacement". This was good, but it still doesn't provide a solution like the React docs recommend, and it certainly doesn't provide all of the features we think React apps should care about. In fact, [the Vite team even prefers the start come from deeper within the React community][TODO: add Vite tweet when twitter is unblocked].

<img alt="NPM trends of @vitejs/plugin-react vs react-scripts with @vitejs/plugin-react overtaking react-scripts" src="/blog-images/posts/react-router-v7/vite-ftw.png" class="rounded-md shadow-lg" />

Last fall we decided to [bet on Vite][remix-heart-vite] and start deprecating our classic compiler. The Vite team and community has been very accepting and supportive, and we're excited to be one of many great projects building on top of Vite.

Switching to Vite opens up Remix to even more users. We also added [SPA mode][spa-mode] mode and [Client Data][client-data] to create the best bridge we possibly could to convince devs with React Router apps to migrate to Remix and take advantage of all the great features it offers. After all, at this point Remix is just React Router + Vite.

<img alt="React Router logo plus Vite logo equals Remix logo" src="/blog-images/posts/react-router-v7/rr-plus-vite-is-remix.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

## Modern React without a rewrite

There's a problem with the statement

> convince devs with React Router apps to migrate to Remix

The problem is that 2-syllable, multi-sprint, call-for-tshirt-sizing, manager-fear-inducing word **_migration_**.

Our strategy up until now has been to make the bridge from a React Router app to Remix so seamless it doesn't even feel like a migration. The problem is, no matter how good a job we do building that bridge, it still _feels_ like a rewrite. Emotionally, changing an import from one package to another feels like a rewrite, otherwise it would just be a major version upgrade.

HERE

That's why we're

Our first strategy: Vite + SPA mode

React Router + Vite = React Router v7

<img alt="React Router logo plus Vite logo equals React Router logo with a v7 under it" src="/blog-images/posts/react-router-v7/rr-plus-vite-is-rr-7.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

- commitment non-painful major upgrades: Future flags
- the only difference between react router and Remix is the vite plugin

## How to upgrade

As of today we have released an alpha version of React Router v7.

```sh
npm install react-router@alpha
```

Both Remix and React Router leverage [future flags][future-flags], and the general flow is:

1. Upgrade to the latest minor version of Remix or React Router
2. Enable all feature flags
3. Replace imports with `react-router`

We are committed to both upgrades with all future flags to be non-breaking except for changing imports.

We also plan to provide codemods and keep our guides up to date to account to provide the most straightforward, pain-free upgrade path we possibly can:

- [Remix to React Router v7 upgrade guide][upgrade-guide-remix]
- [React Router v6 to v7 upgrade guide][upgrade-guide-v6]

If you have any questions, please don't hesitate to [reach out on to us on Discord][remix-discord].

## What's happening to Remix

<img alt="Remix logo with a sleeping emoji" src="/blog-images/posts/react-router-v7/sleepy-remix.jpeg" class="w-full aspect-[16/9] rounded-md shadow-lg" />

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
