---
title: "Case Study: Building Shop with Remix"
summary: A case study on how Shopify rapidly built a web version of their popular iOS/Android app Shop with Remix
featured: true
date: 2024-03-31
# Reach out to Shop to see if they have any other branding
image: /blog-images/headers/shop-case-study.png
imageAlt: shop
authors:
  - Brooks Lybrand
---

Building good software is largely about understanding your constraints and then picking the right tools. When Shopify decided to build a web version of [Shop][apple-shop-app], it was important to:

- Utilize existing tools and infrastructure
- Leverage code from the native clients
- Enable regular and rapid feature releases
- Scale to support millions of users

Shopify was also on a very aggressive timeline – only 3 months! That's a pretty big ask.

We on the Remix team sat down with our colleagues [Sebastian Ekström][sebastian] and [Dominic Lind][dominic] from the Shop team to discuss why they chose Remix for this project and how it went. This is the story about how [Shop.app][shop.app] was built with Remix.

## What is Shop?

<div class="flex flex-col items-center">
  <img alt="Shop app on Apple Play Store. Title says 'Shop: All your favorite brands'" src="/blog-images/posts/shop-case-study/shop-app-ios.jpg" class="h-svh" />
</div>

Shop is an application that allows buyers to discover merchants and products, make purchases, and track orders. Shop automatically aggregates shipping information across various delivery services. So whether it's Amazon or a small private company, no matter how the product is shipped, Shop will automatically track all of your packages in one spot.

Shop's native app has millions of downloads from the Google Play Store and Apple App Store. The Shop app has existed and served the needs of many customers for years, with the web client being a marketing site to redirect users to the native app.

In early 2023, Shopify started exploring what it would take to create Shop for the web.

## Building Shop for the web

<img alt="Diagram of a long lived feature branch for implementing the changes from a migration guide" src="/blog-images/posts/shop-case-study/shop-web.png" />

For a long time Shop.app was a simple landing/marketing page redirecting you to download the iOS or Android app. There was no functionality — no way to browse categories or products, no way to add items to your cart, and certainly no way to purchase anything.

The initial goal was to achieve feature parity with the native apps. However, it became clear that merely recreating the Shop experience on web for existing users was not thinking big enough. The web has unique advantages that could help complement the native apps.

**Capturing more users**

Even with limited functionality, the Shop marketing pages drew substantial traffic. While some of these visitors would proceed to download the app, many would not. With Shop.app users would have the option to sign up on the web, widening the net for acquiring new users.

**Faster feedback loop**

New versions of the website can be shipped multiple times a day, whereas the native applications have a much longer waiting period due to the nature mobile development.

Adding Shop.app would open up new possibilities. It would enable Shopify to run short-term ad campaigns and conduct daily experiments. The valuable user feedback gathered from these activities could then be utilized to enhance future versions of Shop's native and web clients.

## Building Shop.app with Remix

Often when a project grows, it starts out as a website and then expands into native counterparts. With Shop, it was the opposite; the way the native apps were built heavily influenced how the website had to be built.

The Shop team wanted to be able to use as much logic, styles, and UX from the Shop native app in Shop.app. They also wanted native _and_ web developers to be able to easily collaborate and build features across both platforms.

The native versions of Shop, built in React Native, already had a substantial infrastructure in place for styles and data loading. Consequently, any framework chosen for the web needed to use React. Moreover, it had to be flexible enough to accommodate the team's existing patterns, such as data fetching with [Apollo Client][apollo-client].

Finally, the pages needed to be Server-Side Rendered (SSR) for the best UX and SEO. While Shopify already had methods for building React apps with SSR, the Shop team was eager to experiment with Remix. They needed something that would allow them to quickly launch, and rapidly add new features and pages over time.

### Proof of concept: Shop.ai

In February of 2023, shortly before the Shop.app work began, the lead developers on the team had a similar, but smaller-scoped challenge: build an AI-powered shopping assistant on the web.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Shop smarter with <a href="https://t.co/7YAW0Tk8Rh">https://t.co/7YAW0Tk8Rh</a>! We&#39;ve brought our ChatGPT-powered shopping assistant to the web — try it out, and don’t forget to sign in with Shop to save your faves 💜 <a href="https://t.co/DpSdLEr4QD">pic.twitter.com/DpSdLEr4QD</a></p>&mdash; Shop (@shop) <a href="https://twitter.com/shop/status/1636022946127831040?ref_src=twsrc%5Etfw">March 15, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[Shop.ai][shop.ai] now redirects to [Shop.app][shop.app]. However, the initial version was a single webpage showing off a Shop chatbot built on top of OpenAI's newly released ChatGPT.

The team had ~1 month to build this site. They were looking for a fast and adaptable framework to expedite this project. This was a perfect opportunity to try Remix. Even though they didn't use many of the features that makes Remix great (data fetching, routing, nested layouts, etc.), it proved to be straightforward and flexible enough for Shop.ai.

This positive experience gave them confidence to pick Remix when it came time to build Shop.app.

### Monorepo + Remix = Success

<figure>
  <blockquote class="mt-10 text-xl font-semibold leading-8 tracking-tight text-gray-900 sm:text-2xl sm:leading-9">
    <p>“With Shop.app we wanted to reuse a lot of the code we had from the [native] app. Remix allowed us to do that without being a hurdle. It allowed us to migrate piece by piece.”</p>
  </blockquote>
  <figcaption>
    <a class="mt-10 flex items-center gap-x-6" href="https://github.com/linddominic">
      <img class="h-12 w-12 rounded-full bg-gray-50" src="/blog-images/posts/shop-case-study/dominic-lind.png" alt="">
      <div class="text-sm leading-6 text-left">
        <div class="font-semibold text-gray-900">Dominic Lind</div>
        <div class="mt-0.5 text-gray-600 font-light">Senior Staff Developer at Shopify</div>
      </div>
    </a>
  </figcaption>
</figure>

As mentioned, the Shop native app is built with React Native. To ease development between the iOS, Android, and web versions of Shop, the team uses a monorepo that contains the source code for all three.

The monorepo setup simplifies migrating the existing marketing version of Shop.app pages to the new experience. This setup also means that the fundamental infrastructure for linting, testing, CI/CD, etc. are already setup.

The Shop team was able to easily integrate Remix into this existing setup, due to the flexibility and level of control Remix offers. Because the team could integrate Remix into their existing system so easily, it allowed them to start rapidly developing Shop.app.

### Get Sh\*t Done

<figure>
  <blockquote class="mt-10 text-xl font-semibold leading-8 tracking-tight text-gray-900 sm:text-2xl sm:leading-9">
    <p>“I have never produced so much, in such a short amount of time, with such good results.”</p>
  </blockquote>
  <figcaption>
    <a class="mt-10 flex items-center gap-x-6" href="https://github.com/sebastianekstrom">
      <img class="h-12 w-12 rounded-full bg-gray-50" src="/blog-images/posts/shop-case-study/sebastian-ekstrom.jpg" alt="">
      <div class="text-sm leading-6 text-left">
        <div class="font-semibold text-gray-900">Sebastian Ekström</div>
        <div class="mt-0.5 text-gray-600 font-light">Senior Developer at Shopify</div>
      </div>
    </a>
  </figcaption>
</figure>

At Shopify we have a phrase: "Get Shit Done". Shopify is a company that prides itself in building new and innovative things, and building them fast.

With Shop.app, the team was eager to launch an initial version of the product pages as quickly as possible.

The team started building Shop.app in April, 2023. Beyond being flexible enough to easily integrate with their existing monorepo, Remix also provided many other out-of-the-box features the team needed to move fast: SSR, routing, link prefetching, and much more. Using Remix the team was able to launch the initial product page in July, 2023.

**That's 3 months to Get Shit Done**

With Remix, the team was able use their existing backend, patterns, and libraries instead of being forced to rewrite their infrastructure in a "Remix-y" way. There are additional Remix-specific APIs Shop.app doesn't fully take advantage of such as the Remix loading patterns and `defer`. Remix gives developers full control of their site and offers useful levers to pull when needed. This philosophy allowed the Shop team to easily hook in their own patterns and libraries, while incrementally leveraging and experimenting with Remix features as they went.

Shipping the initial version of Shop.app to millions of people all around the world in such a short amount of time couldn’t have been done without Remix.

### Even faster with Vite

One struggle the team did have with Remix was slow Hot Module Replacement (HMR). It took ~9s from the time a developer hit save to when they were able to see their changes reflected locally.

Because of this poor developer experience, the Shop team was ecstatic when they learned that the Remix team was [changing the compiler to be a Vite plugin][vite-announcement]. They were so confident in the new Vite plugin and the DX benefits to their team, they didn't hesitate and started using it before [it was marked as stable][vite-stable-announcement].

Migrating to Vite immediately improved their HMR times to 2.3s.

These were just the initial numbers. They made several more improvements, mostly around upgrading dependencies and converting some files from CJS to ESM. But their biggest gain came from parallelizing the [Tailwind][tailwind] build process which was a huge HMR bottleneck. Once parallelized, HMR times decreased all the way down to 0.1s.

**That's 9s down to 0.1s, a 90x improvement**

## Summary

The journey of building Shop.app with Remix is a testament to Remix's flexibility, DX, and scalability, as well as Shopify's focus on building good, useful software in quick and iterative fashion.

By leveraging the advantages of a monorepo setup, building on top of existing infrastructure, and harnessing the rapid development capabilities of Remix, Shopify was able to successfully transformed Shop.app from a simple marketing site into a fully functional web application.

The move to Vite further accelerated the development process, drastically improving HMR times and boosting productivity. The team was able to accomplish this before Vite was stabilized due to Remix's continuous delivery with [unstable and future flags][future-proofing-blog].

Shopify was able to quickly and effectively deliver a complex and helpful web app to millions of users with Remix. What will you build with Remix?

[apple-shop-app]: https://apps.apple.com/ca/app/shop-all-your-favorite-brands/id1223471316
[shop.app]: https://shop.app/
[shop.ai]: https://shop.ai/
[shop.ai-tweet]: https://twitter.com/shop/status/1636022946127831040
[sebastian]: https://github.com/sebastianekstrom
[dominic]: https://github.com/linddominic
[apollo-client]: https://github.com/apollographql/apollo-client
[vite-announcement]: https://remix.run/blog/remix-heart-vite
[vite-stable-announcement]: https://remix.run/blog/remix-vite-stable
[tailwind]: https://tailwindcss.com/
[css-modules]: https://github.com/css-modules/css-modules
[future-proofing-blog]: https://remix.run/blog/future-flags
