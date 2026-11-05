import { describe, it } from "remix/test";
import { expect } from "remix/assert";

import {
  advanceIntroCountdown,
  advanceLiveCountdown,
  getJam2026Countdown,
  initialCountdownState,
  introTickCount,
  type CountdownState,
} from "./countdown-state.ts";

describe("getJam2026Countdown", () => {
  it("splits the time remaining into zero-padded units", () => {
    let now =
      new Date("2026-10-02T09:00:00-04:00").getTime() -
      ((12 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000;

    expect(getJam2026Countdown(now)).toEqual({
      days: "012",
      hrs: "03",
      min: "04",
      sec: "05",
    });
  });

  it("stops at zero once the event has started", () => {
    expect(
      getJam2026Countdown(new Date("2026-10-03T00:00:00Z").getTime()),
    ).toEqual(initialCountdownState.values);
  });
});

describe("advanceLiveCountdown", () => {
  it("flips only the units whose digits changed", () => {
    let state: CountdownState = {
      values: { days: "001", hrs: "02", min: "03", sec: "04" },
      flips: { days: 1, hrs: 1, min: 1, sec: 1 },
    };
    let live = { days: "001", hrs: "02", min: "03", sec: "03" };

    expect(advanceLiveCountdown(state, live)).toEqual({
      values: live,
      flips: { days: 1, hrs: 1, min: 1, sec: 2 },
    });
  });

  it("returns undefined when nothing changed", () => {
    let state = initialCountdownState;
    expect(advanceLiveCountdown(state, { ...state.values })).toBe(undefined);
  });
});

describe("advanceIntroCountdown", () => {
  let live = { days: "120", hrs: "23", min: "59", sec: "48" };

  it("staggers units and lands every unit on the live value", () => {
    let state = initialCountdownState;
    let flippedUnitsByTick: string[][] = [];

    for (let tick = 1; tick <= introTickCount; tick++) {
      let next = advanceIntroCountdown(state, live, tick, () => 0.5);
      if (!next) throw new Error(`tick ${tick} did not flip`);
      flippedUnitsByTick.push(
        Object.keys(next.flips).filter(
          (unit) =>
            next.flips[unit as keyof typeof next.flips] !==
            state.flips[unit as keyof typeof state.flips],
        ),
      );
      state = next;
    }

    expect(flippedUnitsByTick[0]).toEqual(["days"]);
    expect(flippedUnitsByTick[3]).toEqual(["days", "hrs", "min", "sec"]);
    expect(flippedUnitsByTick.at(-1)).toEqual(["sec"]);
    expect(state.values).toEqual(live);
  });

  it("never overshoots the live value", () => {
    let state = initialCountdownState;
    for (let tick = 1; tick <= introTickCount; tick++) {
      state = advanceIntroCountdown(state, live, tick, () => 0.999) ?? state;
      expect(Number(state.values.days) <= 120).toBe(true);
      expect(Number(state.values.sec) <= 48).toBe(true);
    }
  });

  it("returns undefined after the intro has finished", () => {
    expect(
      advanceIntroCountdown(
        initialCountdownState,
        live,
        introTickCount + 1,
        () => 0,
      ),
    ).toBe(undefined);
  });
});
