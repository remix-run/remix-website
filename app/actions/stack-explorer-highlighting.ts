import { getHighlighter, toShikiTheme } from "shiki";

import {
  stackExplorerCodeSamples,
  type StackExplorerCodeHighlights,
  type StackExplorerCodeToken,
} from "./public/remix-landing/components/stack-explorer-content.tsx";

const DEFAULT_TOKEN_COLOR = "#FFFFFF";

const stackExplorerTheme = toShikiTheme({
  name: "remix-stack-explorer",
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
});

let highlighterPromise: ReturnType<typeof getHighlighter> | undefined;
let codeHighlightsPromise: Promise<StackExplorerCodeHighlights> | undefined;

export function getStackExplorerCodeHighlights(): Promise<StackExplorerCodeHighlights> {
  return (codeHighlightsPromise ??= createStackExplorerCodeHighlights());
}

async function createStackExplorerCodeHighlights() {
  let highlighter = await getStackExplorerHighlighter();

  return Object.fromEntries(
    stackExplorerCodeSamples.map((sample) => [
      sample.key,
      compactTokens(
        highlighter.codeToThemedTokens(
          sample.code,
          sample.language,
          stackExplorerTheme.name,
          { includeExplanation: false },
        ),
      ),
    ]),
  );
}

function getStackExplorerHighlighter() {
  return (highlighterPromise ??= getHighlighter({
    themes: [stackExplorerTheme],
    langs: ["tsx", "css"],
  }));
}

function compactTokens(
  lines: ReturnType<
    Awaited<ReturnType<typeof getHighlighter>>["codeToThemedTokens"]
  >,
): StackExplorerCodeToken[] {
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
