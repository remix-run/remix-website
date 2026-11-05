import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { presets } from "./engine/presets.ts";
import { getMorphValue } from "./landing-scroll.ts";

const MAX = presets.length - 1;
const STOPS = presets.map((_, index) => index * 100);
const RANGE = MAX * 100;

describe("getMorphValue", () => {
  it("lands exactly on each preset at its section's scroll stop", () => {
    for (let [index, stop] of STOPS.entries()) {
      expect(getMorphValue(stop, RANGE, STOPS)).toBe(index);
    }
  });

  it("holds on a preset near its stop and blends between stops", () => {
    expect(getMorphValue(210, RANGE, STOPS)).toBe(2);
    expect(getMorphValue(250, RANGE, STOPS)).toBeCloseTo(2.5);
    expect(getMorphValue(290, RANGE, STOPS)).toBe(3);
  });

  it("clamps scroll positions outside the page", () => {
    expect(getMorphValue(-50, RANGE, STOPS)).toBe(0);
    expect(getMorphValue(RANGE * 2, RANGE, STOPS)).toBe(MAX);
  });

  it("snaps to the next preset across sub-pixel segments", () => {
    let stops = [...STOPS];
    stops[2] = stops[1] + 0.5;
    expect(getMorphValue(stops[1] + 0.25, RANGE, stops)).toBe(2);
  });

  it("splits the page evenly before sections are measured", () => {
    expect(getMorphValue(0, RANGE, null)).toBe(0);
    expect(getMorphValue(250, RANGE, null)).toBeCloseTo(2.5);
    expect(getMorphValue(RANGE, RANGE, null)).toBe(MAX);
  });
});
