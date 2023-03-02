// Strategy and code adapted from
// https://unpkg.com/browse/@kentcdodds/md-temp@3.2.1/dist/index.js
// See https://kentcdodds.com/blog/fixing-a-memory-leak-in-a-production-node-js-app
//
// This is intended to work around a memory leak in shiki so that our site
// doesn't crash when we hit memory limits
const path = require("path");
const { getHighlighter, loadTheme } = require("shiki");
const themeName = "base16";
let theme, highlighter;

module.exports = async function highlight({ code, language }) {
  theme = theme || (await loadTheme(path.resolve(__dirname, "base16.json")));
  highlighter = highlighter || (await getHighlighter({ themes: [theme] }));
  let fgColor = convertFakeHexToCustomProp(
    highlighter.getForegroundColor(themeName) || ""
  );
  let bgColor = convertFakeHexToCustomProp(
    highlighter.getBackgroundColor(themeName) || ""
  );

  let tokens = highlighter.codeToThemedTokens(code, language, themeName);
  return {
    fgColor,
    bgColor,
    tokens: tokens.map((lineTokens) =>
      lineTokens.map((t) => ({ content: t.content, color: t.color }))
    ),
  };
};

// The theme actually stores #FFFF${base-16-color-id} because vscode-textmate
// requires colors to be valid hex codes, if they aren't, it changes them to a
// default, so this is a mega hack to trick it.
function convertFakeHexToCustomProp(color) {
  return color.replace(/^#FFFF(.+)/, "var(--base$1)");
}
