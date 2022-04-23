---
title: Say Goodbye to Spinnageddon
summary: Let's take a deeper look at the spinner problem and how Remix helps speed up page load times
date: 2022-04-22
draft: true
featured: true
image: /blog-images/headers/say-goodbye-to-spinnageddon.png
imageAlt: Side-by-side comparison of a similar UI showing loading spinners and a stair step waterfall on the left labeled "Without Remix" and no spinners with a flat waterfall on the right labeled "With Remix"
authors:
  - name: Kent C. Dodds
    avatar: /k.jpg
    title: Co-Founder
---

When we launched Remix v1 with the new website, we had this example on the homepage that explained that Remix flattens your waterfall for code and assets resulting in a much better user experience. The app we used is called "Fakebooks" and is... eh... fake. But I decided to implement the bit we demonstrated and get it deployed so we can dig deeper into the claims we made.

It's no secret that we're hoping to encourage folks who are using React Router to upgrade to Remix. Most React Router apps are client-only and suffer from the issues we describe on the site. So I also implemented Fakebooks using a basic client-rendered React Router app with Create React App (CRA). This setup represents [the single largest category](https://www.npmtrends.com/react-router-vs-react-scripts) of React Router apps.

## tl;dr

- Remix results in a _much_ faster data loading experience
- Remix enables you to eliminate unnecessary pending states
- Remix enables you to have data co-location without suffering from stair-step waterfalls.

## Nuance

The focus of this comparison is initial page load, so there are some contrived bits and there's other context you should be aware of before looking at this comparison and making judgements.

- Co-locating data requirements with components in both apps
- Code-splitting on routes in both apps
- Shipping React 18 in both apps
- React Router v6 in both apps
- REST backend with 40-100ms delay to simulate database access time. Incidentally, the Remix app serves as the backend for the CRA app (don't worry, we [`preconnect`][preconnect] to make sure that doesn't slow us down).
- No mutations. This actually means **a lot** less code (and bugs 😅) that what would normally be required in the CRA version.
- CRA is deployed to Netlify (global CDN).
- Remix is deployed to Fly (in the Dallas Region, even static assets are served from there).

Interestingly, if we took the time to deploy Remix to multiple regions (or at least put the static assets on a CDN) and if we implemented mutations this comparison would look even better for Remix. So the more real-world we make this app, the better these numbers would look for Remix.

## Comparisons

Let's start with just watching the comparison for loading a specific invoice. We'll use WebPageTest.org for this comparison which will run the test three times and choose the fastest time. We'll also try it first in good conditions and then in poor conditions.

[<figcaption>Fast Device, Virginia, Cable</figcaption>][virginia-comparison]

[![Remix loads in 0.5 and CRA loads in 1.2][virginia-cable-gif]][virginia-comparison]

Now I know that bouncy UI on the right may feel a little more familiar to you since so many web apps we use these days behave like that, but it really doesn't have to be like that 😆

[<figcaption>Slow Device, India, 3G</figcaption>][india-comparison]

[![Remix loads in 2.7 and CRA loads in 8.4][india-3g-gif]][india-comparison]

## Analyzing the results

Let's evaluate why Remix manages to be 2.4x faster in good conditions and 3.1x faster in poor conditions. As usual, it all comes back to the waterfall:

<div class="flex w-full gap-4">
  <div class="w-1/2">
    <a data-noprefetch href="https://www.webpagetest.org/result/220422_BiDc1B_FZ4/2/details">
    <figcaption class="text-center bold text-d-p-sm">With Remix (Virginia)</figcaption>
    <img src="/blog-images/posts/say-goodbye-to-spinnageddon/virginia-remix-waterfall.png" /></a>
  </div>
  <div class="w-1/2">
    <a data-noprefetch href="https://www.webpagetest.org/result/220422_BiDcH9_G08/1/details">
    <figcaption class="text-center text-d-p-sm">Without Remix (Virginia)</figcaption>
    <img src="/blog-images/posts/say-goodbye-to-spinnageddon/virginia-cra-waterfall.png" /></a>
  </div>
</div>

Under close inspection, you'll notice that the CRA version finishes loading the document _much_ faster. There are two reasons for this:

1. It's hosted on a CDN (Netlify) which is doing it's job well: placing static assets geographically close to the user and serving them very quickly.
2. The document is much much smaller because it's just a shell of the application vs a server-rendered version of the application.

So, as expected, the Time to First Byte for the CRA version is comparatively higher (0.166s vs 0.312s). And the document download is also faster because you download less. We even call this out in our example on the homepage by showing the document request take longer.

What's interesting is most of the "top metrics" are actually better for the static client-rendered site. Despite this, the waterfall of requests results in a janky and slower overall loading experience for the user. You really gotta look at more than the key metrics when considering user experience. Shoving loading spinners in a user's face is... not terrific.

Let's also take a look at the waterfall comparison in India:

<div class="flex w-full gap-4">
  <div class="w-1/2">
    <a data-noprefetch href="https://www.webpagetest.org/result/220423_AiDcR3_36E/3/details">
    <figcaption class="text-center bold text-d-p-sm">With Remix (India)</figcaption>
    <img src="/blog-images/posts/say-goodbye-to-spinnageddon/india-remix-waterfall.png" /></a>
  </div>
  <div class="w-1/2">
    <a data-noprefetch href="https://www.webpagetest.org/result/220423_AiDcEX_35S/3/details">
    <figcaption class="text-center text-d-p-sm">Without Remix (India)</figcaption>
    <img src="/blog-images/posts/say-goodbye-to-spinnageddon/india-cra-waterfall.png" /></a>
  </div>
</div>

You might expect that since a user in India has to travel all the way to Dallas to get the document and assets the basic metrics for Remix would be even worse in comparison to the client-rendered app served from a global CDN, but that's not the case here. The client-rendered (CDN) version barely beats the Remix (SSR) version's time to first byte by 0.1s, but all the other basic metrics are actually better for the Remix version.

Honestly I'm a bit perplexed by this result, but WebPageTest runs your test three times and I reran this test multiple times as well with the same results. I expect Remix's performance has something to do with the fact that even though we've only deployed our Remix app to the Fly region in Dallas, the user gets routed to Fly's high-speed network in Chennai and that request/response is able to get to and from Dallas pretty quick.

In any case, the end result with Remix is a jank-free and lightning fast experience for the user. One that works even before the JS finishes loading thanks to Remix's application of progressive enhancement.

## The Code

We've been talking about the user experience a lot and that's where we like to start, but the developer experience is really important as well (it is an input into user experience after all). This example is too contrived to come to many conclusions about the UX. As noted, it's missing mutations which is a great way to add complexity to any app and almost every app needs to support mutations.

But if you take a look at the code in even this simple app, you'll see the beginnings of a much simpler codebase with Remix. And that really should be expected. Remix is a framework with conventions and utilities to aid you in development. Remix is also a full solution–as noted, the CRA version can't do the sever-side stuff, so it's using the Remix version as a backend–so a client-only app has to deal with the indirection of wiring up network calls to a backend.

In case you're interested, here's the `cloc` stats for the codebases (keep in mind that the Remix app has some resource routes for serving the CRA app, so some of those lines are extra 😆):

```
~/Desktop/fakebooks-remix
$ npx cloc ./app
      23 text files.
      23 unique files.
       0 files ignored.

github.com/AlDanial/cloc v 1.92  T=0.01 s (3323.2 files/s, 97817.5 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
TypeScript                      22             51              3            622
Markdown                         1              0              0              1
-------------------------------------------------------------------------------
SUM:                            23             51              3            623
-------------------------------------------------------------------------------
```

```
~/Desktop/fakebooks-cra
$ npx cloc src public/index.html
      21 text files.
      21 unique files.
       0 files ignored.

github.com/AlDanial/cloc v 1.92  T=0.02 s (1377.3 files/s, 60536.1 lines/s)
-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
TypeScript                      19             49              2            820
HTML                             1              0              0             43
CSS                              1              1              0              8
-------------------------------------------------------------------------------
SUM:                            21             50              2            871
-------------------------------------------------------------------------------
```

Bugs come from code. In general, the less of it you have to write, the easier they are to avoid.

## Conclusion

If your app at work resembles the CRA app we're comparing against, have no fear! If you're using React Router, you can upgrade your router to the latest version and [soon](/blog/remixing-react-router) you'll be able to take advantage of Remix features in React Router (giving you ["90% of the DX, 50% of the perf!"](https://twitter.com/ryanflorence/status/1514014625762750470)). Once you've done that, adopting Remix should be a snap and we'll have great migration guides soon. I just wanted to write this now to get you thinking about it. Maybe put a little time in this sprint to upgrade React Router to the latest version if you're not already there yet 😉.

We just really want you to love building your app and we want your users to love using it. Remix is going to help make that a reality. We hope you love it.

- Remix Version: [fakebooks-remix.fly.dev][remix-production-deploy], [kentcdodds/fakebooks-remix][kentcdodds/fakebooks-remix]
- CRA Version: [fakebooks-cra.netlify.app][cra-production-deploy], [kentcdodds/fakebooks-cra][kentcdodds/fakebooks-cra]

[preconnect]: https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preconnect
[virginia-remix-results]: https://www.webpagetest.org/result/220422_BiDc1B_FZ4/
[virginia-cra-results]: https://www.webpagetest.org/result/220422_BiDcH9_G08/
[virginia-cable-gif]: /blog-images/posts/say-goodbye-to-spinnageddon/virginia-cable.gif
[virginia-comparison]: https://www.webpagetest.org/video/compare.php?tests=220422_BiDc1B_FZ4%2C220422_BiDcH9_G08&thumbSize=600&ival=100&end=all
[india-remix-results]: https://www.webpagetest.org/result/220423_AiDcR3_36E/
[india-cra-results]: https://www.webpagetest.org/result/220423_AiDcEX_35S/
[india-3g-gif]: /blog-images/posts/say-goodbye-to-spinnageddon/india-3g.gif
[india-comparison]: https://www.webpagetest.org/video/compare.php?tests=220422_BiDcXE_FXW%2C220422_BiDcF9_FXX&thumbSize=600&ival=100&end=all
[virginia-remix-waterfall]: /blog-images/posts/say-goodbye-to-spinnageddon/virginia-remix-waterfall.png
[virginia-cra-waterfall]: /blog-images/posts/say-goodbye-to-spinnageddon/virginia-cra-waterfall.png
[kentcdodds/fakebooks-remix]: https://github.com/kentcdodds/fakebooks-remix
[kentcdodds/fakebooks-cra]: https://github.com/kentcdodds/fakebooks-cra
[remix-production-deploy]: https://fakebooks-remix.fly.dev/sales/invoices/b56pp9qeojg
[cra-production-deploy]: https://fakebooks-cra.netlify.app/sales/invoices/b56pp9qeojg
