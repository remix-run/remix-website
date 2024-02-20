---
title: "Case Study: Writing Shop in Remix"
summary: A case study on how Shopify rapidly built a web version of their popular iOS/Android app Shop with Remix
featured: true
date: 2024-02-22
image: /blog-images/headers/shop-case-study.png
imageAlt: Come back to this one
authors:
  - Brooks Lybrand
  - Michael Jackson
---

**Intro/hype**

## What is Shop?

Provide a simple explanation of the app

Been live for many years, but about a year ago they started talking about moving that platform to the web

TODO: provide an image or gif of the shop app

## Shop for the Web

For a long time, [shop.app][shop.app] was a simple landing/marketing page directing you to download the iOS or Android Shop app. There was no functionality — no way to browse categories or products, no way to add items to your cart, and certainly no way to purchase those items.

Make it easier for app developers and web developers to collaborate and build features on both platforms (last Feb).

TODO: add image of the website

**What were your goals for building Shop with Remix and did you achieve them?**

Initially wanted feature parity with the App, but not really the main goal. Want to be able to be able to do a lot on web that you can do in the app, iteratively adding features. Main benefits to adding web:

Numerous users coming in through web
Running experiments daily to get feedback, leveraging that back into the App since the feedback cycle is much faster
Also running ad campaigns
Had a lot of UX setup from the app — in this case they went from a mobile experience to a desktop experience, opposite of what you usually do

## Why Remix?

Rails company — a few of the pages are built on rails. Wanted to move to a React SSR something — have these tools at Shopify as well

Went with Remix as the "obvious choice". Happy with it for shop.ai, so they were happy to use it here as well

### Shop AI

[shop.ai][shop.ai] now redirects to [shop.app][shop.app]. It's a chatbot powered by OpenAI that was first added to the apps, then ported back into the website. It's all the search feature

Started Feb 2023, released March 15th 2023

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Shop smarter with <a href="https://t.co/7YAW0Tk8Rh">https://t.co/7YAW0Tk8Rh</a>! We&#39;ve brought our ChatGPT-powered shopping assistant to the web — try it out, and don’t forget to sign in with Shop to save your faves 💜 <a href="https://t.co/DpSdLEr4QD">pic.twitter.com/DpSdLEr4QD</a></p>&mdash; Shop (@shop) <a href="https://twitter.com/shop/status/1636022946127831040?ref_src=twsrc%5Etfw">March 15, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

### Monorepo with React Native

### Need to move fast

Remix was flexible enough that they could keep the architecture they had. Remix didn't get in the way. Haven't adopted everything from Remix, but it allows you to do that.

## Building Shop Web with Remix

The ability to ship 4-5 pages in such a short time with such a small team — couldn’t have been done without Remix and with Remix allowing them to use as much as they could.

"I never produced so much in such a short amount of time with such good results" - [Sebastian Ekström][dominic]

More quotes around 18:40 of the recording

Stays out of the way, just worked, etc.

Started April 2023, initial launch for the product page was July 2023

### Even faster with Vite

Had been struggling with HMR since the start — running a custom TS server, Spin (cloud code thing at Shopify) — HMR times ~9s — down to 0.1s

Sebastian led the Vite migration — took about 2 month. Wasn’t too hard, but everything around it (CJS -> ESM), broke everything around it. Fixing build tools, e2e, local environments, web sockets for HMR
3 dependencies that were issues: lodash, date-fns, some other one. JS files that needed to be converted. Lots of tiny issues, paper cuts

Tailwind — huge bottleneck in HMR times. At 2.3s when they thought they were done with Vite. Then they split the tailwind processing to run in parallel. Can also use css modules so they’re not completely tied down.
Style tokens to share with all the other projects (native, Shop Pay)

[shop.app]: https://shop.app/
[shop.ai]: https://shop.ai/
[shop.ai-tweet]: https://twitter.com/shop/status/1636022946127831040
[sebastian]: https://github.com/sebastianekstrom
[dominic]: https://github.com/linddominic
