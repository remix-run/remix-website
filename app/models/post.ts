import invariant from "tiny-invariant";
import type { Author } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "../db.server";

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
  invariant(isValidPost(result), "Invalid post frontmatter.");
  return result;
}

export function isValidPost(obj: any): obj is BlogPostWithAuthors {
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
