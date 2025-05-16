---
title: React Router RSC Preview
summary: React Router\'s preview support for React Server Components is now available
date: 2025-05-15
authors:
  - Ryan Florence
image: /blog-images/headers/rsc-preview.jpg
ogImage: /blog-images/headers/rsc-preview.jpg
imageAlt: "Stylized series of sci-fi movie poster designs featuring the text 'React Router RSC Preview' with abstract human and robotic figures in dramatic compositions."
---

## tl;dr

- React Router has preview support for RSC!
  - [Clone this repo](https://github.com/jacob-ebey/experimental-parcel-react-router-starter) to try it out
- RSC content from loaders/actions in existing routes
- RSC-first "Server Component Routes"
- Client components with `"use client"`
- Server Functions with `"use server"`
- Check out the demo
  - [Live Demo](https://rsc-movies.fly.dev)
  - [Source Code](https://github.com/ryanflorence/rsc-movies)
- Middleware for batching and caching queries
- Stable release blocked by RSC support in Vite
  - The preview uses Parcel
  - Alternative Bundler integration will be easier than ever

## Acknowledgement

Before we dig in, I just need to take a moment to acknowledge the work of Jacob Ebey. He has been working on RSC support for Remix and React Router for ... years.

He has probably built 12 versions of this. He figured out the best way to support all of React's API in a way that is incrementally adoptable by the millions of React Router apps in production today, but also feels great for a green-field React Router app.

While the project is the work of our whole team and community, RSC in React Router absolutely would not have happened without Jacob. Thank you!

## Try it out

```sh
git clone https://github.com/jacob-ebey/experimental-parcel-react-router-starter
```

Then follow the instructions in the README.md.

## What it looks like

### RSC From Loaders

As [shown at React conf](https://youtu.be/ZcwA0xt8FlQ?t=1433) you can render elements in your loaders and actions in _existing Route Loaders_. This allows you to use RSC only where you want it and facilitates incremental adoption.

A really compelling use case for RSC is when your data determines your components. Without RSC every component needs to be bundled and sent to the browser. With RSC only the rendered client components go to the browser.

```tsx
export async function loader({ params }) {
  let { contentBlocks, ...product } = await getProduct(params.productId);
  return {
    product,
    content: (
      <div>
        {contentBlocks.map((block) => {
          switch (block.type) {
            case "image":
              return <ImageBlock {...block} />;
            case "gallery":
              return <GalleryBlock {...block} />;
            case "video":
              return <VideoBlock {...block} />;
            case "text":
              return <TextBlock {...block} />;
            case "markdown":
              return <MarkdownBlock {...block} />;
            default:
              throw new Error(`Unknown block type: ${block.type}`);
          }
        })}
      </div>
    ),
  };
}

export default function Article({ loaderData }) {
  return (
    <ProductLayout product={loaderData.product}>
      {loaderData.content}
    </ProductLayout>
  );
}
```

This use case is particularly evident when backing your site with a CMS, shopify, or any kind of activity feed on dashboards and social media.

By returning RSC content from loaders, you can get this benefit without going "all in" on server components everywhere else.

### Server Component Routes

Current Route modules can be thought of as "client component routes". They are bundled and sent to the browser, allowing you to `useState` right inside of a route component.

Returning RSC content from loaders sent to a client component route isn't the full architecture that React is going for with RSC. In support of that vision, you can also create RSC-first "Server Component Routes".

<small>Or SCRs, not be confused with RSCs, or even CSR, oh boy ...</small>

Server Routes <small>(that's better)</small> are defined by exporting a `ServerComponent` instead of `default`:

```tsx
export async function ServerComponent({ params }) {
  let project = await loadProduct(params.projectId);
  return (
    <>
      <title>{project.name}</title>
      <ProjectScreen project={project} />
    </>
  );
}
```

React Router will no longer bundle this route for the client like it does other routes. The only code that will go to the browser for this route are any rendered `"use client"` modules.

Note that nested routes can be a mix of both server component routes and existing client component routes so that you can use RSC where it makes sense or incrementally adopt it across the app.

### Server Routes + Loaders/Actions

Server Routes _can still define loaders and actions_.

Loaders run before the React RSC streaming render begins. This makes loaders particularly useful for ensuring you want to handle the request, and if not, send headers and status codes for proper redirects and HTTP semantics. It's also a great place to optimize data loading by preloading any nested data.

```tsx
import { redirect, data } from "react-router";

export async function loader({ request, params }) {
  // redirect if not authenticated
  let user = await getUser(request.headers.get("Cookie"));
  if (!user) {
    throw redirect("/login", { status: 303 });
  }

  let project = await getProject(params.id);

  // render error boundary if unauthorized
  let authorized = isAuthorized(user.id, project);
  if (!authorized) {
    throw data("Unauthorized", { status: 401 });
  }

  // avoid a data waterfall by preloading the project's comments
  // if you know there's a nested <Comments> server component
  preloadComments(project.id);

  return { project };
}

export async function ServerComponent({ loaderData }) {
  return <ProjectScreen />;
}
```

### Server Functions

Server functions defined with `"use server"` are also supported.

```tsx
"use server";

export async function updateFavorite(formData: FormData) {
  let movieId = formData.get("id");
  let intent = formData.get("intent");
  if (intent === "add") {
    await addFavorite(Number(movieId));
  } else {
    await removeFavorite(Number(movieId));
  }
}
```

```tsx
import { updateFavorite } from "./action.ts";

export async function AddToFavoritesForm({ movieId }: { movieId: number }) {
  let isFav = await isFavorite(movieId);
  return (
    <form action={updateFavorite}>
      <input type="hidden" name="id" value={movieId} />
      <input type="hidden" name="intent" value={liked ? "remove" : "add"} />
      <AddToFavoritesButton isFav={isFav} />
    </form>
  );
}
```

Note that after server functions are called, React Router will automatically revalidate the route and update the UI with the new server content, you don't have to mess around with any cache invalidation.

### Client Components

And finally, of course client components are supported too.

```tsx
"use client";
import { useFormStatus } from "react-dom";

export function AddToFavoritesButton({ isFav }) {
  let { pending } = useFormStatus();

  return (
    <button type="submit">
      {pending
        ? isFav
          ? "Removing..."
          : "Adding..."
        : isFav
          ? "Remove from favorites"
          : "Add to favorites"}
    </button>
  );
}
```

## Movie Demo

I built a little demo. Go easy on it, this is all still unstable and hasn't had the UX and design polish I'd like to bring to it yet.

- [RSC Movies Live Demo](https://rsc-movies.fly.dev)
- [GitHub Source](https://github.com/ryanflorence/rsc-movies)

### Batching and Caching

A couple major concerns with the RSC architecture are N+1 queries and over-fetching. It's very easy to do when components can fetch their own data. We saw it happen in many Hydrogen v1 apps and it tanked performance to unacceptable levels.

Here, check out one of the components in the demo:

```tsx
import { Link } from "react-router";
import { load } from "../db";

export async function ActorLink({ id }: { id: number }) {
  let actor = await load().actor(id);
  return (
    <Link to={`/actor/${actor.id}`} className="text-[#1458E1] hover:underline">
      {actor.name}
    </Link>
  );
}
```

The demo renders dozens if not hundreds of these actor links sometimes. If `load().actor(id)` was naive, this would result in dozens of queries to the database. Even if these queries were relatively fast it adds up. It would also refetch the same actor multiple times if that actor was in multiple movies being rendered.

To avoid these issues this demo takes advantage of the "batching and caching" pattern developed by the GraphQL team in [DataLoader](https://github.com/graphql/dataloader). It uses [an alternative library](https://github.com/ryanflorence/batch-loader) I developed but it's the same concept.

Let's say a page renders 36 ActorLinks and 12 of them are duplicates (same actor in multiple movies). Instead of making 36 queries for each component, they are all deduped and batched into _a single query_ for all 24 actors. Additionally, if more ActorLinks are streamed another batched query will be made except it will both dedupe and reuse any previously fetched actors. Finally, the cache only lasts as long as the request, so there's no need to expire anything.

### Middleware Makes it Easy

React Router's middleware feature makes it dead simple to add this kind of strategy to your app. Here's the code for the demo:

```tsx
import { batch } from "@ryanflorence/batch-loader";

// Async context to load data from anywhere in the app
let context = new AsyncLocalStorage<ReturnType<typeof createLoaders>>();

// React Router middleware to provide the context to the app
export const dataMiddleware: MiddlewareFunction<Response> = async (_, next) => {
  // create batchFunctions for just this request
  let batchFunctions = {
    movie: batch(batchMovies),
    actor: batch(batchActors),
  };

  return new Promise((resolve) => {
    context.run(batchFunctions, () => {
      resolve(next());
    });
  });
};

// load function to be used anywhere, especially in components
export function load() {
  return context.getStore() as ReturnType<typeof createLoaders>;
}
```

The middleware is then plugged into the root route:

```tsx
export const unstable_middleware = [sessionMiddleware, dataMiddleware];
```

Now any component (or any other server code) can import `load` and naively load movies and actors. Here's the MovieTile from the demo.

```tsx
import { Link } from "react-router";
import { load } from "../db";
import { ActorLink } from "./actor-link";
import { AddToFavoritesForm } from "./add-to-favorites/form";

export async function MovieTile({ id }: { id: number }) {
  let movie = await load().movie(id);

  return (
    <div className="flex w-[296px] flex-col gap-y-9">
      <Link to={`/movie/${movie.id}`}>
        <img
          src={movie.thumbnail}
          className="mb-4 h-[435px] w-full object-cover"
          alt={movie.title}
        />
      </Link>

      <AddToFavoritesForm movieId={movie.id} />

      <h2 className="font-instrumentSerif text-3xl">
        <Link to={`/movie/${movie.id}`} className="hover:underline">
          {movie.title}
        </Link>{" "}
        ({movie.year})
      </h2>

      <p className="mb-2">
        {movie.extract.length > 350
          ? movie.extract.slice(0, 350) + "..."
          : movie.extract}
      </p>

      <p>
        <b className="font-semibold">Starring</b>:{" "}
        {movie.cast_ids.map((id, index, arr) => (
          <ActorLink id={id} />
        ))}
      </p>
    </div>
  );
}
```

You can render any random MovieTiles anywhere, that each render a bunch of ActorLinks, and only two queries will be made to the DB even though the component is only asking for one. Pretty cool!

I think this is a pretty critical requirement for the RSC architecture to work and we're looking into making it an official part of React Router.

## Easiest Way to Use All of React is React Router

Something a little unexpected happened while we were working on this: a lot of code moved from our Vite plugin and "Framework mode" to our lower level "Data mode" runtime. This makes it significantly easier to bring your own bundler to React Router and use all of React 19's feature set.

When Remix was first released (before it made its way into React Router v7) it provided answers to a lot of questions for production React apps, including:

- How do I load code from the server into my React components?
- How do I change data on the server from React components?
- How do I pre-render my application to HTML on the server?
- How do I know which client assets are needed to transition the HTML into a single page application?
- How do I get the serialized server data into the components in the browser for it to be interactive?

Our answers were loaders, actions, server runtimes, browser runtimes, and a bundler that connected the server and browser together (hydration) through build manifests and serialized data payloads. We called the whole thing Remix.

With the release of React 19, React itself now has answers for all of those questions with async components, RSC streaming formats, and bundler integrations. Our job got much smaller!

Even APIs like `clientLoader`, that today rely on our Vite plugin, are able to be sent through the RSC format at runtime to work with any bundler that supports RSC.

<small>Jacob blew my mind with that one</small>

With less reliance on our own Vite plugin, and deeper integration with React, supporting all of React Router's framework features should be much more realistic for bundlers besides Vite.

## What's Next? Official RSC Support in Vite

You'll note that the preview template only supports Parcel. That's because Vite doesn't have RSC support yet. Work is ongoing between the Vite and React teams, and [things are looking good](https://github.com/facebook/react/pull/33152). In the meantime, we're leveraging [Parcel's RSC support](https://parceljs.org/recipes/rsc) to help us figure out what React Router looks like when RSC is a first-class bundler feature. You'll note in the preview template there's a little Parcel plugin for `routes.ts` to button it all up and it's pretty small. The effort to port to other RSC-native bundlers in the future should be equally minimal.

By targeting RSC-native bundlers like Parcel, we're also helping to guide the direction of Vite's official RSC support. [Hiroshi Ogawa](https://github.com/hi-ogawa) is currently [working publicly on Vite RSC support](https://github.com/hi-ogawa/vite-plugins/tree/main/packages/rsc) and [using React Router's RSC APIs in Vite](https://github.com/hi-ogawa/vite-plugins/tree/main/packages/rsc/examples/react-router) to validate their approach. By sharing our early RSC work publicly, we can help ensure that we'll be ready once Vite RSC support finally lands.

This is very exciting for us: both React's and React Router's full feature sets will soon be usable with very little effort with any bundler, any JavaScript runtime, and any server!

Also, there's still some work to do around optimizing revalidation. Currently the entire page is revalidated after server actions. Because server actions aren't tied to a specific route, our current `shouldRevalidate` approach feels awkward. We're working on a better page revalidation approach that feels great for all use cases.

Take it for a spin and let us know what you think!
