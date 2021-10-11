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
export async function md(filenameWithoutExt: string) {
  let filePath = path.join(contentPath, filenameWithoutExt + ".md");
  try {
    await fs.access(filePath);
  } catch (e) {
    throw json("File not found", { status: 404 });
  }
  let contents = (await fs.readFile(filePath)).toString();
  let { attributes, body } = parseFrontMatter(contents);
  let html = await processMarkdown(body);
  return { attributes, html };
}

export async function getBlogPost(slug: string): Promise<MarkdownPost> {
  let { attributes, html } = await md(slug);
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
