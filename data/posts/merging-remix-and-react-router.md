---
title: Merging Remix and React Router
summary: We've been building a bridge from React Router to Remix, and we made it so good that we're going to merge the two projects.
featured: true
date: 2024-05-15
image: /blog-images/posts/merging-remix-and-react-router/remix-to-react-router.jpeg
imageAlt: Remix logo pointing to React Router logo
hidden: true
authors:
  - Brooks Lybrand
---

We've been building a bridge. You can hear Ryan talk about this announcement at React Conf 🎥

<iframe style="width:100%;aspect-ratio:16/9;" src="https://www.youtube.com/embed/ZcwA0xt8FlQ?si=vNgdHMWQIHpDyXb5" title="React Conf 2024" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

For nearly 4 years we've been working on Remix, a fullstack framework built on web standards to help you build better websites and applications. React Router has always been Remix's largest dependency after React itself. The two projects are so closely aligned that we [updated React Router][remixing-react-router] to include Remix's great loading patterns, and later [rewrote Remix][react-routering-remix] to _even more directly depend_ on React Router.

There are millions of projects using React Router, many built on top of Create React App (CRA). These days CRA is no longer recommended and [the React docs recommend using a framework][use-a-framework]. Since Remix has always been effectively **"React Router: The Framework"**, we wanted to create a bridge for all these React Router projects to be able to upgrade to Remix.

Turns out we made that bridge a little too well, specifically with the introduction of [our Vite plugin][remix-vite-stable] and [SPA Mode][spa-mode]. We found ourselves looking at Remix, then looking at React Router, then looking back at Remix, and we could no longer meaningful tell the difference.

<img alt="Spider-man as Remix pointing to spider-man as React Router" src="/blog-images/posts/merging-remix-and-react-router/remix-react-router-spider-man.png" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

So we're remixing React Router (again).

Actually, we're doing a little more than that. Remix has always just been a layer on top of React Router - and that layer has been shrinking over time. It's now so small that we're just going to eliminate it. What we planned to release as **Remix v3** is now going to be released as **React Router v7**.

**TL;DR:** React Router is getting everything that's great about Remix (and more!) in the next version. Remix users should keep using Remix and switch to React Router v7 when it's released by just changing the imports. We have plans for the future of the Remix packages we're excited to share as soon as we can.

Read our follow up post, [Incremental Path to React 19][follow-up-post], for more insight into this decision and answers to common questions.

Here's the story:

## 10 years of React Router

We just passed the [10 year anniversary of the first commit to React Router][react-router-first-commit] 🎉

[Ryan][ryan-florence] and [Michael][michael-jackson] have been building and maintaining React Router for a _long_ time, and it's undergone several major iterations. For the first 6 years, React Router was just an open source project that Michael and Ryan would work on when they had breaks between teaching people how to use React at [React Training][react-training]. Fast-forward to a global pandemic that forced them to find a new way to put food on the table and the two of them decided to build **"React Router: The Framework"** (better known as Remix). 4 years and [1 acquisition][remixing-shopify] later, they now have a team of 6 engineers actively working on React Router and Remix (and 1 who Tweets about the work).

For 10 years, React Router has remained one of the most widely used dependencies in the React Ecosystem. Just looking at the number of public GitHub repositories using React Router fills us on the Remix team with a tremendous amount of responsibility for these projects.

<img alt="React Router's repo on GitHub is used by 7.8m other projects" src="/blog-images/posts/merging-remix-and-react-router/react-router-usage.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

Shopify itself heavily depends on React Router. In fact, we currently have a 5 million line application that is very core to Shopify's business running on React Router. That's just one of many Shopify sites using React Router.

<img alt="Shopify logo with text reading 5m lines and a ton of other apps" src="/blog-images/posts/merging-remix-and-react-router/react-router-usage-shopify.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

## Building better websites

While React Router is great, Remix was created because it's a better way to build websites with React. Remix gives you some really amazing features we want these millions of projects be able to take advantage of:

- Automatic code splitting
- Simplified data loading
- Form Actions, Server actions
- Simplified pending states
- Optimistic UI
- Server rendering
- Static pre-rendering
- RSC (soon)

In the past, [Create React App][cra] (CRA) was the simplest way to bootstrap a React application. It handled and hid the complexity of setting up webpack and Babel, and when new features were added to React, `react-scripts` supported them from the beginning.

However, CRA didn't provide a router, a data fetching solution, or any of the features listed above. That wasn't the purpose of CRA. It was a simple React app starter that allowed you to use whatever libraries from the React ecosystem you liked. Many projects bootstrapped with CRA use React Router for routing, which means there are a large number of "CRA apps" that are also "React Router apps".

These days CRA is no longer a recommended way to create React applications, and it hasn't been for a while. It's been nearly a year since the last commit to CRA, and commits slowed down considerably leading up to it. At this point, CRA is considered unmaintained, and [the React docs don't even recommend using it][react-start-a-project].

<img alt="Create React App GitHub showing the last 3 commits from June 14, 2023, May 29, 2023, and Sep 8, 2022. There is a cartoon tombstone to the right with RIP engraved on it" src="/blog-images/posts/merging-remix-and-react-router/rip-cra.png" class="rounded-md shadow-lg" />

So not only do we feel a huge responsibility for all the React Router apps, we also believe there is a large, unmet need for a good CRA replacement.

At the same time, [Vite][vite] has risen substantially in popularity, offering a fast dev experience, optimized builds, and a rich plugin ecosystem and authoring experience.

Vite provides a default React starter, and for many has taken up the mantel of the "CRA replacement". This is good, but it still doesn't provide a solution like the React docs recommend, and it certainly doesn't provide all of the features we think React apps should care about. In fact, [the Vite team even prefers the CRA replacement come from deeper within the React community][patak-remix-cra-tweet].

<img alt="NPM trends of @vitejs/plugin-react vs react-scripts with @vitejs/plugin-react overtaking react-scripts" src="/blog-images/posts/merging-remix-and-react-router/vite-ftw.png" class="rounded-md shadow-lg" />

Last fall we decided to [bet on Vite][remix-heart-vite] and start deprecating our classic compiler. The Vite team and community have been very accepting and supportive, and we're excited to be one of many great projects building on top of Vite.

Switching to Vite opens up Remix to even more users. We also added [SPA mode][spa-mode] and [Client Data][client-data] to create the best bridge we possibly could to _convince devs with React Router apps to migrate to Remix_ and take advantage of all the great features it has to offer. After all, at this point what is Remix but React Router + Vite?

<img alt="React Router logo plus Vite logo equals Remix logo" src="/blog-images/posts/merging-remix-and-react-router/rr-plus-vite-is-remix.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

## Modern React without a rewrite

There's a problem with the statement

> convince devs with React Router apps to migrate to Remix

The problem is that 2-syllable, multi-sprint, call-for-tshirt-sizing, manager-fear-inducing, quarter-spanning word **_migrate_** 😱

Our strategy up until now has been to make the bridge from a React Router app to Remix so seamless it doesn't even feel like a migration. From personal experience at other gigs, we all prefer keeping our [poker planning][poker-planning] short. The problem is, no matter how good of a job we do building that bridge, it still _feels_ like a rewrite. Emotionally, changing an import from one package to another feels like a rewrite, otherwise it would just be a major version upgrade.

So we had a thought: _what if it was just a major version upgrade?_

Turns out we made that **Remix ➡️ React Router** bridge a little too well, and now Remix and React Router are basically the same thing (minus Vite). If we just ship a Vite plugin for React Router, the two projects could be merged.

So that's what we're gonna do.

<img alt="React Router logo plus Vite logo equals React Router logo with a v7 under it" src="/blog-images/posts/merging-remix-and-react-router/rr-plus-vite-is-rr-7.jpeg" class="w-full aspect-[16/9] border border-gray-100/60 rounded-md shadow-lg" />

We want everyone in the React ecosystem to have access to

- Automatic code splitting
- Simplified data loading
- Form Actions, Server actions
- Simplified pending states
- Optimistic UI
- Server rendering
- Static pre-rendering
- RSC (soon)

We want that 5 million line Shopify app, those 7+ million React Router projects on GitHub, and all the other sites we don't know about to be able to easily upgrade and take advantage of the latest and greatest React has to offer. We want creating a new React app to be easy and scalable.

That's why we're just making it a major version upgrade.

## What's next?

We are working hard to stabilize React Router v7 and will be sharing early releases to gather feedback as we go. We are determined to make upgrading as smooth as possible. Both Remix and React Router leverage [future flags][future-flags], and the general upgrade flow will be:

1. Upgrade to the latest minor version of Remix or React Router
2. Enable all feature flags
3. Change `@remix-run/*` dependencies to `react-router` in your `package.json`
4. Replace `@remix-run/*` imports with `react-router`

We are committed to making both upgrade paths non-breaking except for changing imports, assuming you have all future flags enabled and are using Vite.

We also plan to provide codemods and dedicated guides to provide the most straightforward, pain-free upgrade path we possibly can

If you have any questions, please don't hesitate to [reach out on to us on Discord][remix-discord].

## What's happening to Remix

You may be wondering: _"what's going to happen to Remix?"_ Fair question.

**What does this mean if I'm currently using Remix?**

If you're currently using Remix, keep using it! We're going to be shipping more future flags and continuing to improve Remix as we prep for React Router v7. Once we release React Router v7 we'll provide a codemod to automatically update all of your imports

```tsx
- import { Link } from `@remix-run/react`
+ import { Link } from `react-router`
```

**What does this mean if I was excited to try Remix?**

Go ahead and use it! The upgrade to React Router v7 (once it's ready) will just be a codemod to change all your imports (see above).

If you'd prefer to use React Router 6, that's great too. [We've already ported a lot of goodies from Remix into React Router][remixing-react-router]. However, you won't get a lot of the features Remix gives you out of the box like SSR, prefetching, or the Vite plugin until we release them in React Router v7.

**What does this mean if I'm on React Router and was planning to migrate to Remix?**

We are heads-down on releasing React Router v7 and getting it into your hands ASAP. If you can't wait till v7 and want all the amazing features that come with Remix, go ahead and upgrade to it. The move from Remix to React Router will just be a codemod that updates your imports. If you _can wait_, then keep your eyes peeled as we wrap up React Router v7 and give you all these new goodies

As for the Remix brand, it's not going anywhere. We are the Remix team, React Router is a Remix project, and we have really exciting plans beyond React Router we can't wait to talk about. The Remix packages are going to take a little nap. Right now the Remix team is going to be heads down shipping React Router v7 and delivering the smoothest upgrade process we possibly can.

<img alt="React Router versions on a line with Remix versions crossing over. They cross at React Router v7 and Remix v3, with React Router continuing on and Remix continuing with the shushing face emoji" src="/blog-images/posts/merging-remix-and-react-router/react-router-remix-graphic.jpeg" class="w-full aspect-[16/9] rounded-md shadow-lg" />

<figcaption class="my-2">Graphic by <a href="https://twitter.com/jacobmparis/status/1790904647630151889">Jacob Paris</a></figcaption>

With any project that's been around for 4 years (or 10 years), you learn a lot along the way and have to wrestle with the urge to throw everything away and start from scratch without the baggage of early APIs and design decisions. On top of that, we believe React Server Components really change the game, but they're a new primitive to build on top of, and just like everyone we're discovering the best way to do that. We can't talk about it much (yet!), but we have ideas to make Remix something more powerful and even more server-centric, something you'd use a React Router project on top of.

We've been cooking on some really exciting ideas, and we're excited to start sharing them with you in the future. For now though we're going to remain heads down on stabilizing React Router v7 so you can start upgrading your projects ASAP. So [subscribe][remix-newsletter] (or stay subscribed) to our newsletter, follow us on [Twitter][remix-twitter], and join our [Discord][remix-discord] to stay up to date on all the latest.

We're more energized than ever to keep helping people **build better websites**.

---

[follow-up-post]: incremental-path-to-react-19
[remix-vite-stable]: remix-vite-stable
[spa-mode]: https://remix.run/docs/en/main/guides/spa-mode
[remixing-react-router]: remixing-react-router
[react-routering-remix]: react-routering-remix
[use-a-framework]: https://react.dev/learn/start-a-new-react-project#can-i-use-react-without-a-framework
[react-start-a-project]: https://react.dev/learn/start-a-new-react-project#can-i-use-react-without-a-framework
[future-flags]: future-flags
[upgrade-guide-v6]: https://reactrouter.com/en/v7/upgrading/v6
[upgrade-guide-remix]: https://reactrouter.com/en/v7/upgrading/remix
[remix-discord]: https://rmx.as/discord
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
