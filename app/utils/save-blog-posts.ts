import fsp from "fs/promises";
import path from "path";

import { processMarkdown } from "@mcansh/undoc";
import parseAttributes from "gray-matter";

import { prisma } from "../db.server";
import { Author } from "@prisma/client";

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

async function saveBlogPosts() {
  let files = await getAllFiles(path.join(process.cwd(), "md"));
  let slugs = files
    .map((file) => {
      let localFilePath = path.relative(path.join(process.cwd(), "md"), file);
      return "/" + localFilePath.replace(/^\/md/, "");
    })
    .filter((file) => file.endsWith(".md"))
    .filter((file) => !file.startsWith("/marketing"));

  let promises = [];

  for (let slug of slugs) {
    let absoluteFilePath = path.join(process.cwd(), "md", slug);
    let fileContents = await fsp.readFile(absoluteFilePath, "utf8");
    let { data, content } = parseAttributes(fileContents);

    let postContent = content.trim();

    let processed = await processMarkdown(
      new URL(process.env.SITE_URL!),
      postContent,
      { linkOriginPath: "/" }
    );

    let promises = [];

    promises.push(
      prisma.blogPost.upsert({
        where: { slug: slug },
        update: {
          date: new Date(data.date),
          html: processed,
          image: data.image,
          imageAlt: data.imageAlt,
          md: postContent,
          slug: slug,
          title: data.title,
        },
        create: {
          date: new Date(data.date),
          html: processed,
          image: data.image,
          imageAlt: data.imageAlt,
          md: postContent,
          slug: slug,
          title: data.title,
        },
      })
    );

    console.log(`> Saved blog post ${slug}`);

    promises.push(
      ...data.authors.map((author: Author) => {
        prisma.author.upsert({
          where: { name: author.name },
          create: {
            avatar: author.avatar,
            name: author.name,
            bio: author.bio,
            posts: {
              connect: {
                slug: slug,
              },
            },
          },
          update: {
            posts: {
              connect: {
                slug: slug,
              },
            },
          },
        });

        console.log(`> Linked blog post ${slug} to author ${author.name}`);
      })
    );

    await Promise.all(promises);
  }
}

export { saveBlogPosts };
