import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { PointerBrush } from "./pointer-brush.ts";

const DT = 1 / 60;

function sweep(brush: PointerBrush, frames: number, reduceMotion = false) {
  for (let i = 0; i < frames; i++) {
    brush.step(i % 2 === 0 ? -0.5 : 0.5, 0, DT, reduceMotion);
  }
}

describe("PointerBrush", () => {
  it("stays off for a steady pointer", () => {
    let brush = new PointerBrush();
    for (let i = 0; i < 30; i++) brush.step(0.2, 0.2, DT, false);
    expect(brush.factor).toBe(0);
    expect(brush.displacing).toBe(false);
  });

  it("does not treat the first sample as movement", () => {
    let brush = new PointerBrush();
    expect(brush.step(0.9, -0.9, DT, false)).toBe(0);
  });

  it("ramps up with fast movement and keeps displacing while settling", () => {
    let brush = new PointerBrush();
    sweep(brush, 30);
    expect(brush.factor).toBeGreaterThan(0.5);
    expect(brush.displacing).toBe(true);

    for (let i = 0; i < 30; i++) brush.step(0.5, 0, DT, false);
    expect(brush.displacing).toBe(true);
    for (let i = 0; i < 120; i++) brush.step(0.5, 0, DT, false);
    expect(brush.factor).toBe(0);
    expect(brush.displacing).toBe(false);
  });

  it("is always off with reduced motion", () => {
    let brush = new PointerBrush();
    sweep(brush, 30, true);
    expect(brush.factor).toBe(0);
    expect(brush.displacing).toBe(false);
  });

  it("starts from rest after reset", () => {
    let brush = new PointerBrush();
    sweep(brush, 30);
    brush.reset();
    expect(brush.step(-0.5, 0, DT, false)).toBe(0);
  });
});
