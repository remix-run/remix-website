import {
  getSingletonHighlighter,
  type ThemeRegistration,
  type ThemedToken,
} from "shiki";

import {
  stackExplorerCodeSamples,
  type StackExplorerCodeToken,
} from "./public/remix-landing/stack-explorer-content.tsx";
import { memoizeAsync } from "../utils/memoize-async.ts";

const DEFAULT_TOKEN_COLOR = "#FFFFFF";

const stackExplorerTheme: ThemeRegistration = {
  name: "remix-stack-explorer",
  type: "dark",
  settings: [
    {
      settings: {
        background: "#000000",
        foreground: DEFAULT_TOKEN_COLOR,
      },
    },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#FFFFFF73" },
    },
    {
      scope: ["string"],
      settings: { foreground: "#7CE95A" },
    },
    {
      scope: ["constant.numeric"],
      settings: { foreground: "#FFDF5F" },
    },
    {
      scope: ["keyword", "storage.type", "constant.language"],
      settings: { foreground: "#2DACF9" },
    },
    {
      scope: ["support.type.primitive", "entity.name.type"],
      settings: { foreground: "#FF3C32" },
    },
    {
      scope: ["entity.name.tag", "support.class.component"],
      settings: { foreground: "#FA73DA" },
    },
  ],
};

export const getStackExplorerCodeHighlights = memoizeAsync(
  createStackExplorerCodeHighlights,
);

async function createStackExplorerCodeHighlights() {
  let highlighter = await getSingletonHighlighter({
    themes: [stackExplorerTheme],
    langs: ["tsx", "css", "sql"],
  });

  return Object.fromEntries(
    stackExplorerCodeSamples.map((sample) => [
      sample.key,
      compactTokens(
        highlighter.codeToTokensBase(sample.code, {
          lang: sample.language,
          theme: stackExplorerTheme,
          includeExplanation: false,
        }),
      ),
    ]),
  );
}

function compactTokens(lines: ThemedToken[][]): StackExplorerCodeToken[] {
  let result: StackExplorerCodeToken[] = [];

  function append(content: string, color?: string) {
    let normalizedColor =
      color?.toUpperCase() === DEFAULT_TOKEN_COLOR ? undefined : color;
    let previous = result.at(-1);
    if (previous && previous[1] === normalizedColor) {
      previous[0] += content;
    } else {
      result.push([content, normalizedColor]);
    }
  }

  lines.forEach((line, lineIndex) => {
    line.forEach((token) => append(token.content, token.color));
    if (lineIndex < lines.length - 1) append("\n");
  });

  return result;
}
