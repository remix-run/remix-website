import { Feed } from "feed";
import type { BlogPostListing } from "../../data/blog.ts";
import { routes } from "../../routes.ts";
import { CACHE } from "../../utils/cache-control.ts";

export function buildBlogRssResponse(posts: BlogPostListing[]) {
  let blogUrl = new URL(routes.blog.index.href(), "https://remix.run").href;

  let feed = new Feed({
    id: blogUrl,
    title: "Remix Blog",
    description:
      "Thoughts about building excellent user experiences with Remix.",
    link: blogUrl,
    language: "en",
    updated: posts.length > 0 ? posts[0].date : new Date(),
    generator: "https://github.com/jpmonette/feed",
    copyright: "© Shopify, Inc.",
  });

  for (let post of posts) {
    let postLink = new URL(
      routes.blog.post.href({ slug: post.slug }),
      "https://remix.run",
    ).href;
    feed.addItem({
      id: postLink,
      title: post.title,
      link: postLink,
      date: post.date,
      description: post.summary,
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml",
      ...CACHE.RESOURCE,
    },
  });
}
