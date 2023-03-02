import { toShikiTheme } from "shiki";

// https://raw.githubusercontent.com/ryanflorence/md/master/base16.json?token=GHSAT0AAAAAABYBMWF6X7HEVXVUQ335Z4AGZAAZHHA
export const vscodeColorTheme = {
  $schema: "vscode://schemas/color-theme",
  name: "base16",
  type: "dark",
  colors: { "editor.background": "#FFFF00", "editor.foreground": "#FFFF05" },
  tokenColors: [
    {
      name: "Comment",
      scope: ["comment", "punctuation.definition.comment"],
      settings: { fontStyle: "italic", foreground: "#FFFF03" },
    },
    {
      name: "Variables, Parameters",
      scope: [
        "variable",
        "string constant.other.placeholder",
        "entity.name.variable.parameter",
        "entity.name.variable.local",
        "variable.parameter",
      ],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Properties",
      scope: ["variable.other.object.property"],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Colors",
      scope: ["constant.other.color"],
      settings: { foreground: "#FFFF0B" },
    },
    {
      name: "Invalid",
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Invalid - Deprecated",
      scope: ["invalid.deprecated"],
      settings: { foreground: "#FFFF0F" },
    },
    {
      name: "Keyword, Storage",
      scope: ["keyword", "storage.modifier"],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Keyword Control",
      scope: [
        "keyword.control",
        "keyword.control.flow",
        "keyword.control.from",
        "keyword.control.import",
        "keyword.control.as",
      ],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Keyword",
      scope: [
        "keyword.other.using",
        "keyword.other.namespace",
        "keyword.other.class",
        "keyword.other.new",
        "keyword.other.event",
        "keyword.other.this",
        "keyword.other.await",
        "keyword.other.var",
        "keyword.other.package",
        "keyword.other.import",
        "variable.language.this",
        "storage.type.ts",
      ],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Types, Primitives",
      scope: ["keyword.type", "storage.type.primitive"],
      settings: { foreground: "#FFFF0C" },
    },
    {
      name: "Function",
      scope: ["storage.type.function"],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Operator, Misc",
      scope: [
        "constant.other.color",
        "punctuation",
        "punctuation.section.class.end",
        "meta.tag",
        "punctuation.definition.tag",
        "punctuation.separator.inheritance.php",
        "punctuation.definition.tag.html",
        "punctuation.definition.tag.begin.html",
        "punctuation.definition.tag.end.html",
        "keyword.other.template",
        "keyword.other.substitution",
      ],
      settings: { foreground: "#FFFF05" },
    },
    {
      name: "Embedded",
      scope: ["punctuation.section.embedded", "variable.interpolation"],
      settings: { foreground: "#FFFF0F" },
    },
    {
      name: "Tag",
      scope: ["entity.name.tag", "meta.tag.sgml", "markup.deleted.git_gutter"],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Function, Special Method",
      scope: [
        "entity.name.function",
        "meta.function-call",
        "variable.function",
        "support.function",
        "keyword.other.special-method",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Block Level Variables",
      scope: ["meta.block variable.other"],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Other Variable, String Link",
      scope: ["support.other.variable", "string.other.link"],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Number, Constant, Function Argument, Tag Attribute, Embedded",
      scope: [
        "constant.numeric",
        "constant.language",
        "support.constant",
        "constant.character",
        "constant.escape",
        "keyword.other.unit",
        "keyword.other",
      ],
      settings: { foreground: "#FFFF09" },
    },
    {
      name: "String, Symbols, Inherited Class, Markup Heading",
      scope: [
        "string",
        "constant.other.symbol",
        "constant.other.key",
        "entity.other.inherited-class",
        "markup.heading",
        "markup.inserted.git_gutter",
        "meta.group.braces.curly constant.other.object.key.js string.unquoted.label.js",
      ],
      settings: { fontStyle: "", foreground: "#FFFF0B" },
    },
    {
      name: "Class, Support",
      scope: [
        "entity.name",
        "support.type",
        "support.class",
        "support.other.namespace.use.php",
        "meta.use.php",
        "support.other.namespace.php",
        "markup.changed.git_gutter",
        "support.type.sys-types",
      ],
      settings: { foreground: "#FFFF0A" },
    },
    {
      name: "Storage Type, Import Class",
      scope: [
        "storage.type",
        "storage.modifier.package",
        "storage.modifier.import",
      ],
      settings: { foreground: "#FFFF0A" },
    },
    {
      name: "Fields",
      scope: ["entity.name.variable.field"],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Entity Types",
      scope: ["support.type"],
      settings: { foreground: "#FFFF0C" },
    },
    {
      name: "CSS Class and Support",
      scope: [
        "source.css support.type.property-name",
        "source.sass support.type.property-name",
        "source.scss support.type.property-name",
        "source.less support.type.property-name",
        "source.stylus support.type.property-name",
        "source.postcss support.type.property-name",
      ],
      settings: { foreground: "#FFFF0C" },
    },
    {
      name: "Sub-methods",
      scope: [
        "entity.name.module.js",
        "variable.import.parameter.js",
        "variable.other.class.js",
      ],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Language methods",
      scope: ["variable.language"],
      settings: { fontStyle: "italic", foreground: "#FFFF08" },
    },
    {
      name: "entity.name.method.js",
      scope: ["entity.name.method.js"],
      settings: { fontStyle: "italic", foreground: "#FFFF0D" },
    },
    {
      name: "meta.method.js",
      scope: [
        "meta.class-method.js entity.name.function.js",
        "variable.function.constructor",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Attributes",
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "HTML Attributes",
      scope: [
        "text.html.basic entity.other.attribute-name.html",
        "text.html.basic entity.other.attribute-name",
      ],
      settings: { fontStyle: "italic", foreground: "#FFFF0A" },
    },
    {
      name: "CSS Classes",
      scope: ["entity.other.attribute-name.class"],
      settings: { foreground: "#FFFF0A" },
    },
    {
      name: "CSS ID's",
      scope: ["source.sass keyword.control"],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Inserted",
      scope: ["markup.inserted"],
      settings: { foreground: "#FFFF0B" },
    },
    {
      name: "Deleted",
      scope: ["markup.deleted"],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Changed",
      scope: ["markup.changed"],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Regular Expressions",
      scope: ["string.regexp"],
      settings: { foreground: "#FFFF0C" },
    },
    {
      name: "Escape Characters",
      scope: ["constant.character.escape"],
      settings: { foreground: "#FFFF0C" },
    },
    {
      name: "URL",
      scope: ["*url*", "*link*", "*uri*"],
      settings: { fontStyle: "underline" },
    },
    {
      name: "Decorators",
      scope: [
        "tag.decorator.js entity.name.tag.js",
        "tag.decorator.js punctuation.definition.tag.js",
      ],
      settings: { fontStyle: "italic", foreground: "#FFFF0D" },
    },
    {
      name: "ES7 Bind Operator",
      scope: [
        "source.js constant.other.object.key.js string.unquoted.label.js",
      ],
      settings: { fontStyle: "italic", foreground: "#FFFF0E" },
    },
    {
      name: "JSON Key - Level 0",
      scope: [
        "source.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 1",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 2",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 3",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 4",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 5",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 6",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 7",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "JSON Key - Level 8",
      scope: [
        "source.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json meta.structure.dictionary.value.json meta.structure.dictionary.json support.type.property-name.json",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Markdown - Plain",
      scope: [
        "text.html.markdown",
        "punctuation.definition.list_item.markdown",
      ],
      settings: { foreground: "#FFFF05" },
    },
    {
      name: "Markdown - Markup Raw Inline",
      scope: ["text.html.markdown markup.inline.raw.markdown"],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Markdown - Markup Raw Inline Punctuation",
      scope: [
        "text.html.markdown markup.inline.raw.markdown punctuation.definition.raw.markdown",
      ],
      settings: { foreground: "#FFFF0C" },
    },
    {
      name: "Markdown - Line Break",
      scope: ["text.html.markdown meta.dummy.line-break"],
      settings: { foreground: "#FFFF03" },
    },
    {
      name: "Markdown - Heading",
      scope: [
        "markdown.heading",
        "markup.heading | markup.heading entity.name",
        "markup.heading.markdown punctuation.definition.heading.markdown",
      ],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Markup - Italic",
      scope: ["markup.italic"],
      settings: { fontStyle: "italic", foreground: "#FFFF08" },
    },
    {
      name: "Markup - Bold",
      scope: ["markup.bold", "markup.bold string"],
      settings: { fontStyle: "bold", foreground: "#FFFF08" },
    },
    {
      name: "Markup - Bold-Italic",
      scope: [
        "markup.bold markup.italic",
        "markup.italic markup.bold",
        "markup.quote markup.bold",
        "markup.bold markup.italic string",
        "markup.italic markup.bold string",
        "markup.quote markup.bold string",
      ],
      settings: { fontStyle: "bold", foreground: "#FFFF08" },
    },
    {
      name: "Markup - Underline",
      scope: ["markup.underline"],
      settings: { fontStyle: "underline", foreground: "#FFFF09" },
    },
    {
      name: "Markdown - Blockquote",
      scope: ["markup.quote punctuation.definition.blockquote.markdown"],
      settings: { foreground: "#FFFF0C" },
    },
    {
      name: "Markup - Quote",
      scope: ["markup.quote"],
      settings: { fontStyle: "italic" },
    },
    {
      name: "Markdown - Link",
      scope: ["string.other.link.title.markdown"],
      settings: { foreground: "#FFFF0D" },
    },
    {
      name: "Markdown - Link Description",
      scope: ["string.other.link.description.title.markdown"],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Markdown - Link Anchor",
      scope: ["constant.other.reference.link.markdown"],
      settings: { foreground: "#FFFF0A" },
    },
    {
      name: "Markup - Raw Block",
      scope: ["markup.raw.block"],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Markdown - Raw Block Fenced",
      scope: ["markup.raw.block.fenced.markdown"],
      settings: { foreground: "#00000050" },
    },
    {
      name: "Markdown - Fenced Bode Block",
      scope: ["punctuation.definition.fenced.markdown"],
      settings: { foreground: "#00000050" },
    },
    {
      name: "Markdown - Fenced Code Block Variable",
      scope: [
        "markup.raw.block.fenced.markdown",
        "variable.language.fenced.markdown",
      ],
      settings: { foreground: "#FFFF0E" },
    },
    {
      name: "Markdown - Fenced Language",
      scope: ["variable.language.fenced.markdown"],
      settings: { foreground: "#FFFF08" },
    },
    {
      name: "Markdown - Separator",
      scope: ["meta.separator"],
      settings: { fontStyle: "bold", foreground: "#FFFF0C" },
    },
    {
      name: "Markup - Table",
      scope: ["markup.table"],
      settings: { foreground: "#FFFF0E" },
    },
    { scope: "token.info-token", settings: { foreground: "#FFFF0D" } },
    { scope: "token.warn-token", settings: { foreground: "#FFFF0A" } },
    { scope: "token.error-token", settings: { foreground: "#FFFF08" } },
    { scope: "token.debug-token", settings: { foreground: "#FFFF0E" } },
  ],
};

export const theme = toShikiTheme(
  // totally fine to pass a vscode theme, unsure why shiki types don't allow it
  vscodeColorTheme as any
);
