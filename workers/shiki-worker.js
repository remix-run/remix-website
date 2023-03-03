// Strategy and code adapted from
// https://unpkg.com/browse/@kentcdodds/md-temp@3.2.1/dist/index.js
// See https://kentcdodds.com/blog/fixing-a-memory-leak-in-a-production-node-js-app
//
// This is intended to work around a memory leak in shiki so that our site
// doesn't crash when we hit memory limits
const { getHighlighter } = require("shiki");
const theme = require("./shiki-theme");

/** @type {Awaited<ReturnType<typeof getHighlighter>>} */
let highlighter;
/** @type {string} */
let fgColor;
/** @type {string} */
let bgColor;

module.exports = async function highlight({ code, language }) {
  highlighter = highlighter || (await getHighlighter({ themes: [theme] }));
  fgColor =
    fgColor ||
    convertFakeHexToCustomProp(
      highlighter.getForegroundColor(theme.name) || ""
    );
  bgColor =
    bgColor ||
    convertFakeHexToCustomProp(
      highlighter.getBackgroundColor(theme.name) || ""
    );

  let tokens = highlighter.codeToThemedTokens(code, language, theme.name);
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
