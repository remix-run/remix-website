import fsp from "fs/promises";
import path from "path";

import { processMarkdown } from "@mcansh/undoc";
import parseAttributes from "gray-matter";

import { prisma } from "../db.server";

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
  let markdown = files.filter((file) => file.endsWith(".md"));

  let promises = [];

  for (let file of markdown) {
    let fileContents = await fsp.readFile(file, "utf8");
    let { data, content } = parseAttributes(fileContents);

    let postContent = content.trim();

    let processed = await processMarkdown(
      new URL(process.env.SITE_URL!),
      postContent,
      { linkOriginPath: "/" }
    );

    let localFilePath = path.relative(path.join(process.cwd(), "md"), file);
    let slug = "/" + localFilePath.replace(/^\/md/, "");

    promises.push(
      prisma.blogPost.upsert({
        select: null,
        where: { slug },
        update: {
          html: processed,
          title: data.title ?? slug,
          md: postContent,
          slug: slug,
          description: data.description,
          hidden: data.hidden === "true",
          published: data.published,
        },
        create: {
          html: processed,
          title: data.title ?? slug,
          md: postContent,
          slug: slug,
          description: data.description,
          hidden: data.hidden === "true",
          published: data.published,
        },
      })
    );
  }

  await Promise.all(promises);
}

export { saveBlogPosts };
