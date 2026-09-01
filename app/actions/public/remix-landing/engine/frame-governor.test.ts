import { expect } from "remix/assert";
import { it } from "remix/test";
import { nextRenderDeadline } from "./frame-governor.ts";

function renderedFramesPerSecond(refreshHz: number, idle: boolean): number {
  const tickMs = 1000 / refreshHz;
  let deadlineMs = 0;
  let rendered = 0;
  for (let tick = 0; tick < refreshHz; tick++) {
    const nextDeadline = nextRenderDeadline(
      (tick + 1) * tickMs,
      deadlineMs,
      idle,
    );
    if (nextDeadline !== null) {
      deadlineMs = nextDeadline;
      rendered++;
    }
  }
  return rendered;
}

it("renders the first frame", () => {
  expect(nextRenderDeadline(0, 0, false)).not.toBe(null);
  expect(nextRenderDeadline(0, 0, true)).not.toBe(null);
});

it("caps active rendering near 60fps across refresh rates", () => {
  expect(renderedFramesPerSecond(60, false)).toBe(60);
  expect(renderedFramesPerSecond(75, false)).toBe(60);
  expect(renderedFramesPerSecond(90, false)).toBe(60);
  expect(renderedFramesPerSecond(120, false)).toBe(60);
  expect(renderedFramesPerSecond(144, false)).toBe(60);
});

it("drops to ~30fps when idle", () => {
  expect(renderedFramesPerSecond(60, true)).toBe(30);
  expect(renderedFramesPerSecond(90, true)).toBe(30);
  expect(renderedFramesPerSecond(120, true)).toBe(30);
});

it("tolerates slightly early animation-frame timestamps", () => {
  expect(nextRenderDeadline(115.7, 116.667, false)).not.toBe(null);
});

it("does not catch up missed frames after a long pause", () => {
  const deadlineMs = nextRenderDeadline(100, 0, false)!;
  const resumedDeadlineMs = nextRenderDeadline(10_000, deadlineMs, false)!;
  expect(resumedDeadlineMs).toBeGreaterThan(10_000);
  expect(nextRenderDeadline(10_001, resumedDeadlineMs, false)).toBe(null);
});
