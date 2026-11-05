import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { BAKE_TEX_W, computeBakeTexHeight } from "./rest-baker.ts";

describe("computeBakeTexHeight", () => {
  it("fits every particle in a whole number of 16-row blocks", () => {
    for (let count of [1, 511, 512, 513, 8_192, 8_193, 120_000]) {
      let height = computeBakeTexHeight(count);
      expect(height % 16).toBe(0);
      expect(height * BAKE_TEX_W).toBeGreaterThanOrEqual(count);
      // No more than one spare block of rows.
      expect((height - 16) * BAKE_TEX_W).toBeLessThan(count);
    }
  });

  it("never returns fewer than 16 rows, even with no particles", () => {
    expect(computeBakeTexHeight(0)).toBe(16);
    expect(computeBakeTexHeight(1)).toBe(16);
  });
});
