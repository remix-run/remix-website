export const PARTICLE_INTRO_DURATION_S = 3.5;
/** Shader intro progress at which every particle has landed and settled. */
const INTRO_COMPLETE = 1.5;

/**
 * Tracks the particles' fall-in intro and the visual clock that drives the
 * shaders. Reduced motion freezes the clock just past the intro and skips it.
 */
export class IntroTimeline {
  /** Scene time (s) when the intro began, or null until the first reveal. */
  startTime: number | null = null;
  finished = false;
  /** Shader `uIntroProgress` from the latest `advance()`. */
  progress = 0;
  #frozenTime: number | null = null;

  /** Scene time to render; held still while reduced motion is on. */
  visualTime(time: number, reduceMotion: boolean): number {
    if (reduceMotion) {
      this.#frozenTime ??= Math.max(time, PARTICLE_INTRO_DURATION_S);
    } else {
      this.#frozenTime = null;
    }
    return this.#frozenTime ?? time;
  }

  /** Updates `progress`; returns true on the frame the intro completes. */
  advance(visualTime: number, reduceMotion: boolean): boolean {
    if (reduceMotion && this.startTime !== null) {
      // Once reduced motion has skipped the intro, do not replay it if the
      // preference changes while this component is mounted.
      this.finished = true;
    }
    let introTime =
      this.startTime === null ? 0 : Math.max(0, visualTime - this.startTime);
    this.progress =
      reduceMotion || this.finished
        ? INTRO_COMPLETE
        : Math.min(introTime / PARTICLE_INTRO_DURATION_S, INTRO_COMPLETE);
    if (!this.finished && this.progress >= INTRO_COMPLETE) {
      this.finished = true;
      return true;
    }
    return false;
  }
}
