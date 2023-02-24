---
title: Lazy Loading Routes in React Router
summary: Decoupling data-fetching from rendering introduces some complexities if you want to lazily load your route components.  Check out how the newly introduced `route.lazy()` method helps solve this to keep your app bundles small and your UX snappy!
featured: true
date: 2023-02-27
image: /blog-images/posts/lazy-loading-routes/waterfall.jpg
imageAlt: A waterfall down a series of rocks shaped like a stairway
authors:
  - Matt Brophy
---

[React Router 6.4][react-router-6.4] introduced the concept of a _"Data Router"_ with the primary focus being to separate data fetching from rendering to eliminate **render+fetch chains** and the spinners that come along with them.

These chains are more commonly referred to as "waterfalls", but we're trying to re-think that term because most folks hear waterfall and picture [Niagra Falls][niagra], where all of the water falls down in one big nice waterfall.  But "all at once" seems like a great way to load data, so why the hate on "waterfalls"?  Maybe we should chase 'em after all?

In reality, the "waterfalls" we want to avoid look more like the header image above and resemble a staircase.  The water falls a little bit, then stops, then falls a bit more, then stops, and so on and so on.  Now imagine each "fall" in that staircase is a loading spinner.  That's not the type of UI we want to give our users!  So in this article (and hopefully beyond), we're using the term "chain" to indicate fetches that are inherently sequentially ordered, and each fetch is blocked by the fetch before it.


## Render + Fetch Chains

If you haven't yet read the [Remixing React Router][remixing-react-router] post or seen Ryan's [When to Fetch][when-to-fetch] talk from Reactathon last year, you may want to check them out before diving through the rest of this post.  They cover a lot of the background behind **why** we introduced the idea of a Data Router.

The tl;dr; is that when your router is unaware of your data requirements, you end up with chained requests, and subsequent data needs are "discovered" as you render children components:

<img alt="network diagram showing sequential network requests" src="/blog-images/posts/lazy-loading-routes/network1.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Coupling data fetching to components leads to render+fetch chains</figcaption>

But introducing a Data Router allows you to parallelize your fetches and render everything all at once:

<img alt="network diagram showing parallel network requests" src="/blog-images/posts/lazy-loading-routes/network2.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Route fetching parallelizes requests, eliminating slow render+fetch chains</figcaption>

In order to accomplish this, a data router lifts your route definitions out of the render cycle so our router can identify nested data requirements ahead of time.

```jsx
// app.jsx
import Layout, { getUser } from `./layout`;
import Home from `./home`;
import Projects, { getProjects } from `./projects`;
import Project, { getProject } from `./project`;

const routes = [{
  path: '/',
  loader: () => getUser(),
  element: <Layout />,
  children: [{
    index: true,
    element: <Home />,
  }, {
    path: 'projects',
    loader: () => getProjects(),
    element: <Projects />,
    children: [{
      path: ':projectId',
      loader: ({ params }) => getProject(params.projectId),
      element: <Project />,
    }],
  }],
}]
```

But this comes with a downside.  So far we've talked about how to optimize our data fetches, but we've also got to consider how to optimize our JS bundle fetches too!  With this naive route definition above, while we can fetch all of our data in parallel, we've blocked the start of the data fetch by the download of a Javascript bundle containing _all_ of our loaders and _all_ our our components.

**TODO: Should probably remove projects fetches from this diagram if we're assuming users enter on the homepage below**

<img alt="network diagram showing an application JS bundle blocking parallel network requests" src="/blog-images/posts/lazy-loading-routes/network3.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">The singular JS bundle blocks the parallel data fetches</figcaption>

A user loading the homepage at `/` will still be downloading the loaders and components for the `/projects` and `/projects/:projectId` routes, even though they don't need them!  And in cases, the user may not even navigate to those routes and will _never_ need those bundles.  This can't be ideal for our UX.

## `React.lazy` to the Rescue?

[React.lazy][react-lazy] offers a first-class primitive to chunk off portions of your component tree, but it suffers from the same tight-coupling of fetching and rendering that we are trying to eliminate with data routers 😕.  This is because when you use `React.lazy()`, you create an async chunk for your component, but React won't actually _start_ fetching that chunk until it renders the lazy component.

```jsx
// app.jsx
const LazyComponent = React.lazy(() => import('./component'));

function App() {
  return (
    <React.Suspense fallback={<p>Loading lazy chunk...</p>}>
      <LazyComponent />
    </React.Suspense>
  );
}
```

<img alt="network diagram showing a React.lazy() render + fetch chain" src="/blog-images/posts/lazy-loading-routes/network4.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">The React.lazy() call produces a similar render + fetch chain</figcaption>

So while we can leverage `React.lazy()` with data routers, we end up introducing a waterfall to download the component _after_ our data fetches.  Ruben Casas wrote up a great [post][react-router-6.4-code-splitting] on some of the approaches to leverage code-splitting in data routers with `React.lazy()`.

## Introducing `Route.lazy`

If we want lazy-loading to play nicely with data routers, we need to be able to introduce laziness _outside_ of the render cycle.  Just like we lifted data fetching out from the render cycle, we want to lift _route fetching_ out of the render cycle as well.

If you step back and look at a route definition, it can be split into 3 sections:

* Path matching fields such as `path`, `index`, and `children`
* Data loading/submitting fields such `loader` and `action`
* Rendering fields such as `element` and `errorElement`

The only thing a data router truly needs on the critical path is the path matching fields, as it needs to be able to identify all of the routes matched for a given URL.  After matching, we already have an asynchronous navigation in progress so there's no reason we could also be fetching route information during that navigation.  And then we odn't need the rndering aspects until we're done with data-fetching since we don't render the destination route until then.  Yes, this will introduce the concept of a "chain" but it's an opt-in choice to handle the trade-off between initial load speed and subsequent navigation speeds.

Here's what this look like using our route structure from above:

```jsx
// app.jsx
import Layout, { getUser } from `./layout`;
import Home from `./home`;

const routes = [{
  path: '/',
  loader: () => getUser(),
  element: <Layout />,
  children: [{
    index: true,
    element: <Home />,
  }, {
    path: 'projects',
    lazy: () => import("./projects"),
    children: [{
      path: ':projectId',
      lazy: () => import("./project"),
    }],
  }],
}]

// projects.jsx
export function loader = () => { ... }; // Formerly named getProjects

export function Component() { ... } // Formerly named Projects
```

_What's `export function Component` you ask?  The properties exported from this lazy module are added to the route definition verbatim.  Because it's odd to export an `element`, we've added support for `Component` definition directly on a route object now as well._

In this case we've opted to leave the layout and home routes in the primary bundle as thayt's the most common entry-point for our users.  But we've moved the imports of our `projects` and `:projectId` routes into their own lazy imports.  React Router will call these `lazy()` functions in parallel when routing to `/projects/123`, followed by their loaders.

The resulting network graph would look something like this on initial load:

<img alt="network diagram showing a initial load using route.lazy()" src="/blog-images/posts/lazy-loading-routes/network5.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">The lazy() method allows us to trim down our critical path bundle</figcaption>

And then when a user clicks a link to `/projects/123`, we fetch those routes in parallel via the `lazy()` method:

<img alt="network diagram showing a link click using route.lazy()" src="/blog-images/posts/lazy-loading-routes/network6.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">We lazy load routes in parallel on navigations</figcaption>

This gives us a bit of the best of both worlds in that we're able tp trim our critical-poath bundle to the relevant homepage routes.  And then on navigations, we can match paths and fetch the lazy() route definitions in parallel.

## Advanced Usage and Optimizations

Some of the astute readers may feel a bit of a 🕷️ spidey-sense tingling for some hidden chaining going on in here.  Is this the _optimal_ network graph?  As it turns out, it's not!  But it's pretty good for the lack of code we had to write to get it 😉.

Remember that our route modules now include our `loader` as well as our `Component`, which means that we need to download the contents of both of those before we can start our loader fetch.  In practice, your loaders are generally pretty small and hitting external APIs where the majority of your business logic lives.  Components on the other hand define your entire user interface, including all of the user-interactivity that goes along with it - and they can get quite big.  It seems silly to block the loader fetch by a large component?

But for React Router users, what if we could turn this:

<img alt="network diagram showing a loader + component chunk blocking a data fetch" src="/blog-images/posts/lazy-loading-routes/network7.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">Singular route files block the data fetch behind the component download</figcaption>

Into this:

<img alt="network diagram showing separate loader and component files unblocking the data fetch" src="/blog-images/posts/lazy-loading-routes/network8.png" class="border rounded-md p-3 shadow" />

<figcaption class="my-2">We can unblock the data fetch by extracting the component</figcaption>

Because `lazy()` is statically defined and runs immediately, you can get fancy inside and load chunks in whatever way you see fit.  And because your route `Component`/`element` will never attempt to render until the loader has completed, you can even "provide" your component from you loader and get that parallelization of the component chunk and the data fetch.  Here's an example of a utility to will get you the optimized network graph above:

```jsx
const routes = [{
  path: "parallel",
  lazy() {
    return parallelize(
      () => import("./loader"),
      () => import("./component")
    );
  },
}];

async function parallelize(loadLoaderChunk, loadComponentChunk) {
  // Start the component chunk fetch immediately, but don't await it
  let componentPromise = loadComponentChunk();
  // Load the loader chunk in parallel
  let { loader } = await loadLoaderChunk();
  let LoadedComponent;

  return {
    // Once the loader chunk completes, return a loader that calls the actual
    // loader and waits for the component to finish downloading
    async loader(arg) {
      let [data, cmp] = await Promise.all([loader(arg), componentPromise]);
      LoadedComponent = cmp.Component;
      return data;
    },
    // Component is just a wrapper that will reference the loaded component
    Component: () => <LoadedComponent />,
  };
}
```

## Static Properties

It's also worth noting that while you can lazily load any non-path-matching properties via `lazy()`, it's not _required_ that you assign them all via `lazy()`.  You're free to still assign static route properties and they will be unable to be overwritten via `lazy()`.  A future optimization we plan to make is if you statically provide a loader, we'll call it in parallel with `lazy()`.  For example, maybe you have a single API endpoint that knows how to fetch data for a given route based on the route ID:

```js
const routes = [{
  id: 'route',
  path: "parallel",
  loader: ({ request }) => {
    let url = new URL(request.url);
    url.searchParams.set("routeId", "route");
    return fetch(url);
  },
  lazy: () => import("./route"),
}];
```

This way you can include the _Very tiny loader_ on the critical path so it cn start as fast as possible, and still load the `Component` via `lazy()`.  As a matter of fact, this is almost exactly how Remix approaches this issue because route loader sare their own API endpoint.


## More Information

For more information, check out the [decision doc][decision-doc] or the [example][example] in the GitHub repository.


[niagra]: https://en.wikipedia.org/wiki/Niagara_Falls
[react-router-6.4]: https://remix.run/blog/react-router-v6.4
[remixing-react-router]: https://remix.run/blog/remixing-react-router
[when-to-fetch]: https://www.youtube.com/watch?v=95B8mnhzoCM
[react-lazy]: https://beta.reactjs.org/reference/react/lazy
[react-router-6.4-code-splitting]: https://www.infoxicator.com/en/react-router-6-4-code-splitting
[decision-doc]: https://github.com/remix-run/react-router/blob/main/decisions/0002-lazy-route-modules.md
[example]: https://github.com/remix-run/react-router/tree/main/examples/lazy-loading-router-provider