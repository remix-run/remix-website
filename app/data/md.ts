/*!
 * Forked from https://github.com/ryanflorence/md/blob/master/index.ts
 *
 * Adapted from
 * - ggoodman/nostalgie
 *   - MIT https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/LICENSE
 *   - https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/src/worker/mdxCompiler.ts
 */
import {
  getSingletonHighlighter,
  type BundledLanguage,
  type Highlighter,
  type ThemeRegistrationAny,
} from "shiki";
import rangeParser from "parse-numeric-range";
import { parseFrontmatter } from "./frontmatter.ts";
import type * as Hast from "hast";
import type * as Mdast from "mdast";
import type { Options as RemarkRehypeOptions } from "remark-rehype";
import type { Options as SanitizeOptions } from "rehype-sanitize";
import type * as Unified from "unified";
import type { VFile } from "vfile";
import themeJson from "../../data/base16.json" with { type: "json" };
import {
  getBlogImageAsset,
  type BlogImageAsset,
} from "../utils/blog-image-assets.ts";

interface ProcessorOptions {
  resolveHref?(href: string): string;
  /**
   * Rewrite relative Markdown image src values (for example, to a route that
   * serves the image). External URLs are left untouched. Defaults to leaving
   * image src values as-is.
   */
  resolveImageUrl?(url: string): string;
  /**
   * Allow raw HTML in the source markdown to pass through to the output.
   * Defaults to `true` to preserve existing blog/Jam behavior. Set to `false`
   * for untrusted remote markdown so raw HTML is dropped.
   */
  allowHtml?: boolean;
}

declare module "vfile" {
  interface DataMap {
    processorOptions: ProcessorOptions;
  }
}

const theme = themeJson as ThemeRegistrationAny;

const highlightedLanguages = [
  "js",
  "json",
  "jsx",
  "ts",
  "tsx",
  "markdown",
  "shellscript",
  "html",
  "css",
  "diff",
  "mdx",
  "prisma",
] as const satisfies BundledLanguage[];

type HighlightedLanguage = (typeof highlightedLanguages)[number];

// Code blocks advertise the canonical grammar name in `data-lang`.
const languageNames: Partial<Record<HighlightedLanguage, string>> = {
  js: "javascript",
  ts: "typescript",
};

type Processor = Awaited<ReturnType<typeof getProcessor>>;

// Cache processors by `allowHtml` so blog/Jam (allowHtml: true) and remote
// newsletter markdown (allowHtml: false) each reuse their own processor.
let processors = new Map<boolean, Promise<Processor>>();

export async function processMarkdown(
  content: string,
  options?: ProcessorOptions,
) {
  let processor = await getProcessorFor(options);
  let { attributes, body: raw } = parseFrontmatter(content);
  let vfile = await processor.process({
    value: raw,
    data: { processorOptions: options ?? {} },
  });
  let html = vfile.value.toString();
  return { attributes, raw, html };
}

function getProcessorFor(options?: ProcessorOptions): Promise<Processor> {
  let allowHtml = options?.allowHtml !== false;
  let cached = processors.get(allowHtml);
  if (cached) return cached;
  let promise = getProcessor(allowHtml);
  processors.set(allowHtml, promise);
  return promise;
}

async function getProcessor(allowHtml: boolean) {
  let [
    { unified },
    { default: remarkGfm },
    { default: remarkParse },
    { default: remarkRehype, defaultHandlers },
    { default: rehypeSlug },
    { default: rehypeStringify },
    { default: rehypeAutolinkHeadings },
    { default: rehypeSanitize, defaultSchema },
    { visit },
    highlighter,
  ] = await Promise.all([
    import("unified"),
    import("remark-gfm"),
    import("remark-parse"),
    import("remark-rehype"),
    import("rehype-slug"),
    import("rehype-stringify"),
    import("rehype-autolink-headings"),
    import("rehype-sanitize"),
    import("unist-util-visit"),
    getSingletonHighlighter({ themes: [theme], langs: highlightedLanguages }),
  ]);

  let highlightCode = createCodeHandler(highlighter);

  const resolveLinks: MarkdownPlugin = () => (tree, file) => {
    let { resolveHref } = getProcessorOptions(file);
    if (!resolveHref) return;
    visit(tree, "link", (node) => {
      if (isRelativeUrl(node.url)) node.url = resolveHref(node.url);
    });
  };

  const rewriteImages: MarkdownPlugin = () => (tree, file) => {
    let { resolveImageUrl } = getProcessorOptions(file);
    if (!resolveImageUrl) return;
    visit(tree, "image", (node) => {
      if (isRelativeUrl(node.url)) node.url = resolveImageUrl(node.url);
    });
  };

  // Raw HTML `<img>` tags are deferred by `rawBlogImages` (trusted documents
  // only); untrusted documents drop raw HTML entirely.
  const lazyImages: MarkdownPlugin = () => (tree) => {
    visit(tree, ["image", "imageReference"], (node) => {
      let data = (node.data ??= {});
      data.hProperties = {
        loading: "lazy",
        decoding: "async",
        ...data.hProperties,
      };
    });
  };

  const rawBlogImages: MarkdownPlugin = () => async (tree) => {
    let tasks: Promise<void>[] = [];
    visit(tree, "html", (node) => {
      tasks.push(
        transformRawBlogImages(node.value).then((value) => {
          node.value = value;
        }),
      );
    });
    await Promise.all(tasks);
  };

  const blogImages: Unified.Plugin<[], Hast.Root> = () => async (tree) => {
    let tasks: Promise<void>[] = [];
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      let source = node.properties.src;
      if (typeof source !== "string") return;

      tasks.push(
        getBlogImageAsset(source).then((asset) => {
          node.properties = getBlogImageProperties(node.properties, asset);
        }),
      );
    });
    await Promise.all(tasks);
  };

  let processor = unified()
    .use(remarkParse)
    .use(resolveLinks)
    .use(rewriteImages);

  if (allowHtml) processor.use(rawBlogImages);

  processor
    .use(lazyImages)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: allowHtml,
      handlers: {
        code: (state, node) =>
          highlightCode(state, node) ?? defaultHandlers.code(state, node),
      },
    });

  if (allowHtml) processor.use(blogImages);

  if (!allowHtml) {
    // Raw HTML is already discarded. Sanitize the generated tree after the
    // Markdown transforms, then only run the trusted heading plugins below.
    processor.use(rehypeSanitize, createUntrustedMarkdownSchema(defaultSchema));
  }

  return processor
    .use(rehypeSlug, {
      // Slugs are added after sanitization, so untrusted documents need a
      // non-clobbering prefix. Autolinks then receive the prefixed IDs too.
      prefix: allowHtml ? "" : "newsletter-content-",
    })
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify, { allowDangerousHtml: allowHtml });
}

type MarkdownPlugin = Unified.Plugin<[], Mdast.Root>;

function getProcessorOptions(file: VFile): ProcessorOptions {
  return file.data.processorOptions ?? {};
}

function createUntrustedMarkdownSchema(
  defaultSchema: SanitizeOptions,
): SanitizeOptions {
  // These attributes (including the inline color styles) are emitted by the
  // trusted Shiki transform. Untrusted raw HTML never reaches this tree.
  let codeBlockAttributes = [
    "dataCodeBlock",
    "dataLineNumbers",
    "dataLang",
    "dataHighlight",
    "dataLineNumber",
    "dataAdd",
    "dataRemove",
    "dataDiffLineNumber",
  ];

  return {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      div: [...(defaultSchema.attributes?.div ?? []), ...codeBlockAttributes],
      img: [...(defaultSchema.attributes?.img ?? []), "decoding", "loading"],
      pre: [
        ...(defaultSchema.attributes?.pre ?? []),
        ...codeBlockAttributes,
        "style",
      ],
      span: [
        ...(defaultSchema.attributes?.span ?? []),
        ["className", "codeblock-line"],
        ...codeBlockAttributes,
        "style",
      ],
    },
    protocols: {
      ...defaultSchema.protocols,
      href: ["http", "https", "mailto"],
      src: ["https"],
    },
  };
}

////////////////////////////////////////////////////////////////////////////////

type ToHastState = Parameters<
  NonNullable<NonNullable<RemarkRehypeOptions["handlers"]>["code"]>
>[0];

/**
 * Renders fenced code in a supported language as a Shiki-highlighted
 * `<div data-code-block><pre><code>` tree. Returns `undefined` for code the
 * default handler should render.
 */
function createCodeHandler(highlighter: Highlighter) {
  let fgColor = convertFakeHexToCustomProp(highlighter.getTheme(theme).fg);

  return function highlightCode(
    state: ToHastState,
    node: Mdast.Code,
  ): Hast.Element | undefined {
    if (!node.value || !isHighlightedLanguage(node.lang)) return undefined;

    let language = languageNames[node.lang] ?? node.lang;
    let {
      addedLines,
      highlightLines,
      metaProperties,
      removedLines,
      startingLineNumber,
      usesLineNumbers,
    } = parseCodeMeta(node.meta);
    let isDiff = addedLines.length > 0 || removedLines.length > 0;
    let diffLineNumber = startingLineNumber - 1;

    let tokens = highlighter.codeToTokensBase(node.value, {
      lang: node.lang,
      theme,
      includeExplanation: false,
    });

    let lines = tokens.map((lineTokens, lineIndex): Hast.Element => {
      let lineNumber = lineIndex + startingLineNumber;
      let removeLine = removedLines.includes(lineNumber);
      if (!removeLine) diffLineNumber++;

      let children = lineTokens.map((token): Hast.ElementContent => {
        let color = convertFakeHexToCustomProp(token.color ?? "");
        let text: Hast.Text = { type: "text", value: token.content };
        return color && color !== fgColor
          ? {
              type: "element",
              tagName: "span",
              properties: { style: `color: ${color}` },
              children: [text],
            }
          : text;
      });
      children.push({ type: "text", value: "\n" });

      return {
        type: "element",
        tagName: "span",
        properties: {
          className: "codeblock-line",
          dataHighlight: highlightLines.includes(lineNumber)
            ? "true"
            : undefined,
          dataLineNumber: usesLineNumbers ? lineNumber : undefined,
          dataAdd: isDiff ? addedLines.includes(lineNumber) : undefined,
          dataRemove: isDiff ? removeLine : undefined,
          dataDiffLineNumber: isDiff ? diffLineNumber : undefined,
        },
        children,
      };
    });

    let blockProperties = {
      ...metaProperties,
      dataLineNumbers: usesLineNumbers ? "true" : "false",
      dataLang: language,
    };
    let result: Hast.Element = {
      type: "element",
      tagName: "div",
      properties: { dataCodeBlock: "", ...blockProperties },
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: { ...blockProperties, style: `color: ${fgColor};` },
          children: [
            {
              type: "element",
              tagName: "code",
              properties: {},
              children: lines,
            },
          ],
        },
      ],
    };
    state.patch(node, result);
    return state.applyData(node, result);
  };
}

function isHighlightedLanguage(
  lang: string | null | undefined,
): lang is HighlightedLanguage {
  return (highlightedLanguages as readonly string[]).includes(lang ?? "");
}

/**
 * Reads code fence meta such as `lines=[1,3-4] start=5 nonumber` or the
 * `[1,3-4]` line-highlight shorthand. Unrecognized params are passed through
 * as `data-*` attributes.
 */
function parseCodeMeta(meta: string | null | undefined) {
  let metaParams = new URLSearchParams();
  if (meta) {
    let linesShorthand = meta.match(/^\[(.+)\]$/);
    if (linesShorthand) {
      metaParams.set("lines", linesShorthand[0]);
    } else {
      metaParams = new URLSearchParams(meta.split(/\s+/).join("&"));
    }
  }

  let start = Number(metaParams.get("start") ?? 1);
  let metaProperties: Record<string, string> = {};
  metaParams.forEach((value, key) => {
    if (key === "lines") return;
    metaProperties[`data-${key}`] = value;
  });

  return {
    addedLines: parseLineHighlights(metaParams.get("add")),
    removedLines: parseLineHighlights(metaParams.get("remove")),
    highlightLines: parseLineHighlights(metaParams.get("lines")),
    startingLineNumber: Number.isFinite(start) ? start : 1,
    usesLineNumbers: !metaParams.has("nonumber"),
    metaProperties,
  };
}

////////////////////////////////////////////////////////////////////////////////

const BLOG_IMAGE_SIZES = "(min-width: 768px) 768px, 100vw";
const RAW_IMAGE_PATTERN = /<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;

function getBlogImageProperties(
  properties: Hast.Properties,
  asset: BlogImageAsset,
): Hast.Properties {
  let next: Hast.Properties = {
    ...properties,
    decoding: properties.decoding ?? "async",
    loading: properties.loading ?? "lazy",
    src: asset.src,
  };

  if (asset.width && properties.width == null) next.width = asset.width;
  if (asset.height && properties.height == null) next.height = asset.height;
  if (asset.srcSet) {
    next.srcSet = asset.srcSet;
    next.sizes = properties.sizes ?? BLOG_IMAGE_SIZES;
  }
  if (asset.fullSrc) next["data-full-src"] = asset.fullSrc;

  return next;
}

async function transformRawBlogImages(html: string): Promise<string> {
  let matches = [...html.matchAll(RAW_IMAGE_PATTERN)];
  if (matches.length === 0) return html;

  let replacements = await Promise.all(
    matches.map(async (match) => {
      let source = getHtmlAttribute(match[0], "src");
      let asset = source ? await getBlogImageAsset(source) : undefined;
      let tag = setHtmlAttribute(match[0], "loading", "lazy", false);
      tag = setHtmlAttribute(tag, "decoding", "async", false);
      if (!asset) return tag;

      tag = setHtmlAttribute(tag, "src", asset.src);
      if (asset.width) {
        tag = setHtmlAttribute(tag, "width", String(asset.width), false);
      }
      if (asset.height) {
        tag = setHtmlAttribute(tag, "height", String(asset.height), false);
      }
      if (asset.srcSet) {
        tag = setHtmlAttribute(tag, "srcset", asset.srcSet);
        tag = setHtmlAttribute(tag, "sizes", BLOG_IMAGE_SIZES, false);
      }
      if (asset.fullSrc) {
        tag = setHtmlAttribute(tag, "data-full-src", asset.fullSrc);
      }
      return tag;
    }),
  );

  let output = "";
  let offset = 0;
  for (let [index, match] of matches.entries()) {
    let matchIndex = match.index ?? offset;
    output += html.slice(offset, matchIndex);
    output += replacements[index];
    offset = matchIndex + match[0].length;
  }
  return output + html.slice(offset);
}

function getHtmlAttribute(tag: string, name: string): string | undefined {
  let match = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return match?.[1] ?? match?.[2];
}

function setHtmlAttribute(
  tag: string,
  name: string,
  value: string,
  overwrite = true,
): string {
  let pattern = new RegExp(
    `\\s${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,
    "i",
  );
  if (pattern.test(tag)) {
    return overwrite
      ? tag.replace(pattern, ` ${name}="${escapeHtmlAttribute(value)}"`)
      : tag;
  }
  return tag.replace(
    /^<img\b/i,
    `<img ${name}="${escapeHtmlAttribute(value)}"`,
  );
}

function escapeHtmlAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function parseLineHighlights(param: string | null) {
  if (!param) return [];
  let range = param.match(/^\[(.+)\]$/);
  if (!range) return [];
  return rangeParser(range[1]);
}

// The theme actually stores #FFFF${base-16-color-id} because vscode-textmate
// requires colors to be valid hex codes, if they aren't, it changes them to a
// default, so this is a mega hack to trick it.
function convertFakeHexToCustomProp(color: string) {
  return color.replace(/^#FFFF(.+)/, "var(--base$1)");
}

function isRelativeUrl(test: string) {
  // Probably fragile but should work well enough.
  // It would be nice if the consumer could provide a baseURI we could do
  // something like:
  // new URL(baseURI).origin === new URL(test, baseURI).origin
  let regexp = new RegExp("^(?:[a-z]+:)?//", "i");
  return !regexp.test(test);
}
