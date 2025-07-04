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

In a recent blog post we shared a [preview of React Router with RSC support](./rsc-preview). On the surface, it might look like this simply means that Server Components are coming to React Router.

However, the implications are greater than you might expect.

With RSC, so much of what's required to implement React Router's Framework Mode is now provided by React itself. Similar to the architectural shift we made when [Remixing React Router](./remixing-react-router), we're introducing a more powerful RSC-powered Data Mode that brings most of Framework Mode's features to our lower level library APIs.

With this new architecture, Framework Mode can add RSC support in an opt-in/non-breaking fashion, all while becoming simpler under the hood and less coupled to any particular bundler. In this blog post, we'll dive into some of the details of how this works and what it means for you.

## The Challenge of Server-Side React

Building server-rendered React apps has always involved solving a few key challenges:

- **How do you inline data?** You need to get your server data into your components in the browser efficiently.
- **How do you support streaming UI?** Users shouldn't have to wait for all data before seeing something.
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
  let slowDataPromise = getSlowData();
  return {
    criticalData: await getCriticalData(),
    slowData: slowDataPromise,
  };
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

```tsx
// React RSC
// page.tsx
export async function Page() {
  const slowData = getSlowData();
  const criticalData = await getCriticalData();
  return (
    <>
      <h1>{criticalData.title}</h1>
      <Suspense fallback={<Spinner />}>
        <PageClient slowDataPromise={slowDataPromise} />
      </Suspense>
    </>
  );
}

// page.client.tsx
"use client";

export function PageClient({ slowDataPromise }) {
  const slowData = use(slowDataPromise);
  return <PageWidget data={slowData} />;
}
```

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

## The RSC Way

React Router RSC takes a different approach that's actually simpler. Instead of relying on a bundler plugin and custom manifest system:

- You define routes in app code like any other data structure (no more special `routes.ts` bundler plugins or build-time generation required)
- You define a function that handles routing HTML vs data requests
- You define a function that generates RSC payloads that get rendered to HTML somewhere

Notice that these are now just plain data structures and function calls. The result? A simpler, more direct architecture that allows React Router to be a library again for complex full stack apps, only possible thanks to RSC.

It's worth calling out that this simplification is useful _even if you're not using server components_. Even if all of your routes are client components, as they are today, this new architecture means that advanced usage of React Router will no longer require a bundler-specific Framework Mode plugin.

## What This Means for You

- **If you're using React Router in Framework Mode:** Our intention is for the future of Framework Mode to be built on top of React Router RSC, so your existing code will continue to work. When the transition happens, it will be seamless from your perspective. _No migration necessary!_

- **If you're using React Router in Data/Declarative Mode:** You can continue using our existing non-RSC library APIs to build more traditional SPAs and SSR apps, both now and into the future. In a future release, you'll also have the option of using an RSC-powered version of Data Mode.

- **If you're starting a new React Router project:** React Router RSC is still unstable, so we currently recommend using the existing Framework Mode or data/declarative APIs.

- **If you're feeling adventurous:** We'd encourage you to try our initial unstable RSC APIs and provide feedback, file issues, or even help fix any bugs you run into. We'd love to hear what you think!

### What's Coming

We are planning RSC-enabled Framework Mode for Vite. This depends on some low-level bundler work, but when it lands, Framework Mode becomes much simpler:

1. Your existing `routes.ts` config is used to generate RSC-friendly route config
2. Your existing route modules are split into server and `"use client"` parts
3. Any bundler-specific integrations are smoothed over for you

That's it. No more manifest generation, no more complex server entries. Your route modules and logic stay exactly the same, with new `entry.browser.ts`, `entry.ssr.ts`, and `entry.rsc.ts` modules aligning with their respective module graphs.

## The Bottom Line

React Router is getting simpler because React itself is doing more heavy lifting and expecting more from bundlers. RSC brings powerful patterns for data loading, streaming, and code splitting that complement what React Router already does well.

Not only is React Router becoming more powerful — inheriting React's new abilities to render components purely on the server — but it's now able to be used as a simple library for even more use cases, from SPAs all the way up to complex code-split SSR apps.

While we still intend to provide additional Framework Mode conveniences on top of RSC, these now become completely optional. We're confident that many of you will want to use React Router's RSC APIs directly to keep things more minimal and under your control. This also means that, unlike today, we'll much more easily be able to support full stack SSR apps across all RSC-enabled bundlers, not just Vite.

The future of React Router is bright, and we're excited to build it with you.
