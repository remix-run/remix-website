import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import { Entry } from "@mcansh/undoc";
import { Doc } from "@prisma/client";

export type Attributes = Pick<
  Doc,
  | "title"
  | "disabled"
  | "hidden"
  | "toc"
  | "order"
  | "siblingLinks"
  | "description"
  | "published"
>;

async function processDoc(entry: Entry): Promise<{
  attributes: Attributes;
  html: string;
  title: string;
  path: string;
  md: string;
  lang: string;
  hasContent: boolean;
}> {
  let { data, content } = parseAttributes(entry.content!);
  let hasContent = content.trim() !== "";

  let path = entry.path.replace(/^\/docs/, "");
  let title = data.title || path;
  let html = hasContent
    ? await processMarkdown(data.toc === false ? content : "## toc\n" + content)
    : "";

  let langMatch = path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);

  let lang = langMatch?.groups?.lang ?? "en";

  return {
    attributes: {
      disabled: data.disabled === "true",
      hidden: data.hidden === "true",
      order: data.order ? Number(data.order) : null,
      siblingLinks: data.siblingLinks === "true",
      title,
      toc: data.toc !== "false",
      description: data.description,
      published: data.published,
    },
    html: html.toString(),
    title,
    path,
    md: content,
    hasContent,
    lang,
  };
}

async function processDocs(entries: Entry[]) {
  return Promise.all(entries.map((entry) => processDoc(entry)));
}

export { processDoc, processDocs };
