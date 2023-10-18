import fs from "fs";
import path from "path";
import { loadPlugins, type UnistNode } from "~/lib/md.server";
import LRUCache from "lru-cache";
import type { Processor } from "unified";
import type * as Hast from "hast";
import type * as Mdast from "mdast";
import type * as Unist from "unist";

const STATE_NORMAL = "NORMAL";
const STATE_SEQUENCING = "SEQUENCING";
type State = typeof STATE_NORMAL | typeof STATE_SEQUENCING;

// This is relative to where this code ends up in the build, not the source
const CONTENT_PATH = path.join(__dirname, "..", "md");

const cache = new LRUCache<string, MarkdownTutPage>({
  maxSize: 1024 * 1024 * 12, // 12 mb
  sizeCalculation(value, key) {
    return JSON.stringify(value).length + (key ? key.length : 0);
  },
});

let processor: Awaited<ReturnType<typeof getProcessor>>;

async function getProcessor() {
  let [
    { unified },
    { default: remarkParse },
    { default: remarkHtml },
    plugins,
  ] = await Promise.all([
    import("unified"),
    import("remark-parse"),
    import("remark-html"),
    loadPlugins(),
  ]);

  return unified()
    .use(remarkParse)
    .use(plugins.remarkCodeBlocksShiki)
    .use(remarkHtml, { sanitize: false });
}

async function getMarkdownTutPage(filename: string): Promise<MarkdownTutPage> {
  processor = processor || (await getProcessor());
  let cached = cache.get(filename);
  if (cached) {
    return cached;
  }
  let filePath = path.join(CONTENT_PATH, filename);
  let file = await fs.promises.readFile(filePath);
  let page = (await process(processor, file)) as MarkdownTutPage;
  cache.set(filename, page);
  return page;
}

////////////////////////////////////////////////////////////////////////////////

type TProcessor = Processor<
  Hast.Node<Unist.Data>,
  Hast.Node<Unist.Data>,
  Hast.Node<Unist.Data>,
  string
>;

async function process(
  processor: TProcessor,
  content: string | Buffer,
): Promise<MarkdownTutPage> {
  let state: State = STATE_NORMAL;
  let tree = (await processor.run(processor.parse(content))) as UnistNode.Root;
  let current: ProseNode | SlideNode = {
    type: "prose",
    children: [],
  };
  let root: Array<ProseNode | SequenceNode | SlideNode> = [current];
  for (let node of tree.children) {
    if (state === STATE_NORMAL) {
      if (isSequenceFence(node)) {
        startSequencing();
      } else {
        addNode(node);
      }
    } else if (state === STATE_SEQUENCING) {
      if (isSequenceFence(node)) {
        stopSequencing();
      } else {
        if (isSequenceBreak(node)) {
          addSlide();
        } else {
          addNode(node);
        }
      }
    }
  }

  return stringify(processor, root) as MarkdownTutPage;

  function addNode(node: UnistNode.Flow) {
    current.children.push(node);
  }

  function addSlide() {
    let sequence = root[root.length - 1];
    if (sequence.type !== "sequence") {
      throw new Error(`Expected sequence, got "${sequence.type}"`);
    }
    let slide: SlideNode = {
      type: "slide",
      children: [],
    };
    sequence.children.push(slide);
    current = slide;
  }

  function startSequencing() {
    state = STATE_SEQUENCING;
    let sequence: SequenceNode = {
      type: "sequence",
      children: [],
    };
    root.push(sequence);
    let slide: SlideNode = {
      type: "slide",
      children: [],
    };
    sequence.children.push(slide);
    current = slide;
  }

  function stopSequencing() {
    state = STATE_NORMAL;
    current = {
      type: "prose",
      children: [],
    };
    root.push(current);
  }
}

function stringify(
  processor: TProcessor,
  root: Array<ProseNode | SequenceNode | SlideNode>,
): MarkdownTutPage {
  let page: MarkdownTutPage = [];
  for (let node of root) {
    if (node.type === "prose") {
      page.push({
        type: "prose",
        html: processor
          .stringify({ type: "root", children: node.children } as Mdast.Root)
          .trim(),
      });
    } else if (node.type === "sequence") {
      let slides: Slide[] = [];
      for (let slideNode of node.children) {
        let length = slideNode.children.length;
        let subjectNode = slideNode.children[length - 1];
        let childNodes = slideNode.children.slice(0, length - 1);
        let html = processor
          .stringify({ type: "root", children: childNodes } as Mdast.Root)
          .trim();
        let subject = processor.stringify(subjectNode).trim();
        slides.push({ type: "slide", subject, html });
      }
      page.push({ type: "sequence", slides });
    }
  }
  return page;
}

function isSequenceFence<N extends { type: string; children?: unknown }>(
  node: N,
): node is N & { type: "paragraph"; children: [UnistNode.Text] } {
  if (node.type !== "paragraph" || !Array.isArray(node.children)) {
    return false;
  }
  let firstChild: unknown = node.children[0];
  return !!(
    firstChild &&
    typeof firstChild === "object" &&
    "value" in firstChild &&
    firstChild.value === ":::"
  );
}

function isSequenceBreak<N extends { type: string }>(
  node: N,
): node is N & { type: "thematicBreak" } {
  return "type" in node && node.type === "thematicBreak";
}

type MarkdownTutPage = (Prose | Sequence)[];

interface Prose {
  type: "prose";
  html: string;
}

interface Sequence {
  type: "sequence";
  slides: Slide[];
}

interface Slide {
  type: "slide";
  html: string;
  subject: string;
}

interface ProseNode extends Unist.Parent {
  type: "prose";
  children: UnistNode.Flow[];
}

interface SequenceNode extends Unist.Parent {
  type: "sequence";
  children: SlideNode[];
}

interface SlideNode extends Unist.Parent {
  type: "slide";
  children: Hast.Node[];
}

export { getMarkdownTutPage, getProcessor };
export type { MarkdownTutPage, Prose, Sequence, Slide };
