import { readdir, readFile } from "node:fs/promises";
import { Feed } from "feed";
import parseFrontMatter from "front-matter";
import { CACHE_CONTROL } from "../../shared/cache-control.ts";

interface BlogRssFrontmatter {
  title?: string;
  summary?: string;
  date?: string | Date;
  draft?: boolean;
}

interface BlogRssPost {
  slug: string;
  title: string;
  summary: string;
  date: Date;
}

const POSTS_DIRECTORY = new URL("../../data/posts/", import.meta.url);

async function getBlogRssPosts(): Promise<BlogRssPost[]> {
  const entries = await readdir(POSTS_DIRECTORY, { withFileTypes: true });
  const posts: BlogRssPost[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const fileUrl = new URL(entry.name, POSTS_DIRECTORY);
    const source = await readFile(fileUrl, "utf8");
    const { attributes } = parseFrontMatter<BlogRssFrontmatter>(source);

    if (attributes.draft || !attributes.title || !attributes.summary) {
      continue;
    }

    const parsedDate =
      attributes.date instanceof Date
        ? attributes.date
        : new Date(String(attributes.date ?? ""));

    if (Number.isNaN(parsedDate.getTime())) {
      continue;
    }

    posts.push({
      slug: entry.name.replace(/\.md$/, ""),
      title: attributes.title,
      summary: attributes.summary,
      date: parsedDate,
    });
  }

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function buildBlogRssResponse(posts: BlogRssPost[]) {
  const blogUrl = "https://remix.run/blog";

  const feed = new Feed({
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

  for (const post of posts) {
    const postLink = `${blogUrl}/${post.slug}`;
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
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

export default async function blogRssHandler() {
  const posts = await getBlogRssPosts();
  return buildBlogRssResponse(posts);
}
