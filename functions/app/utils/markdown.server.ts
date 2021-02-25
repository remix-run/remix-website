import unified from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import rehypePrism from "@mapbox/rehype-prism";
import rehypeSlug from "rehype-slug";

// unified()
//   .use(markdown)
//   .use(remark2rehype)
//   .use(format)
//   .use(html)
//   .process("# Hello world!", function (err, file) {
//     if (err) throw err;
//     console.log(file);
//   });

export let processBase64Markdown = async (b64String: string) => {
  return processMarkdown(Buffer.from(b64String, "base64").toString("utf-8"));
};

export let processMarkdown = async (string: string) => {
  let result = await unified()
    .use(markdown)
    .use(remark2rehype)
    .use(rehypePrism)
    .use(rehypeSlug)
    .use(html)
    .process(string);

  return result.contents;
};
