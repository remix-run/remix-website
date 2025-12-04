---
title: Open Sourcing the Remix Store
summary: TODO
date: 2025-12-08
image: /blog-images/headers/remix-dot-run.png
imageAlt: "Remix Website homepage"
authors:
  - Brooks Lybrand
---

Today we are open sourcing the [Remix Store][remix-store]. We think making the store's source code public will benefit developers building with React Router as well as developers building Shopify stores.

The Remix Team is an open source team. We work on open source software like [react-router][react-router-github] and [remix][remix-github]. Sometimes we open source [our][react-router-website-github] [websites][remix-website-github] too.

We launched out store [back in May][remix-store-launch-post], and the intention was always to open source it. I delayed because with something like a store where there are actual exchanges of money for goods (something open source folks rarely know much about), there's a lot more room for abuse if done wrong.

I think I've got everything sorted out to keep our store safe while also allowing anyone to run it locally and poke around/contribute.

With the opening up of the repo, I wanted to take a moment to share:

- Who this is for
- What it takes to launch a store
- Some cool feature worth digging into

If you just want to skip the backstory and dig into the recipe, [checkout the source code on GitHub][remix-store-github].

Otherwise, let's dig into the details of procurement requests, spinning hoodies, and the many iterations it took to get things right.

## Who this is for

Before we dig into the technical bits, it's always good to put on our Product Manager hat and consider why we're building what we're building.

Launching a swag store was one of the first things my manager (Michael Jackson) asked me to do when I first joined the Remix Team in 2023. In fact, this wasn't even the first attempt. Digging through some of our old, private repos, I stumbled across this beauty:

![GitHub commit history page for remix-run/swag-store showing early development commits from August 2022, including form components, Dialog, CartItem, and various UI tweaks.](/blog-images/posts/oss-remix-store/old-remix-swag-store.png)

To put things in context, this first store was started pre-Shopify acquisition, and well before I joined the team.

After Remix joined Shopify, the reasons to build a store increased, especially with [Hydrogen][hydrogen] being built on Remix v1-2 (and now React Router). As Michael and I discussed it, we realized that we essentially had 3 audiences. The following comes directly from the internal project I had to setup to convince Shopify to let use company resources to launch the store (more on that later):

**Remix Users**

- Fans can purchase swag to rep their favorite framework (one of our most frequent requests) and organically advertise our software
- Sending "thank you"s to contributors
- Streamline sending swag to meetups and conferences

**Hydrogen Users**

- Real-world prod example of a Hydrogen store
- Open-sourced for education purposes

**Shopify Devs**

- Real world app to dog-food new Remix and Hydrogen features
- Cross collaborate between the Hydrogen and Remix teams to learn from one another
- Educate and connect the Remix team better with the core of what Shopify

The store has now been up for over half a year and we've received and fulfilled over 200 orders. We have future drops and improvements planned (_cough cough_ more affordable international shipping _cough cough_). I love [seeing][remix-merch-love-1] [people][remix-merch-love-2] [enjoy][remix-merch-love-3] and [represent][remix-merch-love-4] [our][remix-merch-love-5] [merch][remix-merch-love-6].

We have also been able to use the store to test out new React Router things like [upgrading Hydrogen apps to React Router v7](https://github.com/remix-run/remix-store/commit/6df81c7681092dfc318ccb8889e52a5173ba171e), [middleware][remix-store-middleware], and [React Server Components][remix-store-rsc].

<figure>
  <img alt="Remix Store built on React Server Components example" src="/blog-images/posts/oss-remix-store/remix-store-rsc-demo.gif" />
  <figcaption class="pt-2">Jacob Ebey's <a href="https://react-router-rsc-ecommerce.up.railway.app/">reimagining of the Remix Store</a> React Server Components</figcaption>
</figure>

The only thing we haven't done is share the store's source code for React Router and Shopify developers to learn from.

Back when we [open sourced remix.run][oss-remix-dot-run], I shared this sentiment:

> Personally, I wanted to make open source contributions _years_ before I worked up the courage. While this says more about me than anything, one thing I know that would have made it easier is if I contributed to an open source website vs a library. Why? Because I worked on websites all day long at my job, it's what I already knew. I didn't write libraries. In fact, far fewer web developers write libraries than write websites.

I think this still holds true, and I hope by airing out code I (and Cursor, thanks buddy) wrote for the Remix Store will inspire others. Some of the code is good, some of it is mediocre, some of it is hacky, and some of it was just to get things over the finish line. Take a look at it, judge it, learn from it, improve it.

The store is for developers using React Router, building on Shopify, and eventually will be rewritten on our new Remix 3 work.

So [dig in][remix-store-github]!

## What it takes to launch a store

- What it takes to launch a store

## Some cool features

- Features worth digging into

## Future improvements and contributing

## Vault Project description

What problem will we make go away with this project?
tl;dr: this store will:

- Help support the Remix community
- Market Remix and Hydrogen
- Provide an open-source production example to A/B new test features on

**Remix Users**

- Fans can purchase swag to rep their favorite framework (one of our most frequent requests) and organically advertise our software
- Sending "thank you"s to contributors
- Streamline sending swag to meetups and conferences

**Hydrogen Users**

- Real-world prod example of a Hydrogen store
- Open-sourced for education purposes

**Shopify Devs**

- Real world app to dog-food new Remix and Hydrogen features
- Cross collaborate between the Hydrogen and Remix teams to learn from one another
- Educate and connect the Remix team better with the core of what Shopify

**What does success look like?**

- The store is launched and products can be shipped globally
- The store and all design assets are open sourced for anyone to learn from
- Revenue from the store is matching or exceeding the cost of production
- We are selling unique and quality Remix-branded apparel, stickers, accessories, and much more

## features to highlight

- Hero
- Collections exploder header
- Product image blur loader
- Optimistic cart
- 404/500 glitchy text: https://shop.remix.run/blah
- Progressive Enhancement (clicking the cart before JS loads takes you to the cart page)

## timeline

- July 26, 2022 -- First swag store started
- September 11, 2023 -- Brooks joins Remix, is asked to build the remix merch store
- June 13, 2024 -- Setup a Hack Day project
- October 28, 2024 -- Setup internal project
- November 10, 2024 -- Got feedback from Shopify VP to make it better
- April 25, 2025 -- Received our first round of test prints
- May 19, 2025 -- Launched the store

## unorganized notes, resources, images, etc.

- Hack Days project had 12 team members

Feedback from Shopify VP reviewing the project:

> Please push yourself to flex a little more and remember that you are the team that built remix.run which is one of my favorite dev marketing websites that does a great job of telling me what the Remix brand is.

![Screenshot of a Slack DM conversation between Brooks Lybrand and Tim Quirino discussing the Remix Swag Store hack day project, with Tim expressing interest in collaborating.](/blog-images/posts/oss-remix-store/tim-brooks-first-message.png)

![Side-by-side dark and light mode views of v0 of The Remix Store website featuring a mini skateboard banner and six product listings including a jacket, hip pack, shirt, skateboard, notebook, and gel pen.](/blog-images/posts/oss-remix-store/v0-store-mockup.png)

![Screenshot of v1 of The Remix Store website in dark mode, featuring a black t-shirt with a colorful Remix logo in the hero section and a shopping cart overlay on the right. The cart contains a shirt, a mini skateboard, and a gel pen, totaling $93.00.](/blog-images/posts/oss-remix-store/v1-store-mockup.png)

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Soft Wear update is available <a href="https://t.co/VhVbdVV8GN">pic.twitter.com/VhVbdVV8GN</a></p>&mdash; Remix 💿 (@remix_run) <a href="https://twitter.com/remix_run/status/1924558330225156190?ref_src=twsrc%5Etfw">May 19, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[oss-remix-dot-run]: ./oss-remix-dot-run
[react-router-github]: https://github.com/remix-run/react-router
[remix-github]: https://github.com/remix-run/remix
[react-router-website-github]: https://github.com/remix-run/react-router-website
[remix-website-github]: https://github.com/remix-run/remix-website
[remix-store-github]: https://github.com/remix-run/remix-store
[remix-store-launch-post]: https://x.com/remix_run/status/1924558330225156190
[shopify-custom-storefronts]: https://shopify.dev/docs/storefronts/headless/getting-started
[hydrogen]: https://hydrogen.shopify.dev/
[remix-store]: https://shop.remix.run/
[remix-store-v1-figma]: https://www.figma.com/design/fbPeXZehszfApKG9r2wbWa/-Deprecated--Remix-Store-V1?node-id=53-30243&p=f&t=aYzv2vTYd9olg6Bn-0
[remix-store-v2-framer]: https://many-brand-728778.framer.app/
[404-example]: https://shop.remix.run/blah
[remix-merch-love-1]: https://x.com/MichelleBakels/status/1941558260898856982
[remix-merch-love-2]: https://x.com/ryanflorence/status/1976111732369281234
[remix-merch-love-3]: https://x.com/jacobmparis/status/1942228491958677822
[remix-merch-love-4]: https://x.com/elithrar/status/1952000448098947093
[remix-merch-love-5]: https://x.com/AlemTuzlak/status/1947363181216571673
[remix-merch-love-6]: https://x.com/MichelleBakels/status/1988420671077265429
[remix-store-middleware]: https://github.com/remix-run/remix-store/pull/198
[remix-store-rsc]: https://github.com/jacob-ebey/react-router-rsc-ecommerce
[remix-store-rsc-demo]: https://react-router-rsc-ecommerce.up.railway.app/
