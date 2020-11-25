const { json } = require("@remix-run/loader");
const unified = require("unified");
const remarkParse = require("remark-parse");
const remarkRehype = require("remark-rehype");
const html = require("rehype-stringify");
const rehypePrism = require("@mapbox/rehype-prism");

const fs = require("fs").promises;
const path = require("path");

module.exports = async ({ params }) => {
  let tag = params.tag;
  let filePath = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "releases",
    tag + ".md"
  );
  let file = await fs.readFile(filePath);
  let html = await md(file.toString());
  return json(
    { html },
    {
      headers: {
        "cache-control": "max-age=600",
      },
    }
  );
};

function md(str) {
  return new Promise((res, rej) => {
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(html)
      .use(rehypePrism)
      .process(str, function (err, file) {
        if (err) reject(err);
        else res(String(file));
      });
  });
}
