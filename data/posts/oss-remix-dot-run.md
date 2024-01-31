---
title: Open Sourcing the Remix Website
summary: The Remix website is now open source, let issues and PRs flow
date: 2024-01-31
image: /blog-images/headers/remix-dot-run.png
imageAlt: "Remix Website homepage"
authors:
  - Brooks Lybrand
---

Today, we're thrilled to announce that this very website, [remix.run](https://remix.run), is now open source! We invite you to explore and learn from the [source code](https://github.com/remix-run/remix-website) and consider [contributing](#how-to-contribute).

## Why we are open-sourcing

Over 2 years ago [Remix went open source](seed-funding-for-remix#open-source). For 10 years now Ryan and Michael have been working on open source software. Even [reactrouter.com](https://reactrouter.com/) is [open source](https://github.com/remix-run/react-router-website). Needless to say, we're big believers in open source.

So why doesn't everyone open source their website? For good reasons:

- Open sourcing comes with added security risks of potentially leaking data or business logic
- Public repositories require maintainers to spend more time triaging issues, reviewing PRs, and engaging in discussions on feature requests and improvements
- Generally OSS companies spend all their effort making their libraries and website beautiful, and the code behind the website is a hot dumpster fire written with the intention to get it across the line so they can start gaining users (not speaking from personal experience or anything 😅)

Well, we're gonna do it anyway.

We believe the pros outweigh the cons. Open sourcing our website allows us to provide a real-world Remix site to learn from. It also gives us an opportunity to more easily get feedback and contributions from kind-hearted devs in the community (thanks [Ryan Leichty for polishing our docs](https://github.com/remix-run/remix-website/pull/127)). Plus, while our website is relatively straightforward, there are some pretty cool things we're doing.

## A walkthrough the website

### How does the home page work?!

I still don't know.

Ryan Florence wrote it and now you can read [1500 lines of scroll-experience code](https://github.com/remix-run/remix-website/blob/main/app/ui/homepage-scroll-experience.tsx). Or you can just scroll through it multiple times to see all the cool animations like I do.

<img alt="Remix run website scroll experience" src="/blog-images/posts/oss-remix-dot-run/home-screen.gif" width="960" height="623" />

### Docs without SSG

One of the unique features of our website is that we handle documentation without State Site Generation (prerendering the pages in build).

The reason we do this is so we don't have to rebuild our entire site every time we fix a typo. In fact, the Remix docs don't exist in this repo at all. You can find them in the [Remix codebase](https://github.com/remix-run/remix/tree/main/docs) right next to the code. We have the docs here

- To keep it close to the code
- To make it easy to contribute to (before we opened these docs)
- So the docs coupled to specific versions of Remix, thanks to the git history.

This last point is the reason we can continue serving the docs for each version of Remix forever. We can even render the [dev docs](https://remix.run/docs/en/dev) immediately. Imagine rebuilding every single doc for every single Remix version every time we committed a change. That would be a lot.

<div class="flex justify-center">
  <img alt="Remix docs version dropdown menu" src="/blog-images/posts/oss-remix-dot-run/docs-dropdown.png" width="724" height="724" class="max-w-[500px] w-full" />
</div>

We're able to accomplish this by fetching the markdown from GitHub in the `loader` and server rendering the requested doc page in the route. Since this content doesn't change _that_ often, we leverage a [LRU cache](https://www.npmjs.com/package/lru-cache) to cache the results on the server for 5 minutes. We also send `Cache-Control` headers with `stale-while-revalidate` along with the response, that way when something has changed the updated doc will render and populate to the CDN in the background for the next request

```js
return json(
  { doc },
  {
    headers: {
      "Cache-Control": "max-age=300, stale-while-revalidate=604800",
    },
  },
);
```

### Showcase and Resources

You may have noticed that we've recently started adding a few more pages to the website

- [Remix Showcase](/showcase) to show off the companies, organizations, nonprofits, and indie developers building better websites with Remix
- [Remix Resources](/resources) to highlight stacks, templates, and libraries built by the community for the community

We have a many plans to continue improving these pages, as well as add more pages we think will be helpful for the community. However, up until this point contributing examples to these pages has only been possible by hoping the core team notices your project and adds it to the page. We're excited to flip that and make contributions just a PR away.

### Vite!

Remix.run already uses the new Vite plugin. This change was largely made so we could dog-food the new plugin and make sure it works for a real, production site. However, now changes like this will be much easier to show off and let others learn from.

Here are some (simplified) examples where we were able to remove clunky patterns Remix forced us into and now Vite makes incredibly simple.

**Loading markdown for blog posts**

```diff
- import path from "path";
- import fs from "fs";

- const dataPath = path.join(__dirname, "..", "data");
- const blogPath = path.join(dataPath, "posts");

+ const postContentsBySlug = Object.fromEntries(
+   Object.entries(
+     import.meta.glob("../../data/posts/*.md", { as: "raw", eager: true }),
+   ).map(([filePath, contents]) => [
+     filePath.replace("../../data/posts/", "").replace(/\.md$/, ""),
+     contents,
+   ]),
+ );

export async function getBlogPost(slug: string): Promise<BlogPost> {
  let cached = postsCache.get(slug);
-   if (cached) return cached;
-   let filePath = path.join(blogPath, slug + ".md");
-   let contents: string;
-   try {
-     contents = (await fs.promises.readFile(filePath)).toString();
-   } catch (e) {
+   let contents = postContentsBySlug[slug];
+   if (!contents) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }
}
```

**Loading Author data from a yaml file**

```diff
import yaml from "yaml";
+ import authorsYamlFileContents from "../../data/authors.yml?raw";


- const AUTHORS: BlogAuthor[] = yaml.parse(
-   fs.readFileSync(path.join(dataPath, "authors.yml")).toString(),
- )

+ const AUTHORS: BlogAuthor[] = yaml.parse(authorsYamlFileContents);
```

[Checkout the Vite migration PR](https://github.com/remix-run/remix-website/pull/143/files), and while you're there, checkout how easy it was to [swap our server from CJS to ESM](https://github.com/remix-run/remix-website/pull/162/files).

## How to contribute

Personally, I wanted to make open source contributions _years_ before I worked up the courage to. While this says more about me than anything, one thing I know that would have made it easier is contributing to an open source website vs a library. Why? Because I work on websites all day long at work, it's what I already know. I don't write libraries. Far fewer web developers write libraries than write websites.

That's why I'm excited to be open-sourcing our website. I strongly believe the shift to contributing to a website with a public repository is much simpler than contributing to a library for many developers. I hope this announcement offers an easier opportunity for many of you to make your first ever open source contribution.

In fact, we've gone ahead and curated a number of [good first issues](https://github.com/remix-run/remix-website/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) to make it even easier to get started. These are issues we have specifically marked as being friendly for new contributors. So whether you're a seasoned OSS contributor or just trying to break in, we're excited to see your GitHub profile pop up in the "Pull request" tab.

Happy contributing, can't wait to build a better remix.run together.
