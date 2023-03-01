import parseFrontMatter from "front-matter";
import { processMarkdown as md } from "@ryanflorence/md";

/**
 * Parses a markdown contents, including frontmatter.
 */
export async function processMarkdown(contents: string) {
  let { attributes, body } = parseFrontMatter(contents);
  let html = await md(body);
  return { attributes, raw: body, html };
}
