import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { LRUCache } from "lru-cache";
import * as s from "remix/data-schema";
import yaml from "yaml";
import { parseFrontmatter } from "./frontmatter.ts";
import { processMarkdown } from "./md.ts";
import { isProduction } from "../utils/node-env.ts";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const POSTS_DIRECTORY = path.join(DATA_DIRECTORY, "posts");
const AUTHORS_FILE_PATH = path.join(DATA_DIRECTORY, "authors.yml");

const authorSchema = s.object({
  name: s.string(),
  title: s.string(),
  avatar: s.string(),
});

const frontmatterSchema = s.object({
  title: s.string(),
  summary: s.string(),
  date: s.instanceof_(Date),
  draft: s.optional(s.boolean()),
  featured: s.optional(s.boolean()),
  image: s.string(),
  imageAlt: s.string(),
  ogImage: s.optional(s.string()),
  imageDisableOverlay: s.optional(s.boolean()),
  authors: s.array(s.string()),
});

type BlogAuthor = s.InferOutput<typeof authorSchema>;
type BlogPostFrontmatter = s.InferOutput<typeof frontmatterSchema>;

export interface BlogPostListing {
  slug: string;
  title: string;
  summary: string;
  date: Date;
  dateDisplay: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
}

export interface BlogPost extends Omit<BlogPostFrontmatter, "authors"> {
  authors: BlogAuthor[];
  dateDisplay: string;
  html: string;
}

const shouldCacheBlogData = isProduction;
const cachedPostContentsBySlug = shouldCacheBlogData
  ? readPostContentsBySlug()
  : undefined;

const AUTHORS = s.parse(
  s.array(authorSchema),
  yaml.parse(readFileSync(AUTHORS_FILE_PATH, "utf8")),
);

const postsCache = new LRUCache<string, BlogPost>({
  maxSize: 1024 * 1024 * 12,
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

/** Render a post, or return `null` when no post has this slug. */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (shouldCacheBlogData) {
    let cached = postsCache.get(slug);
    if (cached) return cached;
  }

  let contents = getRawBlogPostMarkdown(slug);
  if (contents === null) return null;

  let { attributes, html } = await processMarkdown(contents);
  let frontmatter = parsePostFrontmatter(slug, attributes);
  let authors = frontmatter.authors.flatMap((name) => {
    let author = AUTHORS.find((a) => a.name === name);
    return author ? [author] : [];
  });
  if (authors.length === 0) {
    console.warn(
      "The author info in `%s` is incorrect and should be fixed to match what’s in the `authors.yaml` file.",
      slug,
    );
  }

  let post: BlogPost = {
    ...frontmatter,
    authors,
    dateDisplay: formatDate(frontmatter.date),
    html,
  };
  if (shouldCacheBlogData) postsCache.set(slug, post);
  return post;
}

let postListings: BlogPostListing[] | undefined;

/**
 * Published posts, newest first. Used by the blog index and the RSS feed.
 *
 * The listing only renders frontmatter, so it parses frontmatter instead of
 * running every post through the markdown/Shiki pipeline. Rendering all posts
 * just to read their titles cost ~1.1s on the first request to /blog.
 */
export function getBlogPostListings(): BlogPostListing[] {
  if (shouldCacheBlogData && postListings) return postListings;

  let listings: BlogPostListing[] = [];
  for (let [slug, contents] of Object.entries(getPostContentsBySlug())) {
    let frontmatter = parsePostFrontmatter(
      slug,
      parseFrontmatter(contents).attributes,
    );
    if (frontmatter.draft) continue;

    listings.push({
      slug,
      title: frontmatter.title,
      summary: frontmatter.summary,
      date: frontmatter.date,
      dateDisplay: formatDate(frontmatter.date),
      image: frontmatter.image,
      imageAlt: frontmatter.imageAlt,
      featured: frontmatter.featured,
    });
  }
  listings.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (shouldCacheBlogData) postListings = listings;
  return listings;
}

/** The post's Markdown source, or `null` when no post has this slug. */
export function getRawBlogPostMarkdown(slug: string): string | null {
  return getPostContentsBySlug()[slug] ?? null;
}

function parsePostFrontmatter(
  slug: string,
  attributes: unknown,
): BlogPostFrontmatter {
  try {
    return s.parse(frontmatterSchema, attributes);
  } catch (error) {
    throw new Error(`Invalid post frontmatter in ${slug}`, { cause: error });
  }
}

function getPostContentsBySlug(): Record<string, string> {
  return cachedPostContentsBySlug ?? readPostContentsBySlug();
}

function readPostContentsBySlug(): Record<string, string> {
  return Object.fromEntries(
    readdirSync(POSTS_DIRECTORY, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => [
        entry.name.replace(/\.md$/, ""),
        readFileSync(path.join(POSTS_DIRECTORY, entry.name), "utf8"),
      ]),
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}
