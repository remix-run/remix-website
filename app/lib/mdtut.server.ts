import fs from "fs";
import path from "path";
import remark from "remark";
import remarkHtml from "remark-html";
import { remarkCodeBlocksShiki } from "@ryanflorence/md";
import LRUCache from "lru-cache";
import type {
  Page as MarkdownTutPage,
  Prose,
  Sequence,
  Slide,
} from "@ryanflorence/mdtut";
import { process } from "@ryanflorence/mdtut";

// This is relative to where this code ends up in the build, not the source
const contentPath = path.join(__dirname, "..", "md");

const cache = new LRUCache<string, MarkdownTutPage>({
  maxSize: 1024 * 1024 * 12, // 12 mb
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

const processor = remark().use(remarkCodeBlocksShiki).use(remarkHtml);

export async function getMarkdownTutPage(
  filename: string
): Promise<MarkdownTutPage> {
  let cached = cache.get(filename);
  if (cached) {
    return cached;
  }
  let filePath = path.join(contentPath, filename);
  let file = await fs.promises.readFile(filePath);
  let page = await process(processor, file);
  cache.set(filename, page);
  return page;
}

export type { MarkdownTutPage, Prose, Sequence, Slide };
