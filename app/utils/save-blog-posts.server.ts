import fsp from "fs/promises";
import path from "path";

import { processMarkdown } from "@mcansh/undoc";
import parseAttributes from "gray-matter";
import yaml from "yaml";
import { isPresent } from "ts-is-present";
import invariant from "ts-invariant";

import { prisma } from "../db.server";
import { isAuthor } from "../models/post";

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  let files = await fsp.readdir(dirPath, { withFileTypes: true });

  arrayOfFiles ||= [];

  for (let file of files) {
    if (file.isDirectory()) {
      arrayOfFiles = await getAllFiles(
        path.join(dirPath, file.name),
        arrayOfFiles
      );
    } else {
      arrayOfFiles.push(path.join(dirPath, file.name));
    }
  }

  return arrayOfFiles;
}

let DATA_DIR = path.join(process.cwd(), "data");
let POSTS_DIR = path.join(DATA_DIR, "posts");
let AUTHORS_DIR = path.join(DATA_DIR, "authors");

async function saveBlogPosts() {
  let existingPosts = await prisma.blogPost.findMany({
    select: { slug: true },
  });

  let files = await getAllFiles(POSTS_DIR);

  let deletedPosts = existingPosts.filter(
    (post) => !files.includes(path.join(POSTS_DIR, post.slug))
  );

  let promises = [];

  for (const deletedPost of deletedPosts) {
    promises.push(
      prisma.blogPost.delete({ where: { slug: deletedPost.slug } })
    );
    console.log(`> Deleted blog post ${deletedPost.slug}`);
  }

  let posts = files.map((file) => {
    let localFilePath = path.relative(POSTS_DIR, file);
    return {
      slug: localFilePath.replace(/^\/md/, ""),
      filePath: file,
    };
  });

  for (let post of posts) {
    let fileContents = await fsp.readFile(post.filePath, "utf8");
    let { data, content } = parseAttributes(fileContents);

    let postContent = content.trim();

    let processed = await processMarkdown(
      new URL(process.env.SITE_URL!),
      postContent,
      { linkOriginPath: "/" }
    );

    let authorPromises = [];

    for (const authorName of data.authors) {
      authorPromises.push(getAuthor(authorName));
    }

    let authorsSettled = await Promise.allSettled(authorPromises);

    let authors = authorsSettled
      .map((author) => {
        if (author.status === "fulfilled") {
          return author.value;
        }

        console.error(author.reason);
        return null;
      })
      .filter(isPresent);

    promises.push(
      prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          date: data.date,
          html: processed,
          image: data.image,
          imageAlt: data.imageAlt,
          md: postContent,
          slug: post.slug,
          title: data.title,
          authors: {
            set: authors.map((author) => ({ name: author.name })),
          },
        },
        create: {
          date: data.date,
          html: processed,
          image: data.image,
          imageAlt: data.imageAlt,
          md: postContent,
          slug: post.slug,
          title: data.title,
        },
      })
    );

    console.log(`> Saved blog post ${post.slug}`);

    await Promise.all(promises);
  }
}

async function getAuthor(authorName: string) {
  let authorFile = path.join(AUTHORS_DIR, `${authorName}.yaml`);
  let authorFileContents = await fsp.readFile(authorFile, "utf8");
  let author = yaml.parse(authorFileContents);
  invariant(
    isAuthor(author),
    `Author ${authorName} is not valid. Please check the author file.`
  );
  return author;
}

export { saveBlogPosts };
