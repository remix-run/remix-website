exports.browserBuildDirectory = "../public/build";
exports.publicPath = "/build/";
exports.appDirectory = "./app";
exports.dataDirectory = "./data";
exports.serverBuildDirectory = "./build";
exports.devServerPort = 8002;

exports.mdx = {
  rehypePlugins: [
    require("@mapbox/rehype-prism"),
    require("rehype-slug"),
    [
      require("@jsdevtools/rehype-toc"),
      { customizeTOC: customTOC, headings: ["h2"] },
    ],
    moveContentToMain,
  ],
};

////////////////////////////////////////////////////////////////////////////////
// Rehype stuff for MDX
function customTOC(nav) {
  nav.children.unshift({
    type: "element",
    tagName: "div",
    properties: { className: "heading" },
    children: [
      {
        type: "text",
        value: "On this page",
      },
    ],
  });
  return nav;
}

function moveContentToMain() {
  return (root) => {
    let [nav, ...originalChildren] = root.children;
    let firstElementIndex = originalChildren.findIndex(
      (n) => n.type === "element"
    );
    let children = originalChildren.slice(firstElementIndex);
    let importsAndStuff = originalChildren.slice(0, firstElementIndex);
    let article = {
      type: "element",
      tagName: "article",
      properties: { className: "markdown-body" },
      children,
    };
    root.children = [...importsAndStuff, nav, article];
    return root;
  };
}
