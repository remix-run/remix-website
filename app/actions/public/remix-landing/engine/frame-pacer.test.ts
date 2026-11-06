import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { IDLE_AFTER_MS } from "./frame-governor.ts";
import { FramePacer } from "./frame-pacer.ts";

function framesRenderedOverOneSecond(
  pacer: FramePacer,
  startMs: number,
  canIdle: boolean,
) {
  let rendered = 0;
  for (let tick = 1; tick <= 120; tick++) {
    if (pacer.shouldRender(startMs + (tick * 1000) / 120, 0, canIdle)) {
      rendered++;
    }
  }
  return rendered;
}

describe("FramePacer", () => {
  it("drops to the idle rate only after inactivity once idling is allowed", () => {
    let pacer = new FramePacer();
    pacer.markActivity(0);
    expect(framesRenderedOverOneSecond(pacer, IDLE_AFTER_MS, false)).toBe(60);
    expect(framesRenderedOverOneSecond(pacer, IDLE_AFTER_MS * 2, true)).toBe(
      30,
    );
  });

  it("treats activity and morph changes as a reason to stay active", () => {
    let pacer = new FramePacer();
    pacer.markActivity(IDLE_AFTER_MS * 2);
    expect(framesRenderedOverOneSecond(pacer, IDLE_AFTER_MS * 2, true)).toBe(
      60,
    );

    let morphing = new FramePacer();
    morphing.shouldRender(IDLE_AFTER_MS * 2, 1, true);
    expect(framesRenderedOverOneSecond(morphing, IDLE_AFTER_MS * 2, true)).toBe(
      60,
    );
  });

  it("skips static frames until their key changes or is invalidated", () => {
    let pacer = new FramePacer();
    expect(pacer.isUnchangedStatic("a")).toBe(false);
    expect(pacer.isUnchangedStatic("a")).toBe(true);
    expect(pacer.isUnchangedStatic("b")).toBe(false);

    pacer.invalidateStatic();
    expect(pacer.isUnchangedStatic("b")).toBe(false);
  });

  it("never skips animating frames", () => {
    let pacer = new FramePacer();
    expect(pacer.isUnchangedStatic(null)).toBe(false);
    expect(pacer.isUnchangedStatic(null)).toBe(false);
  });
});
