/*!
 * Forked from https://github.com/ryanflorence/md/blob/master/index.ts
 *
 * Adapted from
 * - ggoodman/nostalgie
 *   - MIT https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/LICENSE
 *   - https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/src/worker/mdxCompiler.ts
 */
import { getHighlighter, toShikiTheme } from "shiki";
import rangeParser from "parse-numeric-range";
import parseFrontMatter from "front-matter";
import type * as Hast from "hast";
import type { Options as SanitizeOptions } from "rehype-sanitize";
import type * as Unist from "unist";
import type * as Shiki from "shiki";
import type * as Unified from "unified";
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

type Processor = Awaited<ReturnType<typeof getProcessor>>;

// Cache processors by `allowHtml` so blog/Jam (allowHtml: true) and remote
// newsletter markdown (allowHtml: false) each reuse their own processor.
let processors = new Map<boolean, Promise<Processor>>();

export async function processMarkdown(
  content: string,
  options?: ProcessorOptions,
) {
  let processor = await getProcessorFor(options);
  let { attributes, body: raw } = parseFrontMatter(content);
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
    { default: remarkRehype },
    { default: rehypeSlug },
    { default: rehypeStringify },
    { default: rehypeAutolinkHeadings },
    { default: rehypeSanitize, defaultSchema },
    plugins,
  ] = await Promise.all([
    import("unified"),
    import("remark-gfm"),
    import("remark-parse"),
    import("remark-rehype"),
    import("rehype-slug"),
    import("rehype-stringify"),
    import("rehype-autolink-headings"),
    import("rehype-sanitize"),
    loadPlugins(),
  ]);

  let processor = unified()
    .use(remarkParse)
    .use(plugins.stripLinkExtPlugin)
    .use(plugins.rewriteImages)
    .use(plugins.remarkCodeBlocksShiki);

  if (allowHtml) processor.use(plugins.rawBlogImages);

  processor
    .use(plugins.lazyImages)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: allowHtml });

  if (allowHtml) processor.use(plugins.blogImages);

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

type InternalPlugin<
  Input extends string | Unist.Node | undefined,
  Output,
> = Unified.Plugin<[], Input, Output>;

async function loadPlugins() {
  let [{ visit, SKIP }, { htmlEscape }] = await Promise.all([
    import("unist-util-visit"),
    import("escape-goat"),
  ]);

  const stripLinkExtPlugin: InternalPlugin<
    UnistNode.Root,
    UnistNode.Root
  > = () => {
    return async function transformer(tree: UnistNode.Root, file: any) {
      let options = (file.data.processorOptions ?? {}) as ProcessorOptions;
      visit(tree, "link", (node, index, parent) => {
        if (
          options.resolveHref &&
          typeof node.url === "string" &&
          isRelativeUrl(node.url)
        ) {
          if (parent && index != null) {
            parent.children[index] = {
              ...node,
              url: options.resolveHref(node.url),
            };
            return SKIP;
          }
        }
      });
    };
  };

  const rewriteImages: InternalPlugin<UnistNode.Root, UnistNode.Root> = () => {
    return function transformer(tree: UnistNode.Root, file: any) {
      let options = (file.data.processorOptions ?? {}) as ProcessorOptions;
      let resolveImageUrl = options.resolveImageUrl;
      if (!resolveImageUrl) return;
      visit(tree, "image", (node) => {
        if (typeof node.url === "string" && isRelativeUrl(node.url)) {
          node.url = resolveImageUrl(node.url);
        }
      });
    };
  };

  const lazyImages: InternalPlugin<UnistNode.Root, UnistNode.Root> = () => {
    return function transformer(tree: UnistNode.Root) {
      let deferImage = (node: Unist.Node) => {
        let data = (node.data ?? {}) as Unist.Data & {
          hProperties?: Record<string, unknown>;
        };
        data.hProperties = {
          loading: "lazy",
          decoding: "async",
          ...data.hProperties,
        };
        node.data = data;
      };

      visit(tree, "image", deferImage);
      visit(tree, "imageReference", deferImage);
      visit(tree, "html", (node: UnistNode.Html) => {
        node.value = node.value.replace(
          /<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi,
          (tag) => {
            let attributes = "";
            if (!/\sloading\s*=/i.test(tag)) {
              attributes += ' loading="lazy"';
            }
            if (!/\sdecoding\s*=/i.test(tag)) {
              attributes += ' decoding="async"';
            }
            return tag.replace(/^<img\b/i, `<img${attributes}`);
          },
        );
      });
    };
  };

  const rawBlogImages: InternalPlugin<UnistNode.Root, UnistNode.Root> = () => {
    return async function transformer(tree: UnistNode.Root) {
      let tasks: Promise<void>[] = [];

      visit(tree, "html", (node: UnistNode.Html) => {
        tasks.push(
          transformRawBlogImages(node.value).then((value) => {
            node.value = value;
          }),
        );
      });
      await Promise.all(tasks);
    };
  };

  const blogImages: InternalPlugin<Hast.Root, Hast.Root> = () => {
    return async function transformer(tree: Hast.Root) {
      let tasks: Promise<void>[] = [];
      visit(tree, "element", (node: Hast.Element) => {
        if (node.tagName !== "img") return;
        let source = node.properties?.src;
        if (typeof source !== "string") return;

        tasks.push(
          getBlogImageAsset(source).then((asset) => {
            node.properties = getBlogImageProperties(
              node.properties ?? {},
              asset,
            );
          }),
        );
      });
      await Promise.all(tasks);
    };
  };

  const remarkCodeBlocksShiki: InternalPlugin<
    UnistNode.Root,
    UnistNode.Root
  > = () => {
    let theme: ReturnType<typeof toShikiTheme>;
    let highlighterPromise: ReturnType<typeof getHighlighter>;

    return async function transformer(tree: UnistNode.Root) {
      theme = theme || toShikiTheme(themeJson as any);
      highlighterPromise =
        highlighterPromise || getHighlighter({ themes: [theme] });
      let highlighter = await highlighterPromise;
      let fgColor = convertFakeHexToCustomProp(
        highlighter.getForegroundColor(theme.name) || "",
      );
      let langs: Shiki.Lang[] = [
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
      ];
      let langSet = new Set(langs);
      let transformTasks: Array<() => Promise<void>> = [];

      visit(tree, "code", (node) => {
        if (
          !node.lang ||
          !node.value ||
          !langSet.has(node.lang as Shiki.Lang)
        ) {
          return;
        }

        if (node.lang === "js") node.lang = "javascript";
        if (node.lang === "ts") node.lang = "typescript";
        let language = node.lang;
        let code = node.value;
        let {
          addedLines,
          highlightLines,
          nodeProperties,
          removedLines,
          startingLineNumber,
          usesLineNumbers,
        } = getCodeBlockMeta();

        transformTasks.push(highlightNodes);
        return SKIP;

        async function highlightNodes() {
          let tokens = getThemedTokens({ code, language });
          let children = tokens.map(
            (lineTokens, zeroBasedLineNumber): Hast.Element => {
              let children = lineTokens.map(
                (token): Hast.Text | Hast.Element => {
                  let color = convertFakeHexToCustomProp(token.color || "");
                  let content: Hast.Text = {
                    type: "text",
                    // Do not escape the _actual_ content
                    value: token.content,
                  };

                  return color && color !== fgColor
                    ? {
                        type: "element",
                        tagName: "span",
                        properties: {
                          style: `color: ${htmlEscape(color)}`,
                        },
                        children: [content],
                      }
                    : content;
                },
              );

              children.push({
                type: "text",
                value: "\n",
              });

              let isDiff = addedLines.length > 0 || removedLines.length > 0;
              let diffLineNumber = startingLineNumber - 1;
              let lineNumber = zeroBasedLineNumber + startingLineNumber;
              let highlightLine = highlightLines?.includes(lineNumber);
              let removeLine = removedLines.includes(lineNumber);
              let addLine = addedLines.includes(lineNumber);
              if (!removeLine) {
                diffLineNumber++;
              }

              return {
                type: "element",
                tagName: "span",
                properties: {
                  className: "codeblock-line",
                  dataHighlight: highlightLine ? "true" : undefined,
                  dataLineNumber: usesLineNumbers ? lineNumber : undefined,
                  dataAdd: isDiff ? addLine : undefined,
                  dataRemove: isDiff ? removeLine : undefined,
                  dataDiffLineNumber: isDiff ? diffLineNumber : undefined,
                },
                children,
              };
            },
          );

          let nodeValue = {
            type: "element",
            tagName: "pre",
            properties: {
              ...nodeProperties,
              dataLineNumbers: usesLineNumbers ? "true" : "false",
              dataLang: htmlEscape(language),
              style: `color: ${htmlEscape(fgColor)};`,
            },
            children: [
              {
                type: "element",
                tagName: "code",
                children,
              },
            ],
          };

          interface HastData extends Unist.Data {
            hProperties?: Record<string, unknown>;
            hChildren?: unknown[];
          }
          let data: HastData = (node.data ?? {}) as HastData;
          (node as any).type = "element";
          (node as any).tagName = "div";
          let properties =
            data.hProperties && typeof data.hProperties === "object"
              ? data.hProperties
              : {};
          data.hProperties = {
            ...properties,
            dataCodeBlock: "",
            ...nodeProperties,
            dataLineNumbers: usesLineNumbers ? "true" : "false",
            dataLang: htmlEscape(language),
          };
          data.hChildren = [nodeValue];
          node.data = data;
        }

        function getCodeBlockMeta() {
          // TODO: figure out how this is ever an array?
          let meta = Array.isArray(node.meta) ? node.meta[0] : node.meta;

          let metaParams = new URLSearchParams();
          if (meta) {
            let linesHighlightsMetaShorthand = meta.match(/^\[(.+)\]$/);
            if (linesHighlightsMetaShorthand) {
              metaParams.set("lines", linesHighlightsMetaShorthand[0]);
            } else {
              metaParams = new URLSearchParams(meta.split(/\s+/).join("&"));
            }
          }

          let addedLines = parseLineHighlights(metaParams.get("add"));
          let removedLines = parseLineHighlights(metaParams.get("remove"));
          let highlightLines = parseLineHighlights(metaParams.get("lines"));
          let startValNum = metaParams.has("start")
            ? Number(metaParams.get("start"))
            : 1;
          let startingLineNumber = Number.isFinite(startValNum)
            ? startValNum
            : 1;
          let usesLineNumbers = !metaParams.has("nonumber");

          let nodeProperties: { [key: string]: string } = {};
          metaParams.forEach((val, key) => {
            if (key === "lines") return;
            nodeProperties[`data-${key}`] = val;
          });

          return {
            addedLines,
            highlightLines,
            nodeProperties,
            removedLines,
            startingLineNumber,
            usesLineNumbers,
          };
        }
      });

      await Promise.all(transformTasks.map((exec) => exec()));

      function getThemedTokens({
        code,
        language,
      }: {
        code: string;
        language: Shiki.Lang;
      }) {
        return highlighter.codeToThemedTokens(code, language, theme.name, {
          includeExplanation: false,
        });
      }
    };
  };

  return {
    blogImages,
    lazyImages,
    rawBlogImages,
    remarkCodeBlocksShiki,
    rewriteImages,
    stripLinkExtPlugin,
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

////////////////////////////////////////////////////////////////////////////////

namespace UnistNode {
  export type Content = Flow | Phrasing | Html;
  export interface Root extends Unist.Parent {
    type: "root";
    children: Flow[];
  }

  export type Flow =
    | Blockquote
    | Heading
    | ParagraphNode
    | Link
    | Pre
    | Code
    | Image
    | Element
    | Html;

  export interface Html extends Unist.Node {
    type: "html";
    value: string;
  }

  export interface Element extends Unist.Parent {
    type: "element";
    tagName?: string;
  }

  export interface CodeElement extends Element {
    tagName: "code";
    data?: {
      meta?: string;
    };
    properties?: {
      className?: string[];
    };
  }

  export interface PreElement extends Element {
    tagName: "pre";
  }

  export interface Image extends Unist.Node {
    type: "image";
    title: null;
    url: string;
    alt?: string;
  }

  export interface Blockquote extends Unist.Parent {
    type: "blockquote";
    children: Flow[];
  }

  export interface Heading extends Unist.Parent {
    type: "heading";
    depth: number;
    children: UnistNode.Phrasing[];
  }

  interface ParagraphNode extends Unist.Parent {
    type: "paragraph";
    children: Phrasing[];
  }

  export interface Pre extends Unist.Parent {
    type: "pre";
    children: Phrasing[];
  }

  export interface Code extends Unist.Parent {
    type: "code";
    value?: string;
    lang?: Shiki.Lang;
    meta?: string | string[];
  }

  export type Phrasing = Text | Emphasis;

  export interface Emphasis extends Unist.Parent {
    type: "emphasis";
    children: Phrasing[];
  }

  export interface Link extends Unist.Parent {
    type: "link";
    children: Flow[];
    url?: string;
  }

  export interface Text extends Unist.Literal {
    type: "text";
    value: string;
  }
}
