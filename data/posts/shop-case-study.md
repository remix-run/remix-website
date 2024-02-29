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

A large part of building good software is about picking the right tools for the right job. So when the Shop team at Shopify was tasked with building a web version of [Shop][apple-shop-app], they need a framework that allowed them to:

- Work with their existing tools and infrastructure
- Share code with the mobile clients
- Ship new features regularly and rapidly
- Support millions of users
- Launch in 3 months

That's a pretty big ask. Fortunately Shopify employees some of the best developers in the world, and they know how to pick a framework like the professionals that they are.

This is the story about how they built [shop.app][shop.app] with Remix.

## The Shop App

Shop is an application that that allows buyers to discover merchants and products, make purchases, and to track their orders. Shop automatically aggregates shipping information across various delivery services. So whether it's Amazon or a small private company, and no matter how they're shipping their product, Shop will automatically start tracking your package.

Shop's usefulness has lead to it being downloaded from the Google Play Store and Apple App Store 10s of millions of times. The Shop app has existed and served the needs of many customers for years, during which the web client, [shop.app][shop.app], served essentially as marketing for the mobile apps. That is until about a year ago when Shopify started exploring what it would take to create Shop for the web.

<div class="flex flex-col items-center">
  <img alt="Shop app on Apple Play Store. Title says 'Shop: All your favorite brands'" src="/blog-images/posts/shop-case-study/shop-app-ios.jpg" class="h-svh" />
</div>

## Building Shop for the Web

As mentioned, for a long time, [shop.app][shop.app] was a simple landing/marketing page directing you to download the iOS or Android Shop app. There was no functionality — no way to browse categories or products, no way to add items to your cart, and certainly no way to purchase those items.

Initially the Shop team planning to create feature parity with the mobile apps, however that was not the main goal of building [shop.app][shop.app]. There are certain advantages a web client offered in addition to the full-featured mobile apps, namely capturing more users and creating a faster feedback loop.

**Capturing more users**

There was already a large amount of traffic being captured on the marketing pages. While some of these visitors will continue through the journey and download the app, providing the ability to sign up or log in directly on the web creates a wider retention net

**Faster feedback loop**

New versions of the website can be shipped multiple times a day, whereas the mobile application has a much longer waiting period due to how the Play/App store work. This means that adding Shop Web would allow the Shop team to run short-term ad campaigns and daily experiments to gather user feedback which they would be able to leverage back into new versions of the mobile applications.

<img alt="Diagram of a long lived feature branch for implementing the changes from a migration guide" src="/blog-images/posts/shop-case-study/shop-web.png" />

## Rapid development with Remix

<figure>
  <blockquote class="mt-10 text-xl font-semibold leading-8 tracking-tight text-gray-900 sm:text-2xl sm:leading-9">
    <p>“I never produced so much in such a short amount of time with such good results.”</p>
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
</section>

The benefits for the users and Shopify were clear, now the focus was on the developers.

Often when a project grows, it starts out as a website and is then expanded into mobile counterparts. With Shop it was the opposite; the way the mobile apps were built heavily influences how the website had to be built.

The Shop team wanted to be able to use as much logic, styles, and UX from the Shop apps in Shop Web. They also wanted app and web developers to be able to easily collaborate and build features on both platforms.

The mobile versions of Shop were built in React Native, and already had a large amount of infrastructure in place for styles and data loading. That meant whatever they used for the web needed to use React and needed to be flexible enough for the team to use their own patterns like data fetching with [Apollo Client][apollo-client]. Additionally, the pages needed to be Server-Side Rendered (SSR) for the best UX and SEO. Additionally, they needed something that would allow them to launch quickly, and rapidly add new features and pages as they went.

While Shopify has some ways to build SSR'd React apps, the Shop team was eager to try Remix. Plus, they already had a good experience quickly shipping with Remix.

### Shop AI

In February of 2023, shortly before the Shop Web work began, the lead developers on the team had a similar, but smaller scoped challenge: build a ChatGPT-powered shopping assistant on the web.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Shop smarter with <a href="https://t.co/7YAW0Tk8Rh">https://t.co/7YAW0Tk8Rh</a>! We&#39;ve brought our ChatGPT-powered shopping assistant to the web — try it out, and don’t forget to sign in with Shop to save your faves 💜 <a href="https://t.co/DpSdLEr4QD">pic.twitter.com/DpSdLEr4QD</a></p>&mdash; Shop (@shop) <a href="https://twitter.com/shop/status/1636022946127831040?ref_src=twsrc%5Etfw">March 15, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[Shop.ai][shop.ai] now redirects to [shop.app][shop.app], but at the time it was a single webpage showing off Shop chatbot built on top of OpenAI's newly released ChatGPT.

The team had ~1 month to build this site. They chose Remix believing that it would make building this simple website fast and easy. Even though they didn't use many of the features that make Remix great (data fetching, routing, nested layouts, etc.), they still found it to be a fast and adaptable framework, which is exactly what they were looking for.

This positive experience gave them confidence to go with Remix for Shop Web.

### Monorepo with React Native

As mentioned, the Shop app is built with React Native. To ease development between the iOS, Android, and now Web version of Shop, the team uses a monorepo the source code of 3 clients.

The monorepo setup also simplifies migrating the existing marketing version of shop.app pages to the new experience. The monorepo setup meant that the fundamental infrastructure for linting, testing, releasing, CI/CD, etc. are all setup for the team to build on top of.

The Shop team found Remix flexible and easy to integrate into their existing setup, allowing them to start experimenting with building Shop Web on Remix.

### Get Sh\*t Done

At Shopify there's a term often used: Get Shit Done. Shopify is a company that prides themselves on building new and innovative things, and building them fast.

With Shop Web, the team was eager to get an initial version of the product pages launched as quickly as possible.

The team started building Shop Web in April, 2023. Because Remix was flexible enough to allow them to keep the architecture they had, and provided out of the box SSR, routing, loading patterns, and much more, the team was able to launch the initial product page in July, 2023.

**That's 3 months to Get Shit Done**

Remix was flexible enough to allow the Shop team to keep architecture they had. Remix didn't get in the way. Even though the team hasn't adopted everything Remix has to offer such as fully leaning on the Remix loading patterns and `defer`, the "guts out" approach of Remix means they could easily hook in their own patterns and libraries, while incrementally leveraging the bits of Remix they liked.

According to the Shop team, their ability to ship an initial version of Shop Web to millions of people all around the world in such a short amount of time couldn’t have been done without Remix.

### Even faster with Vite

One struggle the team did have using Remix was slow Hot Module Replacement (HMR). It took ~9s from the time a developer hit save to when they were able to see their changes reflected locally.

Due to these slow HRM times, the Shop team was eccstatic once the Remix team announced that they were [moving the compiler to a Vite plugin][vite-announcement]. They were so confident in the new Vite plugin and the DX benefits it would save their team, they didn't even hesitate until [it was marked as stable][vite-stable-announcement].

Migrating to Vite improved their HMR times to 2.3s.

These were just the initial numbers though. They had a number of small improvements the Vite migration made them aware of, mostly in terms of upgrading dependencies and converting some files from CJS to ESM, but the biggest one was the need to parallelize the [Tailwind][tailwind] build process, as it was a huge HMR bottleneck. Once they made this improvement they were able to further improve HMR times to 0.1s.

**That's 9s down to 0.1s, a 90x improvement**

Certainly, here's a conclusion for your blog post:

## In Conclusion

The journey of building Shop Web with Remix has been a testament to the power of choosing the right tools for the right job. Shopify's Shop team managed to overcome a multitude of challenges thanks to their expertise and the flexibility of Remix.

By leveraging the advantages of a monorepo setup, embracing the "Get Sh\*t Done" mindset, and harnessing the rapid development capabilities of Remix, the team successfully transformed a simple marketing page into a fully functional web app, all within a remarkable three-month timeframe.

The move to Vite further accelerated the development process, slashing HMR times and boosting productivity. This experience underscores the importance of continuous improvement and adaptation in the world of software development.

As the Shop Web project continues to evolve, one thing remains certain: the combination of a skilled team and powerful tools like Remix and Vite can lead to impressive results, and serve as an inspiring example for developers around the globe.

In the end, the story of Shop Web is not just about building a web application; it's about how the right blend of people, processes, and technology can come together to create something truly exceptional.

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
