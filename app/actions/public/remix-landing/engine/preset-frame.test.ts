import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { capRacetrackParallax, computePresetFrame } from "./preset-frame.ts";
import { presets } from "./presets.ts";
import { DEFAULT_SETTINGS } from "./types.ts";

const RACETRACK = presets.findIndex((preset) => preset.name === "Racetrack");
const DRIVE = presets.findIndex((preset) => preset.name === "Drive");

function frameAt(morphValue: number, reduceMotion = false) {
  return computePresetFrame(morphValue, reduceMotion, DEFAULT_SETTINGS);
}

describe("computePresetFrame", () => {
  it("holds a single preset without blending at integer positions", () => {
    let frame = frameAt(0);
    expect(frame.blend).toBe(0);
    expect(frame.morphT).toBe(0);
    expect(frame.controlsB).toEqual(frame.controlsA);
  });

  it("blends adjacent presets symmetrically at the midpoint", () => {
    let frame = frameAt(0.5);
    expect(frame.fromIndex).toBe(0);
    expect(frame.toIndex).toBe(1);
    expect(frame.morphT).toBeCloseTo(0.5);
    expect(frame.controlsB).not.toEqual(frame.controlsA);
  });

  it("surges the racetrack only while departing it with motion allowed", () => {
    let departing = frameAt(RACETRACK + 0.5);
    expect(departing.controlsA[7]).toBeCloseTo(0.25 * 32);
    expect(departing.controlsB[7]).toBe(0);
    expect(departing.afterImageDamp).toBeGreaterThan(
      frameAt(RACETRACK).afterImageDamp,
    );

    let reduced = frameAt(RACETRACK + 0.5, true);
    expect(reduced.controlsA[7]).toBe(0);
    expect(reduced.afterImageDamp).toBe(0);
  });

  it("fogs the road presets and fades fog out a preset away", () => {
    expect(frameAt(RACETRACK).fogProximity).toBe(1);
    expect(frameAt(DRIVE).fogProximity).toBe(1);
    expect(frameAt(RACETRACK + 0.5).fogProximity).toBeCloseTo(0.5);
    let farFromRoads = presets.findIndex(
      (_, index) =>
        Math.abs(index - RACETRACK) > 1 && Math.abs(index - DRIVE) > 1,
    );
    expect(frameAt(farFromRoads).fogProximity).toBe(0);
  });

  it("places the car and applies Drive overrides on the Drive preset", () => {
    let frame = frameAt(DRIVE);
    expect(frame.driveProximity).toBe(1);
    expect(frame.carPosY).toBeLessThan(0);
    expect(frame.racetrackRoadLock).toBe(0);
    expect(frame.repulsion).toBe(0);
  });

  it("locks parallax to the road on the racetrack", () => {
    expect(frameAt(RACETRACK).racetrackRoadLock).toBe(1);
    expect(frameAt(RACETRACK + 1).racetrackRoadLock).toBe(0);
  });
});

describe("capRacetrackParallax", () => {
  it("passes parallax through away from the racetrack", () => {
    expect(capRacetrackParallax(12, 0)).toBe(12);
  });

  it("attenuates and caps parallax to the track width on the racetrack", () => {
    expect(capRacetrackParallax(1, 1)).toBeCloseTo(0.4);
    let cap = capRacetrackParallax(1000, 1);
    expect(cap).toBeLessThan(10);
    expect(capRacetrackParallax(-1000, 1)).toBeCloseTo(-cap);
  });
});
