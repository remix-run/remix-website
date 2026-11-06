import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { stackExplorerCodeSamples } from "./public/remix-landing/stack-explorer-content.tsx";
import { getStackExplorerCodeHighlights } from "./stack-explorer-highlighting.ts";

describe("getStackExplorerCodeHighlights", () => {
  it("highlights every sample without changing its text", async () => {
    let highlights = await getStackExplorerCodeHighlights();

    for (let sample of stackExplorerCodeSamples) {
      let tokens = highlights[sample.key];
      expect(tokens.map(([content]) => content).join("")).toBe(sample.code);
    }
  });

  it("colors syntax and leaves default-colored text uncolored", async () => {
    let highlights = await getStackExplorerCodeHighlights();
    let tokens = Object.values(highlights).flat();

    expect(tokens.some(([, color]) => color !== undefined)).toBe(true);
    expect(tokens.some(([, color]) => color?.toUpperCase() === "#FFFFFF")).toBe(
      false,
    );
  });

  it("merges adjacent tokens that share a color", async () => {
    let highlights = await getStackExplorerCodeHighlights();

    for (let tokens of Object.values(highlights)) {
      for (let index = 1; index < tokens.length; index++) {
        expect(tokens[index][1]).not.toBe(tokens[index - 1][1]);
      }
    }
  });

  it("shares one highlight result between callers", async () => {
    expect(await getStackExplorerCodeHighlights()).toBe(
      await getStackExplorerCodeHighlights(),
    );
  });
});
