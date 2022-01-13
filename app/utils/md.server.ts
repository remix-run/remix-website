import fs from "fs/promises";
import path from "path";

import * as dateFns from "date-fns";
import remark from "remark";
import html from "remark-html";
import parseFrontMatter from "front-matter";
import { processMarkdown } from "@ryanflorence/md";
import { Page, process } from "@ryanflorence/mdtut";
import { remarkCodeBlocksShiki } from "@ryanflorence/md";
import invariant from "ts-invariant";
import LRUCache from "lru-cache";

let cache = new LRUCache<string, Page>({
  max: 1024 * 1024 * 12, // 12 mb
  length(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

let postsCache = new LRUCache<string, MarkdownPost>({
  max: 1024 * 1024 * 12, // 12 mb
  length(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

// This is relative to where this code ends up in the build, not the source
let contentPath = path.join(__dirname, "..", "md");
let blogPath = path.join(__dirname, "..", "data/posts");

/**
 * Parses a markdown file, including front matter.
 */
export async function md(filename: string) {
  let filePath = path.join(blogPath, filename);
  try {
    await fs.access(filePath);
  } catch (e) {
    return null;
  }

  let contents = (await fs.readFile(filePath)).toString();
  let { attributes, body } = parseFrontMatter(contents);
  let html = await processMarkdown(body);

  let obj = { attributes, html };
  return obj;
}

export async function getBlogPostListings(): Promise<
  Array<MarkdownPostListing>
> {
  let files = await fs.readdir(blogPath);
  let listings: Array<MarkdownPostListing & { date: Date }> = [];
  for (let file of files) {
    if (file.endsWith(".md")) {
      const slug = file.replace(/\.md$/, "");
      let { html, authors, ...listing } = await getBlogPost(slug);
      listings.push({ slug, ...listing });
    }
  }
  return listings
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ date, ...listing }) => listing);
}

let processor = remark().use(remarkCodeBlocksShiki).use(html);

export async function getMarkdown(filename: string): Promise<Page> {
  let cached = cache.get(filename);
  if (cached) {
    return cached;
  }
  let filePath = path.join(contentPath, filename);
  let file = await fs.readFile(filePath);
  let page = await process(processor, file);
  cache.set(filename, page);
  return page;
}

function formatDate(date: Date) {
  return dateFns.format(
    dateFns.add(date, {
      minutes: new Date().getTimezoneOffset(),
    }),
    "PPP"
  );
}

export async function getBlogPost(slug: string): Promise<MarkdownPost> {
  let cached = postsCache.get(slug);
  if (cached) return cached;

  let result = await md(slug + ".md");
  if (!result) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }
  let { attributes, html } = result;

  invariant(
    isMarkdownPostFrontmatter(attributes),
    `Invalid post frontmatter in ${slug}`
  );

  let post = { ...attributes, dateDisplay: formatDate(attributes.date), html };
  postsCache.set(slug, post);

  return post;
}

export interface MarkdownPostListing {
  title: string;
  slug: string;
  summary: string;
  dateDisplay: string;
  image: string;
  imageAlt: string;
}

/**
 * Markdown frontmatter data describing a post
 */
export interface MarkdownPost {
  title: string;
  summary: string;
  date: Date;
  dateDisplay: string;
  image: string;
  imageAlt: string;
  authors: Author[];
  html: string;
}

/**
 * Markdown frontmatter author
 */
export interface Author {
  name: string;
  title: string;
  avatar: string;
}

/**
 * Seems pretty easy to type up a markdown frontmatter wrong, so we've got this runtime check that also gives us some type safety
 */
export function isMarkdownPostFrontmatter(obj: any): obj is MarkdownPost {
  return (
    typeof obj === "object" &&
    obj.title &&
    obj.summary &&
    obj.date instanceof Date &&
    obj.image &&
    obj.imageAlt &&
    Array.isArray(obj.authors) &&
    obj.authors.every(
      (author: any) =>
        typeof author === "object" &&
        author.name &&
        author.title &&
        author.avatar
    )
  );
}
