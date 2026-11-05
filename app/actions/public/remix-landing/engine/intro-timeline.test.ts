import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { IntroTimeline, PARTICLE_INTRO_DURATION_S } from "./intro-timeline.ts";

describe("IntroTimeline", () => {
  it("waits for the reveal before starting the intro", () => {
    let intro = new IntroTimeline();
    expect(intro.advance(10, false)).toBe(false);
    expect(intro.progress).toBe(0);
  });

  it("plays the intro from its start time and reports completion once", () => {
    let intro = new IntroTimeline();
    intro.startTime = 2;
    intro.advance(2 + PARTICLE_INTRO_DURATION_S / 2, false);
    expect(intro.progress).toBeCloseTo(0.5);

    expect(intro.advance(2 + PARTICLE_INTRO_DURATION_S * 1.5, false)).toBe(
      true,
    );
    expect(intro.finished).toBe(true);
    expect(intro.advance(100, false)).toBe(false);
    expect(intro.progress).toBe(1.5);
  });

  it("skips the intro with reduced motion and never replays it", () => {
    let intro = new IntroTimeline();
    intro.startTime = 0;
    intro.advance(0, true);
    expect(intro.progress).toBe(1.5);

    intro.advance(0.1, false);
    expect(intro.progress).toBe(1.5);
  });

  it("freezes the visual clock past the intro with reduced motion", () => {
    let intro = new IntroTimeline();
    expect(intro.visualTime(1, true)).toBe(PARTICLE_INTRO_DURATION_S);
    expect(intro.visualTime(9, true)).toBe(PARTICLE_INTRO_DURATION_S);
    expect(intro.visualTime(9, false)).toBe(9);
  });
});
