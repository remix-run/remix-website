import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import { clampSimDt } from "./mouse-sim.ts";

describe("clampSimDt", () => {
  it("passes normal frame deltas through", () => {
    expect(clampSimDt(1 / 60)).toBe(1 / 60);
  });

  it("caps long pauses so one step can't overshoot", () => {
    expect(clampSimDt(5)).toBe(1 / 30);
  });

  it("treats negative deltas as no time passing", () => {
    expect(clampSimDt(-0.1)).toBe(0);
  });
});
