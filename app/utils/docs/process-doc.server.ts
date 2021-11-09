import parseAttributes from "gray-matter";
import { File } from "@mcansh/undoc";
import { processMarkdown } from "@mcansh/undoc";
import type { Doc } from "@prisma/client";

if (!process.env.SITE_URL) {
  throw new Error("SITE_URL is not set");
}

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

async function processDoc(
  entry: File,
  version: string
): Promise<{
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

  let langMatch = path.match(/^\/_i18n\/(?<lang>[a-z]{2})\//);
  let lang = langMatch?.groups?.lang ?? "en";

  let html = hasContent
    ? await processMarkdown(
        new URL(process.env.SITE_URL!),
        data.toc === false ? content : "## toc\n" + content,
        { linkOriginPath: `/docs/${lang}/${version}` + path }
      )
    : "";

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

export { processDoc };
