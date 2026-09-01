import { expect } from "remix/assert";
import { it } from "remix/test";
import { shouldRenderFrame } from "./frame-governor.ts";

/** Count rendered frames over one second of rAF ticks at `refreshHz`. */
function renderedFramesPerSecond(refreshHz: number, idle: boolean): number {
  const tickMs = 1000 / refreshHz;
  let lastRenderMs = 0;
  let rendered = 0;
  for (let tick = 0; tick < refreshHz; tick++) {
    const nowMs = (tick + 1) * tickMs;
    if (shouldRenderFrame(nowMs, lastRenderMs, idle)) {
      lastRenderMs = nowMs;
      rendered++;
    }
  }
  return rendered;
}

it("renders the very first frame regardless of timing", () => {
  expect(shouldRenderFrame(0, 0, false)).toBe(true);
  expect(shouldRenderFrame(0, 0, true)).toBe(true);
});

it("locks a 120Hz display to ~60fps while active", () => {
  expect(renderedFramesPerSecond(120, false)).toBe(60);
});

it("renders every tick on a 60Hz display while active", () => {
  expect(renderedFramesPerSecond(60, false)).toBe(60);
});

it("drops to ~30fps when idle", () => {
  expect(renderedFramesPerSecond(60, true)).toBe(30);
  expect(renderedFramesPerSecond(120, true)).toBe(30);
});

it("tolerates rAF timestamp jitter without skipping extra ticks", () => {
  // 60Hz ticks arriving ~1ms early must still render (16.67ms target).
  expect(shouldRenderFrame(115.7, 100, false)).toBe(true);
});
