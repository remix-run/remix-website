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
  type ThemedToken,
  type ThemeRegistrationAny,
} from "shiki";
import rangeParser from "parse-numeric-range";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, {
  defaultSchema,
  type Options as SanitizeOptions,
} from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype, {
  defaultHandlers,
  type Options as RemarkRehypeOptions,
} from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parseFrontmatter } from "./frontmatter.ts";
import type * as Hast from "hast";
import type * as Mdast from "mdast";
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
   * Allow raw HTML in the source markdown. Trusted raw HTML is parsed into the
   * HTML tree, so its images get the same blog-image treatment as Markdown
   * images. Defaults to `true` for blog/Jam content. Set to `false` for
   * untrusted remote markdown so raw HTML is dropped and the output sanitized.
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
  let highlighter = await getSingletonHighlighter({
    themes: [theme],
    langs: highlightedLanguages,
  });
  let highlightCode = createCodeHandler(highlighter);

  let processor = unified()
    .use(remarkParse)
    .use(resolveLinks)
    .use(rewriteImages)
    .use(lazyImages)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: allowHtml,
      handlers: {
        code: (state, node) =>
          highlightCode(state, node) ?? defaultHandlers.code(state, node),
      },
    });

  if (allowHtml) {
    // Parse trusted raw HTML into elements so every image, Markdown or raw,
    // goes through the same blog-image transform.
    processor.use(rehypeRaw).use(blogImages);
  } else {
    // Raw HTML is already discarded. Sanitize the generated tree after the
    // Markdown transforms, then only run the trusted heading plugins below.
    processor.use(rehypeSanitize, createUntrustedMarkdownSchema());
  }

  return processor
    .use(rehypeSlug, {
      // Slugs are added after sanitization, so untrusted documents need a
      // non-clobbering prefix. Autolinks then receive the prefixed IDs too.
      prefix: allowHtml ? "" : "newsletter-content-",
    })
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify);
}

type MarkdownPlugin = Unified.Plugin<[], Mdast.Root>;

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

// Raw HTML `<img>` tags are handled by `blogImages` (trusted documents
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

function getProcessorOptions(file: VFile): ProcessorOptions {
  return file.data.processorOptions ?? {};
}

function createUntrustedMarkdownSchema(): SanitizeOptions {
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

    let meta = parseCodeMeta(node.meta);
    let isDiff = meta.addedLines.length > 0 || meta.removedLines.length > 0;
    let diffLineNumber = meta.startingLineNumber - 1;

    let tokens = highlighter.codeToTokensBase(node.value, {
      lang: node.lang,
      theme,
      includeExplanation: false,
    });

    let lines = tokens.map((lineTokens, lineIndex) => {
      let lineNumber = lineIndex + meta.startingLineNumber;
      let removed = meta.removedLines.includes(lineNumber);
      if (!removed) diffLineNumber++;

      return renderCodeLine(
        lineTokens.map((token) => renderToken(token, fgColor)),
        {
          className: "codeblock-line",
          dataHighlight: meta.highlightLines.includes(lineNumber)
            ? "true"
            : undefined,
          dataLineNumber: meta.usesLineNumbers ? lineNumber : undefined,
          dataAdd: isDiff ? meta.addedLines.includes(lineNumber) : undefined,
          dataRemove: isDiff ? removed : undefined,
          dataDiffLineNumber: isDiff ? diffLineNumber : undefined,
        },
      );
    });

    let result = renderCodeBlock(lines, fgColor, {
      ...meta.metaProperties,
      dataLineNumbers: meta.usesLineNumbers ? "true" : "false",
      dataLang: languageNames[node.lang] ?? node.lang,
    });
    state.patch(node, result);
    return state.applyData(node, result);
  };
}

/** Colors a token with a span unless it already matches the block's color. */
function renderToken(token: ThemedToken, fgColor: string): Hast.ElementContent {
  let color = convertFakeHexToCustomProp(token.color ?? "");
  let text: Hast.Text = { type: "text", value: token.content };
  if (!color || color === fgColor) return text;
  return {
    type: "element",
    tagName: "span",
    properties: { style: `color: ${color}` },
    children: [text],
  };
}

function renderCodeLine(
  children: Hast.ElementContent[],
  properties: Hast.Properties,
): Hast.Element {
  return {
    type: "element",
    tagName: "span",
    properties,
    children: [...children, { type: "text", value: "\n" }],
  };
}

function renderCodeBlock(
  lines: Hast.Element[],
  fgColor: string,
  blockProperties: Hast.Properties,
): Hast.Element {
  return {
    type: "element",
    tagName: "div",
    properties: { dataCodeBlock: "", ...blockProperties },
    children: [
      {
        type: "element",
        tagName: "pre",
        properties: { ...blockProperties, style: `color: ${fgColor};` },
        children: [
          { type: "element", tagName: "code", properties: {}, children: lines },
        ],
      },
    ],
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
