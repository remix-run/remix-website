import fs from "fs/promises";
import path from "path";
import { processMarkdown } from "@ryanflorence/md";
import parseFrontMatter from "front-matter";
import invariant from "ts-invariant";
import { Author, Prisma } from "@prisma/client";

import { prisma } from "../db.server";

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

let blogPostWithAuthors = Prisma.validator<Prisma.BlogPostArgs>()({
  include: { authors: true },
});

export type BlogPostWithAuthors = Prisma.BlogPostGetPayload<
  typeof blogPostWithAuthors
>;

export async function getBlogPost(slug: string): Promise<BlogPostWithAuthors> {
  let result = await prisma.blogPost.findUnique({
    where: { slug: slug },
    include: { authors: true },
  });

  if (!result) {
    throw new Response("Not Found", { status: 404, statusText: "Not Found" });
  }
  invariant(isMarkdownPostFrontmatter(result), "Invalid post frontmatter.");
  return result;
}

/**
 * Seems pretty easy to type up a markdown frontmatter wrong, so we've got this runtime check that also gives us some type safety
 */
export function isMarkdownPostFrontmatter(
  obj: any
): obj is BlogPostWithAuthors {
  return (
    typeof obj === "object" &&
    obj.title &&
    obj.date &&
    obj.image &&
    obj.imageAlt &&
    Array.isArray(obj.authors) &&
    obj.authors.every((author: any) => isAuthor(author))
  );
}

export function isAuthor(obj: any): obj is Author {
  return typeof obj === "object" && obj.name && obj.title && obj.avatar;
}
