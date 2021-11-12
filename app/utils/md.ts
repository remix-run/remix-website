import remark from "remark";
import html from "remark-html";
import fs from "fs/promises";
import path from "path";
import { Page, process } from "@ryanflorence/mdtut";
import { remarkCodeBlocksShiki } from "@ryanflorence/md";

// This is relative to where this code ends up in the build, not the source
let contentPath = path.join(__dirname, "..", "md");

let processor = remark().use(remarkCodeBlocksShiki).use(html);

export async function getMarkdown(filename: string): Promise<Page> {
  let filePath = path.join(contentPath, filename);
  let file = await fs.readFile(filePath);
  return process(processor, file);
}
