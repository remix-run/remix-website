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

For nearly 4 years we've been building Remix, a fullstack framework built on web standards with the purpose of helping you build better websites and applications. Next to React, React Router has always been the largest Remix dependency, so much so that we've [rewritten React Router][remixing-react-router] to include Remix's great loading patterns, and even [rewrote Remix][react-routering-remix] to _even more directly_ depend on React Router.

Remix has always sorta been "React Router: The Framework", and since [React recommends using a framework][use-a-framework], we wanted to create a great bridge for the millions of React Router users to upgrade to Remix if they were so inclined.

Turns out we made that bridge a little two well, specifically with the introduction of [our Vite plugin][vite-post] and [SPA Mode][spa-mode]. We found ourselves looking at Remix, then looking at React Router, then looking back at Remix, and we could no longer meaningful see a difference.

So we're remixing React Router (again).

Actually, we're doing a little more than that. What we originally planned to release as **Remix v3** is now going to be released as **React Router v7**.

## 10 years of React Router

- Lots of people depending on React Router
- Here at Shopify, there are also large dependencies on React Router

<img alt="React Router's repo on GitHub is used by 7.8m other projects" src="/blog-images/posts/react-router-v7/react-router-usage.jpeg" class="border border-gray-100/60 rounded-md shadow-lg" />

<img alt="React Router's repo on GitHub is used by 7.8m other projects" src="/blog-images/posts/react-router-v7/react-router-usage-shopify.jpeg" class="border border-gray-100/60 rounded-md shadow-lg" />

## Modern React without a rewrite

Emotionally, React Router -> Remix _feels_ like a rewrite, even if not technically a big rewrite

<img alt="Create React App GitHub showing the last 3 commits from June 14, 2023, May 29, 2023, and Sep 8, 2022. There is a cartoon tombstone to the right with RIP engraved on it" src="/blog-images/posts/react-router-v7/rip-cra.png" class="rounded-md shadow-lg" />

Our first strategy: Vite + SPA mode

<img alt="" src="/blog-images/posts/react-router-v7/vite-ftw.png" class="rounded-md shadow-lg" />

<img alt="" src="/blog-images/posts/react-router-v7/rr-plus-vite-is-remix.jpeg" class="border border-gray-100/60 rounded-md shadow-lg" />

React Router + Vite = React Router v7

<img alt="" src="/blog-images/posts/react-router-v7/rr-plus-vite-is-rr-7.jpeg" class="border border-gray-100/60 rounded-md shadow-lg" />

- commitment non-painful major upgrades: Future flags
- the only difference between react router and Remix is the vite plugin

## How to upgrade

## What's happening to Remix

<img alt="" src="/blog-images/posts/react-router-v7/sleepy-remix.jpeg" class="rounded-md shadow-lg" />

---

[vite-post]: remix-vite-stable
[spa-mode]: https://remix.run/docs/en/main/guides/spa-mode
[remixing-react-router]: remixing-react-router
[react-routering-remix]: react-routering-remix
[use-a-framework]: https://react.dev/learn/start-a-new-react-project#can-i-use-react-without-a-framework
[future-flags]: future-flags
[upgrade-guide-v6]: https://reactrouter.com/en/v7/upgrading/v6
[upgrade-guide-remix]: https://reactrouter.com/en/v7/upgrading/remix
