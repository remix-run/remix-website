import path from "path";
import fs from "fs";
import { DateTime } from "luxon";
import invariant from "tiny-invariant";
import LRUCache from "lru-cache";
import yaml from "yaml";
import { processMarkdown } from "~/lib/md.server";

// This is relative to where this code ends up in the build, not the source
const dataPath = path.join(__dirname, "..", "data");
const blogPath = path.join(dataPath, "posts");

const AUTHORS: BlogAuthor[] = yaml.parse(
  fs.readFileSync(path.join(dataPath, "authors.yml")).toString()
);

const postsCache = new LRUCache<string, BlogPost>({
  maxSize: 1024 * 1024 * 12, // 12 mb
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

export async function getBlogPost(slug: string): Promise<BlogPost> {
  let cached = postsCache.get(slug);
  if (cached) return cached;
  let filePath = path.join(blogPath, slug + ".md");
  let contents: string;
  try {
    contents = (await fs.promises.readFile(filePath)).toString();
  } catch (e) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }

  let result = await processMarkdown(contents);
  let { attributes, html } = result;
  invariant(
    isMarkdownPostFrontmatter(attributes),
    `Invalid post frontmatter in ${slug}`
  );

  let validatedAuthors = getValidAuthorNames(attributes.authors);
  if (validatedAuthors.length === 0) {
    console.warn(
      "The author info in `%s` is incorrect and should be fixed to match what’s in the `authors.yaml` file.",
      slug
    );
  }
  attributes.authors = validatedAuthors;

  invariant(
    isMarkdownPostFrontmatter(attributes),
    `Invalid post frontmatter in ${slug}`
  );

  let post: BlogPost = {
    ...attributes,
    authors: attributes.authors
      .map(getAuthor)
      .filter((a): a is BlogAuthor => !!a),
    dateDisplay: formatDate(attributes.date),
    html,
  };
  postsCache.set(slug, post);
  return post;
}

export async function getBlogPostListings(): Promise<
  Array<MarkdownPostListing>
> {
  let files = await fs.promises.readdir(blogPath);
  let listings: Array<MarkdownPostListing & { date: Date }> = [];
  for (let file of files) {
    if (file.endsWith(".md")) {
      let slug = file.replace(/\.md$/, "");
      let { html, authors, ...listing } = await getBlogPost(slug);
      if (!listing.draft) {
        listings.push({ slug, ...listing });
      }
    }
  }
  return listings
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ date, ...listing }) => listing);
}

function getAuthor(name: string): BlogAuthor | undefined {
  return AUTHORS.find((a) => a.name === name);
}

function getValidAuthorNames(authors: string[]) {
  let validatedAuthors: string[] = [];
  for (let author of AUTHORS) {
    if (authors.includes(author.name)) {
      validatedAuthors.push(author.name);
    }
  }
  return validatedAuthors;
}

function formatDate(date: Date) {
  let offset = new Date().getTimezoneOffset();
  return DateTime.fromJSDate(date)
    .plus({ minutes: offset })
    .setZone("America/Los_Angeles")
    .toLocaleString(DateTime.DATE_FULL, {
      locale: "en-US",
    });
}

/**
 * Seems pretty easy to type up a markdown frontmatter wrong, so we've got this
 * runtime check that also gives us some type safety
 */
function isMarkdownPostFrontmatter(obj: any): obj is MarkdownPost {
  return (
    typeof obj === "object" &&
    obj.title &&
    obj.summary &&
    obj.date instanceof Date &&
    (typeof obj.draft === "boolean" || typeof obj.draft === "undefined") &&
    (typeof obj.featured === "boolean" ||
      typeof obj.featured === "undefined") &&
    obj.image &&
    obj.imageAlt &&
    Array.isArray(obj.authors)
  );
}

interface MarkdownPostListing {
  title: string;
  slug: string;
  summary: string;
  dateDisplay: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
}

/**
 * Markdown frontmatter data describing a post
 */
interface MarkdownPost {
  title: string;
  summary: string;
  date: Date;
  dateDisplay: string;
  draft?: boolean;
  featured?: boolean;
  image: string;
  imageAlt: string;
  authors: string[];
  html: string;
}

export interface BlogAuthor {
  name: string;
  title: string;
  avatar: string;
}

export interface BlogPost extends Omit<MarkdownPost, "authors"> {
  authors: BlogAuthor[];
}
