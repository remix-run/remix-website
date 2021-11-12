import fs from "fs/promises";
import path from "path";
import { processMarkdown } from "@ryanflorence/md";
import parseFrontMatter from "front-matter";

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
