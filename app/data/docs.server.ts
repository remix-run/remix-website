import assert from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import * as s from "remix/data-schema";

import { processMarkdown } from "./md.server.ts";

const DOCS_DIRECTORY = path.join(process.cwd(), "data", "docs");
const DOCS_CHAPTER_FILENAME = /^(\d+)-(.+)\.md$/;
const isProduction = process.env.NODE_ENV === "production";

const docsFrontmatterSchema = s.object({
  chapter: s.string(),
  title: s.string(),
  description: s.string(),
});

type DocsFrontmatter = s.InferOutput<typeof docsFrontmatterSchema>;

let docsCache: Array<DocsChapter> | undefined;

export async function getDocsChapters() {
  if (isProduction && docsCache) return docsCache;

  let chapters = await Promise.all(
    readDocFiles().map(async ({ order, slug, content }) => {
      let { attributes, html, raw } = await processMarkdown(content);
      let frontmatter = parseDocsFrontmatter(attributes, slug);

      return {
        slug,
        order,
        ...frontmatter,
        headings: extractHeadings(raw, html),
        html,
      } satisfies DocsChapter;
    }),
  );

  chapters.sort((a, b) => a.order - b.order);
  if (isProduction) docsCache = chapters;
  return chapters;
}

function readDocFiles() {
  return readdirSync(DOCS_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => {
      let match = entry.name.match(DOCS_CHAPTER_FILENAME);
      assert(match, `Invalid docs chapter filename: ${entry.name}`);

      return {
        order: Number(match[1]),
        slug: match[2],
        content: readFileSync(path.join(DOCS_DIRECTORY, entry.name), "utf8"),
      };
    });
}

function extractHeadings(markdown: string, html: string) {
  let titles = Array.from(markdown.matchAll(/^##\s+(.+)$/gm), (match) =>
    match[1].trim(),
  );
  let ids = Array.from(
    html.matchAll(/<h2\s+[^>]*id="([^"]+)"[^>]*>/g),
    (match) => match[1],
  );

  return titles.map((title, index) => ({
    id: ids[index] ?? slugify(title),
    title,
  }));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseDocsFrontmatter(input: unknown, slug: string) {
  try {
    return s.parse(docsFrontmatterSchema, input);
  } catch (error) {
    throw new Error(`Invalid docs frontmatter in ${slug}`, { cause: error });
  }
}

export interface DocsChapter extends DocsFrontmatter {
  slug: string;
  order: number;
  headings: Array<{ id: string; title: string }>;
  html: string;
}
