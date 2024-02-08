import type { LoaderFunction } from "@remix-run/node";
import { getBlogPostListings } from "~/lib/blog.server";
import { Feed } from "feed";
import { CACHE_CONTROL } from "~/lib/http.server";

export const loader: LoaderFunction = async () => {
  const blogUrl = `https://remix.run/blog`;
  const posts = await getBlogPostListings();

  const feed = new Feed({
    id: blogUrl,
    title: "Remix Blog",
    description: "Thoughts about building excellent user experiences with Remix.",
    link: blogUrl,
    language: 'en',
    generator: "https://github.com/jpmonette/feed",
    copyright: "© Shopify, Inc.",
  });
  posts.forEach((post) => {
    const postLink = `${blogUrl}/${post.slug}`;
    feed.addItem({
      id: postLink,
      title: post.title,
      link: postLink,
      date: new Date(post.dateDisplay),
      description: post.dateDisplay,
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
};