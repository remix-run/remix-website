---
title: Remix vs Next.js
date: January 11, 2021
image: /blog-images/headers/remix-vs-next.jpg
imageAlt: Remix and Next.js Logos
authors:
  - name: Ryan Florence
    avatar: /r.jpg
    title: Co-Founder
---

There is one obvious question that inevitably comes up since launching Remix:

> How is Remix different than Next.js?

We want to address this directly and without drama. If you're a fan of Remix and want to start tweeting smug reactions to this article, we ask that you drop the smugness before hitting the tweet button 🤗. A rising tide lifts all boats. We've been friends with folks at Vercel long before Vercel was founded. They are doing great work and we respect the work they do!

But make no mistake, **we think Remix has a better set of tradeoffs than Next.js**.

We encourage you to read this entire article. There is a lot of nuance in this conversation that's left un-captured in the shiny graphs and animations. You also might learn a thing or two about the web.

By the end, hopefully you'll consider Remix for your next project (no pun intended 😂).

## tl;dr

- Remix is as fast or faster than Next.js at serving static content.
- Remix is faster than Next.js at serving dynamic content.
- Remix enables fast user experiences even on slow networks.
- Remix automatically handles errors, interruptions, and race conditions, Next.js doesn't
- Next.js requires client side JavaScript for serving dynamic content, Remix doesn't.
- Next.js requires client side JavaScript for data mutations, Remix doesn't.
- Next.js build times increase linearly with your data, Remix build times are nearly instant and decoupled from data.
- Next.js requires you to change your application architecture and sacrifice performance when your data scales.
- We think Remix's abstractions lead to better application code, but you will have the opportunity to decide that one for yourself with a scavenger hunt at the end 🥾

## Self-Descriptions

Next.js describes itself as:

> The React Framework for Production. Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more. No config needed.

Next.js is built by Vercel. Looking at the GitHub repo for the Vercel platform it states:

> Vercel is a platform for static sites and frontend frameworks, built to integrate with your headless content, commerce, or database.

We describe Remix as:

> Remix is an edge native JavaScript framework for building modern, fast, and resilient user experiences. It unifies the client and server with web fundamentals so you can think less about code and more about your product.

We'll leave it to you to contrast those descriptions.

## Background

We figured the fairest way to compare the frameworks would be to take a Next.js example app that the Vercel team wrote themselves. Since they wrote it, the decisions they made should reflect how they intend you to build your app. It should also show off the features the Vercel team is most proud of.

We ported the _Commerce Example_ from the Next.js [examples page][next-examples]. It has a handful of real world features we liked and seems to be the one they put the most effort into.

- Initial page load is critical for ECommerce
- Dynamic data on the search page
- Data mutations with the shopping cart
- Ability to integrate with multiple providers that illustrates how the frameworks help you abstract

We actually built two versions:

- **Minimal Port** - We simply copy/pasted/tweaked the Next.js code to run on Remix instead of Next.js. This is a great comparison of frameworks because everything but the framework is the same code for the most part.
- **Rewrite** - The two frameworks don't actually have a lot of API overlap and Remix can run on different infrastructure than Next.js. To really exercise Remix's design, we rewrote the example into idiomatic Remix.

Note that this app doesn't get to exercise everything we think is cool about Remix (like nested routes!). Once we answer this question, we can move on to just talking about Remix, so stay tuned!

Let's get started!

## Home Page, Visually Complete

We want to see how quickly we can render a visually complete page. We ran the sites through [WebPageTest][wpt] from Virginia, with a cable modem connection, and took the best run for each. You can click the caption to view the full test comparison results.

[<figcaption>Home Page, Virginia, Cable</figcaption>][virginiacomp]

![Remix loads in 0.9s, Next in 1.1s][virginiacompgif]

Before we say anything, let's acknowledge that all three versions are dang fast. I'm not going to call my mom to tell her about this. But, you are here for the numbers: Remix is 1.5x faster. As a multiplier that's actually pretty significant. <small>(I'd love a 1.5x raise)</small>.

**Why Next.js is fast**: This page uses [Static Site Generation][getstaticprops] (SSG) with `getStaticProps`. At build time, Next.js pulls data from shopify, renders a page to an HTML file and puts it in the public directory. When the site is deployed, the static file is now served at the edge (out of Vercel's CDN) instead of hitting an origin server at a single location. When a request comes in, the CDN simply serves the file. Data loading and rendering have already been done ahead of time so the visitor doesn't pay the download + render cost. Also, the CDN is distributed globally, close to users (this is "the edge"), so requests for statically generated documents don't have to travel all the way to a single origin server.

**Why the Remix port is fast**: Remix doesn't support SSG so we used the HTTP [stale-while-revalidate caching directive][swr]. The end result is the same: a static document at the edge (Vercel's CDN). The difference is how the documents get there. Instead of fetching all of the data and rendering the pages to static documents at build/deploy time, the cache is primed when you're getting traffic. Documents are served from the cache and revalidated in the background for the next visitor. Like SSG, no visitors pays the download + render cost when you're getting traffic. If you're wondering about cache misses, we'll discuss that a little later (SSG has them too).

**Why the Remix rewrite is fast**: This version doesn't use SSG or HTTP caching, or even a CDN (though it probably should). Instead of caching documents at the edge, this version _caches data_ at the edge in [Redis][redis]. In fact, it actually **runs the application at the edge too**. Each document is rendered dynamically for each request from multiple instances of the app in different regions around the world. We'll see this approach comes with more benefits than speed, too. This might have been difficult to build a few years ago, but the landscape has changed and is only getting better.

### Homepage, 3G

Let's slow down the network and see what changes. Same as last time, gave them all three chances and took the best run.

[<figcaption>Home Page, Virginia, 3G</figcaption>][virginia3gcomp]

![Remix loads in 0.9s, Next in 1.1s][virginia3gcompgif]

Isn't SSG as fast as it gets? How is Remix faster? <small>(Maybe I should call my mom this time ...)</small>

**Less JavaScript**: Not only does it take less time to download less JavaScript, but the time to parse and evaluate that JavaScript isn't free. The Next.js app had to parse almost 40% more JavaScript (523 kB vs 376 kB unpacked). <small>(Dang, I'd like a 40% raise ...)</small>

Remix has less JavaScript partly because none of the dynamic data loading and mutation code needs to go to the browser (search page, adding to cart, more on that later). With SSG, anything dynamic needs extra client side JavaScript.

**Network Waterfall**: If you look at the network waterfall of both apps, the Remix network waterfall is flatter with fewer requests, while Next.js has more steps.

<div class="flex w-full gap-4">
  <div class="w-1/2">
    <figcaption class="text-center bold text-d-p-sm">Remix Rewrite</figcaption>
    <img src="/blog-images/posts/remix-vs-next/remix-waterfall.png" />
  </div>
  <div class="w-1/2">
    <figcaption class="text-center text-d-p-sm">Next.js</figcaption>
    <img src="/blog-images/posts/remix-vs-next/next-waterfall.png" />
  </div>
</div>

The Next.js graph has a lot more requests and many start later in the timeline that are critical to rendering the page. If it could eliminate those chains it, would get closer to Remix's performance.

(Some of the bars look like chains on the Remix graph, but that's just the browser deciding when to load things it already knows about. Like the last images, they aren't in the viewport so maybe it waited. Also, we purposefully lazy loaded the last few scripts because those bundles aren't needed for the initial render)

When it comes to really complex web application UI, with several layers of navigation and nested layouts, Remix is uniquely positioned to parallelize those page loads, too. This demo doesn't show that off, but it makes a huge difference in web apps. <small>(Sounds like we need a follow up example that fully utilizes Remix's design.)</small>

We are fanatical about parallelizing everything in Remix.

**Image Loading**: As you saw in the loading animations, the images start and finish loading sooner in Remix. Ironically, it's because of [Next.js Image Optimizations][next-img].

![Next.js website without images when JS is disabled][nextnojs]

<figcaption>Next.js Version with JavaScript Disabled</figcaption>

Unfortunately, `next/img` loads the images with JavaScript instead of HTML. That means it's blocked until the JavaScript is downloaded, parsed, and evaluated. There are a lot of ways to accidentally create a network waterfall chain! <small>(Sounds like a good blog post.)</small>.

Scroll back up to the waterfall graphs and you can see that the Remix site loads three purple image bars way earlier than Next.js does. If they fixed this, they'd get closer to Remix's performance.

Really, all of the blame here rests on `next/img`. It introduced a network waterfall chain and doubled the time to being visually complete. There's no reason a page created from SSG should be slower than the dynamic Remix page.

I don't know if this is a mistake on their part or intentional design. If it's intentional, this is a core value difference between the two frameworks. In Remix, if something _can_ work without JavaScript it _will_ work without JavaScript. It's hard to imagine Remix shipping an API that loads images with JavaScript and no HTML fallback. It's not about "user's might have JS disabled" either. It's about offloading as much to the browser as possible and reaping the performance benefits of doing so.

## Loading Dynamic Pages

In every app, you will eventually hit a case that SSG can't support. In this case it's the search page.

There is an infinite number of query strings a user can submit. With the universe's current constraints on space and time, you can't statically generate infinite pages. SSG is off the table.

When the nature of the data changes, Next.js apps have to start making performance and architectural concessions. Remix's strategy and performance remain unchanged.

[<figcaption>Search Page, Cached, California, Cable</figcaption>][casearchcomp]

![Remix loads in 0.9s, Next in 1.1s][casearchcompgif]

Because SSG doesn't scale to dynamic pages, Next.js switched to client side data fetching (from the user's browser). Taking a peak at the network waterfall will tell us why it's 2.6x slower than Remix.

<div class="flex w-full gap-4">
  <div class="w-1/2">
    <figcaption class="text-center bold text-d-p-sm">Remix Search</figcaption>
    <img src="/blog-images/posts/remix-vs-next/search-waterfall-remix.png" />
  </div>
  <div class="w-1/2">
    <figcaption class="text-center text-d-p-sm">Next.js Search</figcaption>
    <img src="/blog-images/posts/remix-vs-next/search-waterfall-next.png" />
  </div>
</div>

(Now _that_ graphic shows off how Remix parallelizes the network waterfall really well!)

**Why Next.js is slower**: Like the images before, Next.js introduced another waterfall chain. It can't load images until it has fetched data, and it can't fetch data until it has loaded, parsed, and evaluated the JavaScript.

Fetching in the client also means more JavaScript over the network, and more time for parse/eval. Remember, Next.js is sending 40% more JavaScript than Remix. Doing more work in the browser starts to add up (note the red bar at the bottom for a "long task" in Next.js, and only a blip of activity for Remix).

**Why Remix is still fast**: Neither Remix example actually had to talk to the shopify API in the request. While SSG can't cache the search page, the Remix versions can—with either `stale-while-revalidate` or Redis. When you have a single, dynamic way to generate pages, you can tweak your caching strategy without changing your application code. The result is SSG speed on commonly visited, dynamic—pages. The `"/search"` page will likely be primed, as well as the categories on the left nav and common queries like "tshirt".

It's interesting to note that the Next.js app also caches search queries, but only in the browser for that one single user and session. Moving that optimization to the server in Remix speeds it up for everybody.

### Architectural Divergence

The user experience isn't the only thing taking a hit when Next.js moves to fetching in the client. The app now has abstractions for talking to shopify at build time as well as abstractions for talking to shopify in the browser.

Architectural divergences like this make it harder to abstract, resulting in difficult code.

- Do you have to authenticate in the browser?
- Does the API support CORS?
- Does the API SDK even work in the browser?
- How do we share code between build and browser code?
- Is it okay to expose the API token in the browser?
- What permissions does our token that we just shipped to every visitor have?
- Can this function use `process.env`?
- Can this function read `window.location.origin`?
- How do I make a network request that works in both places?
- Can we cache these responses somewhere?
- Should we make an isomorphic cache object that works in both places and pass it in to the different data fetching functions?

<small>(oof, sorry, hard to stop sometimes once you get going...)</small>

Let's answer these questions for Remix, where you only have to abstract the shopify API on the server:

- Do you have to authenticate in the browser? (no)
- Does the API support CORS? (doesn't matter)
- Does the API SDK even work in the browser? (doesn't need to)
- How do we share code between build and browser code? (you don't have to)
- Is it okay to expose the API token in the browser? (don't need to)
- What permissions does our token that we just shipped to every visitor have? (you didn't!)
- Can this function use `process.env`? (yes)
- Can this function read `window.location.origin`? (no)
- How do I make a network request that works in both places? (however you want, its not in the browser)
- Can we cache these responses somewhere? (sure, HTTP, redis, lru-cache, persistent volume, sqlite...)
- Should we make an isomorphic cache object that works in both places and pass it in to the different data fetching functions? (don't need to!)

The simpler these questions are to answer, the better your abstractions will be, resulting in simpler code to work with.

### Dynamic Page w/ Empty Cache

> What about a cache miss though!

Let's travel around the world to Sydney, Australia and see what a cache miss is like down under with Remix.

[<figcaption>Search Page, Empty Cache, Sydney, Cable</figcaption>][sydney-cache-miss-comp]

![Remix loads in 3.9s, Next in 8s][sydney-cache-miss-gif]

| App     | First Paint        | Visually Complete  |
| ------- | ------------------ | ------------------ |
| Remix   | 1.5s               | 1.6s (1.6x faster) |
| Next.js | 1.0s (1.5x faster) | 2.6s               |

A ha! Finally a UX tradeoff. There's an argument that getting a skeleton screen in front of the user sooner but a visually complete page later is better. You'd have to A/B test this in your own app to be sure. The delta between those states matters too.

My money is on the fetching, especially as the Redis cache fills up with common queries. Those requests would come out of the cache and be visually complete at the same time the skeleton screens show up.

I wouldn't leave it to a hunch though in the real world, I'd test it. Because of Remix's design, it would be a two-line net change in my route:

```tsx
// original, server fetched
import { useLoaderData } from "remix";
export { loader } from "~/routes/search-products";

export default function Search() {
  let search = useLoaderData();
  return <SearchPage data={search} />;
}
```

```tsx
// client fetched with skeleton
import { useFetcher, useSearchParams } from "remix";

export default function Search() {
  let search = useFetcher();
  let [params] = useSearchParams();
  React.useEffect(() => search.load(`/search-products?${params}`), [params]);
  return search.data ? <SearchPage data={search.data} /> : <Skeleton />;
}
```

Nothing fundamentally changes about _how_ the data is loaded, simply _when_. No questions about API tokens, SDK browser compatibility, etc. All abstractions around the shopify API remain unchanged.

This is a big difference from Next.js, and even backend-focused frameworks like Rails, Phoenix, and Laravel. If you want to do the fetching with the document, you can use their abstractions (like `getServerSideProps`), but if you want to change to client fetching, you have to:

- Move the loading code to an "api route"
- Ship extra JavaScript to the browser
- Get API tokens/auth/envvars into the browser (safely!)

It's a complete shift for your application code. Sometimes even a different team and project. As you get more familiar with Remix, you'll see that the transition from server to browser code is unprecedented in web development.

### It's About the User's Network

Let's do one more, this time in Hong Kong with a slow network.

[<figcaption>Search Page, Empty Cache, Hong Kong, 3G</figcaption>][casearchcomp3g]

![Remix loads in 3.9s, Next in 8s][casearchcomp3ggif]

| App     | First Paint | Product Text | Visually Complete |
| ------- | ----------- | ------------ | ----------------- |
| Remix   | 2.6s        | 2.6s (1.9x)  | 3.9s (2x)         |
| Next.js | 1.9s (1.3x) | 5.0s         | 8s                |

Next is now four seconds behind on a Remix cache miss. As the user's network gets worse, the data fetching takes longer and the waterfall chain penalties are compounded.

On the flip side, as the user's network gets slower in Remix, the TTFB penalty for server fetching is diminished.

Consider that it takes Remix on the server 300ms to fetch the search results. That's as big as the penalty will ever get, it's decoupled from the user's network. User's with fast connections still get a fast TTFB and everybody gets a faster time to "visually complete" than client fetching.

Your server's connection to the cloud is almost guaranteed to be faster than the user's. Probably best to keep the data fetching there. In other words, you can make your server fast, but you can't do anything about the user's network. All you can do is:

- Parallelize the network waterfall
- Do more on the server where the connection is fast
- Send less stuff for the browser to download and parse/eval
- Run servers close to the user

And that's exactly what Remix is designed to do.

## Clientside Transitions

Both frameworks can prefetch resources for links before the user clicks them. This enables instant transitions from the home page to the product pages.

However, Next.js can only do this for pages that use SSG. The search page is out, again. <small>(Poor thing is probably feeling left out, it wants to be blazing fast too)</small>

Remix can prefetch any page because there was no architectural divergence for data loading. Prefetching an unknowable, user-driven search page URL is not any different than prefetching a knowable product URL.

In fact, Remix prefetching isn't limited to just links, it can prefetch any page, at any time, for any reason! Check this out, prefetching the search page as the user types:

<figcaption>Search Input Prefetching, Fast 3G</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/prefetch-search.mp4" type="video/mp4" />
</video>

No spinners, no skeletons, instant user experiences, even on slow networks 🏎

This was super easy to do, too.

```tsx
import { Form, PrefetchPageLinks } from "remix";

function Search() {
  let [query, setQuery] = useState("");
  return (
    <Form>
      <input type="text" name="q" onChange={e => setQuery(e.target.value)} />
      {query && <PrefetchPageLinks page={`/search?q=${query}`} />}
    </Form>
  );
}
```

Since Remix uses HTML `<link rel="prefetch">` (instead of an in memory cache like Next.js) the browser actually makes the requests, not Remix. Watching the video you can see how the requests are cancelled as the user interrupts the current fetch. Remix didn't have to ship a single character of code for that top-notch handling of asynchrony. #useThePlatform 😎.

## Data Mutations

This is where Remix and Next.js start to look completely different. Half of your app code is related to data mutations, we think it's time your web framework respects that. Next.js doesn't have any API for data mutations but Remix does.

**How mutations work in Next.js**: Next.js doesn't do anything for you here. `<button onClick={itsAllUpToYou}>`. Typically you'll manage the form's state to know what to post, add an API route to post to, track loading and errors states yourself, and finally deal with errors, interruptions, and race conditions yourself <small>(lol, nobody deals with that stuff)</small>.

**How mutations work in Remix**:

Remix uses HTML forms.

> pffft ... I'm building a web app, this will never work.

Highly interactive web apps have been my entire career. While the API you're about to see looks incapable of handling the needs of a modern web app, I assure you it is. <small>(We've got an example coming soon.)</small>

Since the dawn of the web, a mutation is modeled as `<form method="post" action="/add-to-cart">`. Ignoring Remix completely, it looks like this:

```html
<form method="post" action="/add-to-cart">
  <input type="hidden" name="productId" value="123" />
  <button>Add to Cart</button>
</form>
```

```js
// on the server at `/add-to-cart`
export default async function addToCart(request) {
  let formData = await request.formData();
  // add the item to the user's cart
}
```

The browser navigates to `"/add-to-cart"` with a POST of the form's serialized data, adds pending UI, and renders a new page with all fresh data from your database when it's done.

Remix does the same thing, except optimized with capital-F `<Form>` and a function on your route named `action` (imagine your Next.js pages were their own API route). It posts with `fetch` instead of a document reload and then revalidates all the data on the page with the server to keep the UI in sync with the back end. This is the same thing you're used to doing in an SPA, except Remix manages it all for you.

There are no React Context or global state management tricks. There's no extra application code needed to communicate a mutation with the server. This is why the Remix bundles are nearly 30% smaller than the Next.js bundles.

## Errors, Interruptions, and Race Conditions

Because Remix can handle both data loading and mutations, it has a unique ability in the web framework space to fix long-standing issues with web apps.

### Unhandled Errors

What happens when the the add to cart backend handler throws an error?

<figcaption>Next.js Failed POST</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/next-error.mp4" type="video/mp4" />
</video>

Nothing happens. Error handling is difficult and annoying. Many developers just skip it as they did here. We think this is a terrible default user experience.

Let's see what happens in Remix.

<figcaption>Remix Failed POST</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/remix-error.mp4" type="video/mp4" />
</video>

Remix can handle almost every error in your app: errors while rendering in the browser, rendering on the server, loading data on the initial page, loading data on client side transitions, and even data mutations as seen here. All handled by default.

All you have to do is define an [error boundary][eb] at the root of your app. You can even get more granular and only take down the section of the page that had an error.

### Interruptions

Users often click a button twice on accident and most apps don't deal with it very well. But sometimes you have a button that you fully expect the user to click really fast and want the UI to respond immediately.

In this app, the user can change the quantity of items in the cart. It's likely they'll click it very quickly to increment the number a few times.

Let's see how the Next.js app deals with interruptions

<figcaption>Next.js Interruption</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/change-quantity-next.mp4" type="video/mp4" />
</video>

It's a little difficult to see exactly what's happening, but if you scrub the video controls you can see it better. There's a weird thing from 5 to 6 to 5 in the middle. The final seconds are the most interesting though. You can see that the very last request sent lands (to go to 4) and then a couple frames later the very first request sent lands! The quantity fields jumps from 5, to 4, to 2, without any user interaction. Kind of hard UI to trust.

This code didn't manage race conditions, interruptions, or revalidation, so the UI is now possibly out of sync with the server (it depends if the 2 or the 4 was the last to hit the server side code). Managing interruptions and revalidating data after mutations would have prevented this.

I get it, dealing with race conditions and interruptions is hard! That's why most apps don't do it. The Vercel team is one of the most talented development teams in the industry and they missed this.

In fact, when we ported the React Server Components example built by the React Core team in our last blog post, _they also had this same bug_.

I said earlier that we are fanatical about the network tab. Let's see how Remix handles this.

<figcaption>Remix Interruption</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/change-quantity-remix.mp4?f" type="video/mp4" />
</video>

You can see Remix cancels the request on interruptions and revalidates the data after the POST completes. This ensures that the UI across the entire page (not just this form) is sync with whatever changes your form just made with the server.

You might think that maybe we just had more attention to detail in our app than the Next.js app. None of this behavior is in the application code. It's all built-in to Remix's data mutation APIs. <small>(It's really just doing what the browser does with HTML forms....)</small>

The integration and transition between the client and server in Remix is unprecedented <small>(I need a new word)</small>.

## Remix ❤️ the Web

In our decades-long careers in web dev, we remember how simple it used to be. Put a button in a form, point it at a page that writes to the database, redirect, get the updated UI. It was so easy.

When designing Remix APIs, we always look to the platform first. Like the mutation workflow. We knew the HTML form API + a server side handler was right, so we built around that. It wasn't the goal, but a seriously amazing side effect is that the core features of an idiomatic Remix app work without JavaScript!

<figcaption>Remix Without JavaScript</figcaption>

<video autoplay loop controls width="100%">
  <source src="/blog-images/posts/remix-vs-next/no-js.mp4" type="video/mp4" />
</video>

While it's totally valid to use Remix this way, it's not our intent that you build websites without JavaScript. We've got a lot of ambition for building amazing user interfaces and you need JavaScript for that.

What we wanted was the simplicity of HTML and got resilience. Maybe your user just went into a tunnel on the train as the page was loading the JavaScript. That page will still generally work.

When you write server side code in Remix, there isn't very much "Remix API" to learn. Instead of inventing another new JavaScript request/response API, Remix uses the [Web Fetch API][fetch]. To work with URL search params, we use the built-in `URLSearchParams`. To work with form data, we use the built-in `FormData`.

```js
export function loader({ request }) {
  // request is a standard web fetch request
  let url = new URL(request.url);

  // remix doesn't do non-standard search param parsing,
  // you use the built in URLSearchParams object
  let query = url.searchParams.get("q");
}

export function action({ request }) {
  // formData is part of the web fetch api
  let formData = await request.formData();
}
```

You will find that when you start learning Remix, you'll spend as much time on the MDN docs, if not more, than the Remix docs. We want Remix to help you build better websites even when you're not using it.

It's a core value for us. Remix starts with HTML, HTTP as the foundation, and then enhances it JavaScript, providing all the tools you need to build modern web apps.

While Remix apps are incredibly fast, we actually aren't hyper focused on performance, just great user and developer experiences. We look to the platform for answers to problems, make them easier to use, and the performance shakes out by itself.

## Discussion

Now that you know how both frameworks do things, let's have a bit of a final discussion. I've always liked the phrase "Optimize for change", and we talk about that a lot when we design Remix APIs. Let's look at a few things that might change in this app.

### Changing the Home Page

Let's consider you want to change the products on the home page, what does that look like? You have two choices in Next.js:

- Rebuild and redeploy your app. Your build times will grow linearly with the number of products in your store (each build has to pull data from shopify for every product). Simply changing a typo in your footer requires you to download every product from shopify to deploy that change. As your store grows to thousands of products, this will become a problem.

- Use [Incremental Static Regeneration][isr]. Vercel recognizes this issue with SSG, so they created ISR. When a page is requested, the server sends the cached version and then rebuilds it with fresh data in the background. The next visitor get's the newly cached version.

  If the page wasn't built when you deployed, Next.js will server render the page and then cache it on the CDN. This is, quite literally, exactly what HTTP stale-while-revalidate does, except ISR comes with a non-standard API and vendor lock-in.

In Remix, you simply update your products with Shopify and your products will be updated within your caching TTL. You could also set up a webhook in an afternoon to invalidate the home page query.

This infrastructure is more work than going with SSG, but as we've seen in this article, it scales to any size product catalog, any kind of UI (the search page) and actually gets faster than SSG with more users (we can cache common search queries). You're also not coupled to a specific host, and barely coupled to a framework.

Additionally, we think loading data in only one way, on the server, leads to cleaner abstractions.

Finally, building the Next.js app for a shopify store with just 250 products takes [TODO:] minutes, and that just keeps growing with your catalog. Running the Remix build takes three seconds.

> What about empty caches hits?

This is a great question. Server and HTTP caching only work when your site is getting traffic. Turns out, your business only works when your site is getting traffic too 😳. You don't need your two page views a day to be one second faster, you need an email list.

- Empty cache hits on product pages in Remix are no slower than the search page in the Next.js site (where it can't use SSG). When was the last time you shopped online without searching? As that cache fills up with common queries, it gets way faster than Next.js
- Common landing pages will be primed pretty much always, then Remix's prefetching makes the next transitions instant. Remix can prefetch any page, dynamic or otherwise, Next.js can't.
- At a certain scale with SSG, you'll need to switch to ISR. Now you have the same cache miss problem on pages that weren't part of your last deployment.

If cache miss requests are a significant portion of your visits, getting 100% cache hits won't fix your business: you don't have a technical problem, you have a marketing problem.

### Personalization

Imagine the product team comes to you and says the home page is changing to display similar products to what the user has purchased in the past instead of a set list of products.

Like the search page, SSG is out the door. This has to be dynamic. Now you've got a network waterfall chain killing your perf. SSG has a limited set of use-cases. The moment you want to display personalized information, it's over.

For Remix, this is just a different database query on the backend.

Virtually every website has users. As your site grows you're going to start showing the user more and more personalized information.

In this case, the top of the ecommerce food chain is Amazon.com. That entire page is personalized. We already know the end from the beginning here. Invest in architecture that will get you there, not stuff you'll need to drop when the product team tweaks the home page.

## Bottom Line

Remix apps get their speed from backend infrastructure and prefetching. Next.js gets its speed from SSG. Since SSG has limited use cases, especially as features and data scale, you will lose that speed unless you make your back end fast.

Since you have to make your back end fast in either case, invest your time there instead of abstractions for the architectural divergence caused by SSG.

Data loading is only half of the story. In Remix, your data abstractions can also encapsulate data mutation concerns since Remix has both loading and mutation APIs. All the code stays on the server, leading to better application code and smaller bundles in the browser.

With Next.js you have to ship your own data mutation code to the browser to interact with the API routes and propagate updates to the rest of the UI. As we saw in this article, even top teams mess this up around errors, interruptions, and race conditions. Not only does this cause a degraded user experience, we think this architectural divergence makes application abstractions harder work with, too (but you get to decide that for yourself in the next section).

> You're ignoring `getServerSideProps`

A lot of folks say you can do all the things Remix does with `getServerSideProps`. This would definitely make it easier to build the shopify abstractions in Next.js and keep it all on the server. But Next.js doesn't have any APIs to communicate with those data mutation APIs built in, you are still on your own to communicate with those

We didn't even get to talk about some of our favorite features in Remix like nested routes (and Remix's built-in network optimizations around them), catch boundaries, transition APIs for pending and optimistic UI, resource routes, SEO, built-in session abstractions, and more. Perhaps now that we've answered the big question everybody keeps asking us, we can start really showing off what Remix can do!

## Scavenger Hunt 🥾

I made a totally subjective point earlier, that I think Remix's design leads to better application abstractions.

Remix handles all communication with the server, and all data loading and mutations happen there. There are fewer things you need to abstract, and far fewer constraints around those abstractions.

Next.js has four ways to load data (and zero ways to change data) mentioned in the docs. Each one called at different times and in different places.

I don't have any numbers, graphs, or videos, but rather a scavenger hunt so you can make up your own mind on this point. So here's your scavenger hunt. Follow the code in each projects for these features:

- Figure out how a product page gets its data
- Figure out how the search page gets its data
- Figure out how a commerce provider is created
- Imagine how to build a new commerce provider

Here are the repositories:

- [Next.js source][next-source]
- [Remix source][remix-source]

Here are the deployments:

- [Next.js][next-demo]
- [Remix][remix-rewrite]

Godspeed and thanks for reading!

[virginiacomp]: https://www.webpagetest.org/video/compare.php?tests=220110_BiDcDD_0efab63a7ceb7ef24e84494b2d6a933b,220110_AiDc3Q_868147ad9eb0337cd50613d7533f5516,220110_BiDcG6_0cc4b5af934d585a72d0cba20f9b3eb6
[virginiacompgif]: /blog-images/posts/remix-vs-next/virginia-comp.gif
[virginia3gcomp]: https://www.webpagetest.org/video/compare.php?tests=220110_AiDcV9_eb4c70e29903014d1873df5b7751df81,220110_AiDcJX_ecd20c1e2400434ce0330fd5300b6fa1,220110_AiDcQK_5a8501241a42b1c7b39a1686ef5905a4
[virginia3gcompgif]: /blog-images/posts/remix-vs-next/virginia-3g-comp.gif
[casearchcomp]: https://www.webpagetest.org/video/compare.php?tests=220110_AiDc3A_a6ce8f39c8c4bc31478a07fc32299cf5,220110_AiDcDT_31916f835aec681ff14dcc1d38d521f0,220110_BiDcAW_f7bcb490c79c4a44a6819c2881e95483
[casearchcompgif]: /blog-images/posts/remix-vs-next/ca-search-comp.gif
[casearchcomp3g]: https://www.webpagetest.org/video/compare.php?tests=220110_AiDc4F_c42c4629d0ca88ef93b9d680225f3362,220110_BiDcR0_613466b208f5c3bff5efcb7fc73ab649
[casearchcomp3ggif]: /blog-images/posts/remix-vs-next/ca-search-comp-3g.gif
[hkgsearchcomp]: https://www.webpagetest.org/video/compare.php?tests=220110_AiDcMC_9b1603305e652189ea080a7b8ae75973,220110_AiDc72_5d6c4bc51f42348f04eee578560bf1cd
[hkgsearchcompgif]: /blog-images/posts/remix-vs-next/hkg-search-comp.gif
[nextnojs]: /blog-images/posts/remix-vs-next/next-no-js.jpg
[next-demo]: https://shopify.demo.vercel.store/
[remix-port]: https://remix-commerce-mcansh.vercel.app/
[remix-rewrite]: https://remix-ecommerce.fly.dev
[remix-port-comp]: https://www.webpagetest.org/video/compare.php?tests=220107_BiDcXG_957c13e3a7f5032087c05863a51897bd,220107_BiDcR8_009afbe99ea1cf88d225d7d477be5e89
[remix-rewrite-comp]: https://www.webpagetest.org/video/compare.php?tests=220107_AiDcK1_cea51d961abd2fb47b99323b57639e65,220107_BiDcEZ_bccde0e5f3f4e88d01ec5e6a9e5e8af0
[next-examples]: https://nextjs.org/examples
[wpt]: https://webpagetest.org
[getstaticprops]: https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation
[swr]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-while-revalidate
[isr]: https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration
[next-img]: https://nextjs.org/docs/basic-features/image-optimization
[remix-empty-cache]: https://webpagetest.org/result/220108_AiDcA0_c4f31854ad52fa5ac54c7f725871de01/1/details/#waterfall_view_step1
[sie]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#stale-if-error
[prefetch]: https://caniuse.com/link-rel-prefetch
[sydney-cache-miss-comp]: https://www.webpagetest.org/video/compare.php?tests=220110_BiDcTH_bfa0341e83efd414f71ac8ed2f1d311f,220110_AiDcC5_7efb60a6c8e1eb4928922b5bac788436#
[sydney-cache-miss-gif]: /blog-images/posts/remix-vs-next/sydney-cache-miss-cable.gif
[vercel-miss]: https://www.webpagetest.org/result/220110_BiDcT5_204e5de35a6e50af0e62b4972b34c987/1/details/#waterfall_view_step1
[redis]: https://redis.com/
[code-next-add-to-cart]: https://github.com/vercel/commerce/blob/3670ff58690be3af9e2fc33f0d4ba04c992d2cb9/components/product/ProductSidebar/ProductSidebar.tsx#L64
[code-next-api-call]: https://github.com/vercel/commerce/blob/3670ff58690be3af9e2fc33f0d4ba04c992d2cb9/components/product/ProductSidebar/ProductSidebar.tsx#L29-L41
[eb]: https://remix.run/docs/en/v1/guides/errors
[next-source]: https://github.com/vercel/commerce
[remix-source]: https://github.com/jacob-ebey/remix-ecommerce
[fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
