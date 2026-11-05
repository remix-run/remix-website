import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { nextKonamiIndex, shouldCaptureKonamiKey } from "./konami-code.ts";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "Enter",
];

describe("nextKonamiIndex", () => {
  it("completes after the full sequence", () => {
    let index = CODE.reduce(nextKonamiIndex, 0);
    expect(index).toBe(CODE.length);
  });

  it("restarts on a wrong key", () => {
    expect(nextKonamiIndex(4, "x")).toBe(0);
  });

  it("counts a wrong key that begins the code as the first step", () => {
    // A third ↑ is wrong at step two, but it restarts at step one.
    expect(nextKonamiIndex(2, "ArrowUp")).toBe(1);
  });
});

describe("shouldCaptureKonamiKey", () => {
  it("leaves a single arrow press to the page", () => {
    expect(shouldCaptureKonamiKey(0, "ArrowUp", false)).toBe(false);
  });

  it("captures from the second fresh ↑ onward", () => {
    expect(shouldCaptureKonamiKey(1, "ArrowUp", false)).toBe(true);
    expect(shouldCaptureKonamiKey(1, "ArrowUp", true)).toBe(false);
    expect(shouldCaptureKonamiKey(5, "Enter", true)).toBe(true);
  });
});
