import parseAttributes from "gray-matter";
import { processMarkdown, TarEntry } from "@mcansh/undoc";
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

export interface ProcessedDoc {
  attributes: Attributes;
  html: string;
  title: string;
  path: string;
  md: string;
  lang: string;
  hasContent: boolean;
}

async function processDoc(
  entry: TarEntry,
  version: string
): Promise<ProcessedDoc> {
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
        {
          linkOriginPath:
            `/docs/${lang}/${version.replace("refs/heads/", "")}` + path,
        }
      )
    : "";

  return {
    attributes: {
      disabled: data.disabled,
      hidden: data.hidden,
      order: data.order ? Number(data.order) : null,
      siblingLinks: data.siblingLinks,
      title,
      toc: data.toc !== false,
      description: data.description,
      published: data.published,
    },
    html: html.toString(),
    title,
    path: entry.path,
    md: content,
    hasContent,
    lang,
  };
}

export { processDoc };
