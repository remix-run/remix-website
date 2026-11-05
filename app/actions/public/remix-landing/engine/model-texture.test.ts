import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { packModelPositions } from "./model-texture.ts";

describe("packModelPositions", () => {
  it("writes each xyz point into its own RGBA texel and zero-fills the rest", () => {
    let data = packModelPositions([1, 2, 3, 4, 5, 6], 3);

    expect(Array.from(data)).toEqual([1, 2, 3, 0, 4, 5, 6, 0, 0, 0, 0, 0]);
  });

  it("drops points that don't fit in the texture", () => {
    let data = packModelPositions([1, 2, 3, 4, 5, 6, 7, 8, 9], 2);

    expect(Array.from(data)).toEqual([1, 2, 3, 0, 4, 5, 6, 0]);
  });

  it("ignores a trailing partial point", () => {
    let data = packModelPositions([1, 2, 3, 4, 5], 2);

    expect(Array.from(data)).toEqual([1, 2, 3, 0, 0, 0, 0, 0]);
  });
});
