import fs from "fs/promises";
import path from "path";
import { processMarkdown } from "@ryanflorence/md";
import parseFrontMatter from "front-matter";
import { json } from "remix";
import invariant from "ts-invariant";

// This is relative to where this code ends up in the build, not the source
let contentPath = path.join(__dirname, "..", "md");

/**
 * Parses a markdown file, including front matter.
 */
export async function md(filename: string) {
  let filePath = path.join(contentPath, filename);
  try {
    await fs.access(filePath);
  } catch (e) {
    return null;
  }
  let contents = (await fs.readFile(filePath)).toString();
  let { attributes, body } = parseFrontMatter(contents);
  let html = await processMarkdown(body);
  return { attributes, html };
}

export async function getMarkdown(filename: string) {
  let result = await md(filename);

  if (!result)
    throw new Response(`Missing ${filename}`, {
      status: 500,
      statusText: "Internal Server Error",
    });

  return result;
}

export async function getBlogPost(slug: string): Promise<MarkdownPost> {
  let result = await md(slug + ".md");
  if (!result) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }
  let { attributes, html } = result;
  invariant(isMarkdownPostFrontmatter(attributes), "Invalid post frontmatter.");
  return { ...attributes, html };
}

/**
 * Markdown frontmatter data describing a post
 */
export interface MarkdownPost {
  title: string;
  date: string;
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
  bio: string;
  avatar: string;
}

/**
 * Seems pretty easy to type up a markdown frontmatter wrong, so we've got this runtime check that also gives us some type safety
 */
export function isMarkdownPostFrontmatter(obj: any): obj is MarkdownPost {
  return (
    typeof obj === "object" &&
    obj.title &&
    obj.date &&
    obj.image &&
    obj.imageAlt &&
    Array.isArray(obj.authors) &&
    obj.authors.every(
      (author: any) =>
        typeof author === "object" && author.name && author.bio && author.avatar
    )
  );
}
