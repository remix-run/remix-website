import { describe, expect, it } from "vitest";
import { getMorphBlend } from "./morph";

describe("getMorphBlend", () => {
  it("returns the first preset with no blend at the start", () => {
    const result = getMorphBlend(0, 5);
    expect(result.fromIndex).toBe(0);
    expect(result.toIndex).toBe(1);
    expect(result.blend).toBe(0);
  });

  it("interpolates between adjacent presets", () => {
    const result = getMorphBlend(1.5, 5);
    expect(result.fromIndex).toBe(1);
    expect(result.toIndex).toBe(2);
    expect(result.blend).toBeCloseTo(0.5);
  });

  it("clamps morph values past the end to the last preset", () => {
    const result = getMorphBlend(10, 5);
    expect(result.fromIndex).toBe(5);
    expect(result.toIndex).toBe(5);
    expect(result.blend).toBe(0);
  });

  it("clamps negative morph values to the first preset", () => {
    const result = getMorphBlend(-2, 5);
    expect(result.fromIndex).toBe(0);
    expect(result.toIndex).toBe(1);
    expect(result.blend).toBe(0);
  });

  it("treats a value exactly at maxValue as a clamped end", () => {
    const result = getMorphBlend(5, 5);
    expect(result.fromIndex).toBe(5);
    expect(result.toIndex).toBe(5);
    expect(result.blend).toBe(0);
  });

  it("handles a fractional morph just before the last index", () => {
    const result = getMorphBlend(4.25, 5);
    expect(result.fromIndex).toBe(4);
    expect(result.toIndex).toBe(5);
    expect(result.blend).toBeCloseTo(0.25);
  });
});
