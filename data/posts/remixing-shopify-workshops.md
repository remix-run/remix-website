---
title: Remixing Shopify Workshops
summary: Learn how Shopify is using Remix to build their next generation of developer workshops.
date: 2023-04-28
featured: true
image: /blog-images/headers/remixing-shopify-workshops.jpg
imageAlt: "Shopify Workshop on configuring Webhooks"
authors:
  - David Witt
---

For [Shopify Unite 2022](https://unite.shopify.com/), the Shopify Developer Advocate team wanted to create [technical workshops](https://workshops.shopify.dev/) that in-person event participants could easily follow, but also access remotely. We wanted to focus on writing content rather than building a framework, so we reached for an existing solution, [Google Codelabs](https://github.com/googlecodelabs/tools). Codelabs let us rapidly build customized workshop content with a familiar flavor of Markdown. Our code was built into a static website that we could host and share for anyone to use. The end result was an easy-to-use tutorial platform that worked for both in-person workshops and self-guided learning.

Since [Remix joined Shopify](remixing-shopify) last year, the Shopify Developer Relations team thought it would be a great opportunity to learn the open-source web framework by creating our own tutorial platform. Based on feedback from Unite workshop participants and workshop authors, we outlined two goals for our new platform:

1. Embrace Remix as a framework to build a fast and resilient website with first-class developer ergonomics
1. Preserve the ease of authoring workshops in Markdown: All existing workshops should be “drop in” compatible with minimal rework

With these goals in mind, we sat down, rolled up our sleeves, and dove into Remixing our new workshops project.

## From Markdown to Webpage

When starting an ambitious new project, there’s typically a long list of setup tasks before you get to your first pageview. [Remix stacks](https://remix.run/docs/en/main/pages/stacks) are great tools to shorten this process. We chose the “[Indie Stack](https://github.com/remix-run/indie-stack)” as a solid starting point, made a few edits for our hosting platform, dropped in our Codelabs Markdown files, and we were ready to hack away.

Our first task was to transform Markdown to HTML. Google Codelabs uses some custom Markdown and a build-time compiler to generate static HTML that we can host anywhere. Remix includes [Markdown support](https://remix.run/docs/en/main/guides/mdx) for simple build-time use cases, so we started there. We experimented with this, but decided that we’d need more control over how the Markdown files rendered. Ultimately, it came down to using the existing Markdown structure so each ## Heading 2 would mark a separate step in a workshop:

```markdown
## Introduction <-- Title that shows in the sidebar navigation

Duration: 5:00 <-- Time that sets the time remaining in the header

Step 1 instructions... <-- Content contained in a step "slide"

## Setting up the CLI

Duration: 10:00

Step 2 instructions...
```

For our advanced use case, [MDX Bundler](https://github.com/kentcdodds/mdx-bundler) was a perfect tool to help us format our page. MDX bundler works in six steps:

1. Read the Markdown source and build a Markdown abstract syntax tree (mdast)
1. Transform the mdast using “Remark” Markdown plugins
1. Convert the mdast to an HTML abstract syntax tree (hast)
1. Transform the hast using “Rehype” HTML plugins
1. Convert the hast to an Ecmascript abstract syntax tree (east)
1. Return JavaScript that allows you to control how your markup is rendered in a React component

We knew we’d want to do a lot of experimenting with this process, and Remix and MDX Bundler made it easy to set up a rapid feedback loop for prototyping. We set up a simple function to configure our plugins and used Remix loaders to help us test our results as we worked. Our simplified code to generate our React component is:

```js
export default async function getMdxContent(contentPath: string) {
  const result = await bundleMDX({
    file: getContentFilePath(contentPath),
    cwd: join(process.cwd(), "/app"),
    mdxOptions(options, frontmatter) {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        getImagePlugin(), // set image paths for local dev and production
        remarkDefList, // add support for definition lists (used for callouts)
        remarkGfm, // use github flavoured markdown
        splitWorkshopToSteps, // split workshop into steps, build navigator, setup timer
      ];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeHighlight, // add syntax highlighting
      ];

      return options;
    },
  });

  return result;
}
```

There are tons of Remark and Rehype plugins out there, so we experimented with lots of different configurations to see which AST was suited for the various transformations we’d need to make. Remix routing and rendering made our development loop a joy to use. One easy way to setup a simple feedback system in our route file looked like this:

```js
// routes/workshops.$workshopId.tsx
export async function loader({ params }) {
  const fileContentResult = await getMdxFileContent(
    `workshops/${params["workshopId"]}.mdx`
  );
  const { code, frontmatter } = fileContentResult;

  return {
    code,
    frontmatter,
  };
}

export default function WorkshopPage() {
  const { code, frontmatter } = useLoaderData();
  const Component = useMemo(() => getMDXComponent(code), [code]);
  return (
    <div>
      <Component />
      <pre>{code}</pre>
    </div>
  );
}
```

We could feed our route component small Markdown files and see the output code. Remix is really good about showing sensible error messages, and we could debug our AST inside each plugin as needed using a standard Node debugger inside VS Code.

[The MDX docs](https://mdxjs.com/playground/) has a playground that shows a tool similar to what we built. It shows all the syntax trees to help you understand each step in the transformation process. This fast feedback loop encouraged experimentation and rapid problem solving. We went from a Google Codelab flavor of Markdown to a curated tree of React components much faster than we anticipated.

## #use-the-platform

One of the recurring themes you’ll see when learning Remix is that the web platform is capable of handling a lot of our work. Over the years, developers have engineered systems to work around some of the nastier parts of the web (jQuery for DOM traversals anyone?). These tools informed new APIs. The web has now matured to a point where we can start using standard APIs and methods to do most of our work. Remix embraces these APIs where it can so you can just “use the platform”.

Remix really showed its utility on our [workshops home page](https://workshops.shopify.dev/). You’ve probably seen these types of index or list pages before. Each workshop Markdown file is read and processed, then rendered into a searchable and filterable grid. I’ve built many of these types of pages before and there’s quite a bit I needed to do to make them functional and accessible.

I needed to render an unfiltered grid, then filter it based on a button click, making sure the button is styled as “active”. That state needs to be shared with the search bar, since I’d usually want to override or merge the results. Oh, and it would be nice to be able to share this filtered state with a coworker that shows relevant results. Instead of reaching for one of a million state libraries to manage this complex case, I used the URL as my state machine.

That’s right, the URL. Remix works across the server and browser to ensure your state is always up to date. Just like a React component will re-render if one of its props changes, a Remix page will re-render if its URL changes. That means you can write your entire page and treat it like a big React component with a url prop. This mental model allows developers to drastically reduce the code needed to write since the web is really good at working with URLs and Remix is really good about loading data on a page. Here’s our home page code that handles a filtered category as a URL parameter:

```js
// routes/_index.tsx
export async function loader({ request }) {
  const url = new URL(request.url);
  const catFilter = url.searchParams.get("cat");
  let filteredContent = [];

  const { folderContent } = await getMdxFolderContent("workshops");

  if (catFilter) {
    filteredContent = folderContent.filter((fm) =>
      fm.categoriesArray.includes(catFilter)
    );
  }

  const renderedContent = catFilter ? filteredContent : folderContent;

  return {
    renderedContent,
  };
}

export default function IndexPage() {
  const { renderedContent } = useLoaderData();

  return (
    <main className="workshop-collections">
      {renderedContent &&
        renderedContent.map((fileData) => {
          return <WorkshopCard />;
        })}
    </main>
  );
}
```

No useEffect, no spinning loaders, no state libraries. I iterated through the `renderedContent` array and trusted Remix to rerender when the URL changes. Notice the `URL()` constructor? That’s the same one that’s used and [documented for the web](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL), so I didn’t need to learn anything new.

Since Remix took care of all data loading for us, we only needed to use two small state objects in React to track the current workshop step and some analytics events. Remix helped us to create really tidy React components—and less time debugging React leads to happy developers everywhere.

The filter buttons are `<Link>` components that turn into accessible anchor links. The page even works with JavaScript disabled. When JavasScript is enabled, there are lots of nice features that Remix offers. Category filter buttons include a `preventScrollReset` prop that will help to maintain the user’s scroll position as the page re-renders. Scroll preservation has always been a pain point in single-page applications, so chalk up another huge time saver for Remix. Another nice feature of Remix is its hooks, which help you write stateful code without creating state machines. A category `<Link>` can be styled as “active” by reading the URL search parameters with the `useSearchParams()` hook.

```js
// components/WorkshopFilterBar.tsx
import { Link, useSearchParams } from "@remix-run/react";

export default function WorkshopFilterBar({ categories }) {
  const [searchParams] = useSearchParams();
  const currentCat = searchParams.get("cat");

  return (
    ...
    <Link
      to={`./?cat=${category}`}
      key={category}
      className={`btn btn-secondary ${
        currentCat === category
          ? "btn-secondary-active pointer-events-none"
          : ""
      }`}
      preventScrollReset
    >
    ...
  );
}
```

Performant data loading, done. Progressive enhancement, done. Accessibility—believe it or not—done.

##The Miscellaneous Benefits

We continued to work on the workshops site for a few weeks, mostly focused on the “happy path” where everything works. As we got closer to a finished product, we started to address everything outside the happy path, and Remix had our backs once again.

Errors are a reality of development and websites. Remix has dedicated `ErrorBoundary` and `CatchBoundary` components that can be added to your route to display helpful messages. What’s really neat is when you use nested routes, those [error boundaries are also nested within your application](https://remix.run/docs/en/1.15.0/guides/errors#nested-error-boundaries). This is great because when one piece of your code base blows up, the rest of the app can function as normal.

Triggering error boundaries is as simple as converting a thrown exception into an HTTP Response:

```js
const fileContentResult = await getMdxFileContent(
  `workshops/${workshopId}.mdx`
).catch((e) => {
  if (e.code === "ENOENT") {
    maybeRedirect(workshopId);

    throw new Response("Workshop not found", {
      status: 404,
    });
  }
});

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <BaseLayout>
        <div className="error-container">
          <p className="mx-4">Workshop not found</p>
          <p className="mx-4">
            <Link to="/" className="text-link-underline">
              Find a workshop
            </Link>
          </p>
        </div>
      </BaseLayout>
    );
  }
}
```

Redirects were also easy to manage. Our Codelabs site was hosted on Github pages, so we could send users to a new domain, but the rest of the URL would remain the same. Rather than going to a /codelabs/getting-started, we wanted users going to /workshops/getting-started. This was really easy with Remix:

```js
// routes/codelabs.$codelabs.[index.html].tsx
import { redirect } from "@remix-run/node";

export async function loader({ params }) {
  cost workshopId = params["codelabs"];

  return redirect(`/workshops/${workshopId}`);
}
```

Generating metadata is also super easy with Remix. The `meta()` function runs after the loader, so we can use the front matter from our Markdown files to help generate useful meta and Open Graph tags:

```js
export const meta = ({ data }) => {
  return [
    { title: data?.frontmatter?.title || "Workshop" },
    { description: data?.frontmatter?.summary || "Shopify Workshops" },
    { property: "og:type", content: "website" },
    {
      property: "og:image",
      content: "https://workshops.shopify.dev/social-share-preview.jpg",
    },
    { property: "twitter:card", content: "summary_large_image" },
    {
      property: "twitter:image",
      content: "https://workshops.shopify.dev/social-share-preview.jpg",
    },
    { property: "twitter:creator", content: "@ShopifyDevs" },
  ];
};
```

## Looking to the Future, Reliving the Past

Remix is an impressive and intuitive framework that seamlessly blends the best of both worlds—the simplicity of the past and the innovation of the future. Our team was able to accomplish a great deal in a relatively short amount of time, and we couldn't be happier that we decided to use this framework. We’re excited to take what we’ve learned and bring Remix to our developers to help them simplify their codebase and provide a better experience to their users. [Keep an eye out](https://shopify.engineering/) for new Remixed Shopify projects coming your way in the near future.
