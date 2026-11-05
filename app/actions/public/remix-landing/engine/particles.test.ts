import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { createParticleAttributes } from "./particles.ts";

function sequence(...values: number[]) {
  let index = 0;
  return () => values[index++ % values.length]!;
}

describe("createParticleAttributes", () => {
  it("keeps most particles at normal size", () => {
    let { randoms, sizeBoost } = createParticleAttributes(
      2,
      sequence(0.4, 0.9),
    );

    expect(Array.from(sizeBoost)).toEqual([1, 1]);
    expect(randoms[0]).toBeCloseTo(0.4);
  });

  it("boosts a particle when the boost roll lands in the small boost fraction", () => {
    let low = createParticleAttributes(1, sequence(0.5, 0, 0)).sizeBoost[0]!;
    let high = createParticleAttributes(1, sequence(0.5, 0, 0.999_999))
      .sizeBoost[0]!;

    expect(low).toBeCloseTo(1.32);
    expect(high).toBeCloseTo(3.05);
  });

  it("boosts only a few percent of particles with real randomness", () => {
    let { sizeBoost } = createParticleAttributes(20_000);
    let boosted = Array.from(sizeBoost).filter((size) => size !== 1).length;

    expect(boosted).toBeGreaterThan(200);
    expect(boosted).toBeLessThan(1_000);
  });
});
