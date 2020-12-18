const unified = require("unified");
const markdown = require("remark-parse");
const remark2rehype = require("remark-rehype");
const html = require("rehype-stringify");
const rehypePrism = require("@mapbox/rehype-prism");
const rehypeSlug = require("rehype-slug");

// unified()
//   .use(markdown)
//   .use(remark2rehype)
//   .use(format)
//   .use(html)
//   .process("# Hello world!", function (err, file) {
//     if (err) throw err;
//     console.log(file);
//   });

exports.processBase64Markdown = async (b64String) => {
  return processMarkdown(Buffer.from(b64String, "base64").toString("utf-8"));
};

let processMarkdown = (exports.processMarkdown = async (string) => {
  let result = await unified()
    .use(markdown)
    .use(remark2rehype)
    .use(rehypePrism)
    .use(rehypeSlug)
    .use(html)
    .process(string);

  return result.contents;
});
