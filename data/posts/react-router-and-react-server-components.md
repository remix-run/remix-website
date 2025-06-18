---
title: "React Router and React Server Components: The Path Forward"
summary: TODO
date: 2025-06-18
image: /blog-images/headers/react-router-open-governance.jpg
ogImage: /blog-images/headers/react-router-open-governance.jpg
imageAlt: Robot hands passing a disc labeled with the React Router logo
imageDisableOverlay: true
authors:
  - Jacob Ebey
  - Mark Dalgleish
---

If you're using React Router today, you're probably wondering what React Server Components (RSC) mean for your applications. The good news? React Router is getting simpler, not more complex. Let's dive into what's happening and what it means for you.

## The Challenge of Server-Side React

Building server-rendered React apps has always involved solving a few key challenges:

- **How do you inline data?** You need to get your server data into your components efficiently.
- **How do you support streaming UI?** Users shouldn't wait for all data before seeing anything.
- **How do you code split your routes?** Nobody wants to download your entire app on the first page load.

Different tools have solved these problems in different ways. React Router's Framework Mode provides one approach. React Server Components offer another. And now, React Router is bringing these worlds together.

## How We Handle Server Challenges Today

Let's look at how React Router Framework Mode and React Server Components each tackle these common problems:

### Inlining Data

**Framework Mode**: You return data from loader functions, and React Router handles getting it to your components.

```js
// Framework Mode
export async function loader() {
  const user = await getUser();
  return { user };
}

export default function Profile() {
  const { user } = useLoaderData();
  return <h1>{user.name}</h1>;
}
```

**React RSC**: You pass props to `"use client"` components from server components.

```js
// React RSC
async function ProfileServer() {
  const user = await getUser();
  return <ProfileClient user={user} />;
}
```

**React Router RSC**: You get both options! Use whichever pattern fits your needs.

### Streaming UI

**Framework Mode**: Return promises from loaders and use the `<Await>` component.

```js
// Framework Mode
export function loader() {
  return defer({
    criticalData: getCriticalData(),
    slowData: getSlowData(), // This is a promise
  });
}

export default function Page() {
  const { criticalData, slowData } = useLoaderData();
  return (
    <>
      <h1>{criticalData.title}</h1>
      <Suspense fallback={<Spinner />}>
        <Await resolve={slowData}>
          {(data) => <SlowContent data={data} />}
        </Await>
      </Suspense>
    </>
  );
}
```

**React RSC**: Pass promises as props and use `await` on the server and `use(promise)` on the client.

**React Router RSC**: Again, both patterns are available to you.

### Code Splitting Routes

**Framework Mode**: A `routes.ts` config file processed by a bundler plugin generates a manifest that maps routes to chunks.

**React RSC**: Dynamic imports on the server combined with `"use client"` directives mean the browser only downloads what it needs.

## Under the Hood: How Framework Mode Works

React Router's Framework Mode is powered by some clever bundler integration:

1. You define routes in a `routes.ts` config file
2. A bundler plugin reads this config and generates:
   - A manifest mapping routes to chunks for the browser
   - A server entry containing the manifest and server-side route mappings
3. The React Router runtime uses these generated files to handle routing

This approach has served us well, but it requires significant bundler integration and complexity.

## The New Way: React Router RSC

React Router RSC takes a different approach that's actually simpler:

- Routes defined in app code like any other data structure (no more special `routes.ts` bundler plugins or build-time generation required)
- A function that handles routing HTML vs data requests
- A function that generates RSC payloads that get rendered to HTML somewhere

Notice that these are now just plain data structures and function calls. These APIs replace what previously required an entire bundler plugin and manifest generation system. The result? A simpler, more direct architecture that allows React Router to be a library again for complex full stack apps, only possible thanks to RSC.

It's worth calling out that this simplification is useful _even if you're not using server components_. Even if all of your routes are client components, as they are today, this new architecture means that advanced usage of React Router will no longer require a bundler-specific Framework Mode plugin.

## What This Means for You

- **If you're using React Router in Framework Mode:** Our intention is for the future of Framework Mode to be built on top of React Router RSC, but your existing code will continue to work. When the transition happens, it will be seamless from your perspective. _No migration necessary!_

- **If you're using React Router in Library Mode:** You can continue using our existing non-RSC library APIs to build more traditional SPAs and SSR apps, both now and into the future.

- **If you're starting a new React Router project:** React Router RSC is still unstable, so we currently recommend using the existing Framework Mode or library APIs.

- **If you're feeling adventurous:** We'd encourage you to try our initial unstable RSC APIs and provide feedback, file issues, or even help fix any bugs you run into. We'd love to hear what you think!

### What's Coming

We are planning RSC-enabled Framework Mode for Vite. This depends on some low-level bundler work, but when it lands, Framework Mode becomes much simpler:

1. Create a real routes config from your `routes.ts` convention
2. Split route modules into server and `"use client"` parts
3. Smooth over any bundler-specific integrations that may be required

That's it. No more manifest generation, no more complex server entries. Your route modules and logic stay exactly the same, with new `entry.browser.ts`, `entry.ssr.ts`, and `entry.rsc.ts` modules aligning with their respective module graphs.

## The Bottom Line

React Router is getting simpler because React itself is doing more heavy lifting and expecting more from bundlers. RSC brings powerful patterns for data loading, streaming, and code splitting that complement what React Router already does well.

Not only is React Router becoming more powerful — inheriting React's new abilities to render components purely on the server — but it's now able to be used as a simple library for even more use cases, from SPAs all the way up to complex code-split SSR apps.

While we still intend to provide additional Framework Mode conveniences on top of RSC, these now become completely optional. We're confident that many of you will want to use React Router's RSC APIs directly to keep things more minimal and under your control. This also means that, unlike today, we'll much more easily be able to support full stack SSR apps across all RSC-enabled bundlers, not just Vite.

The future of React Router is bright, and we're excited to build it with you.
