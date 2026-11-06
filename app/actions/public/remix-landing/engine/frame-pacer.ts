import { IDLE_AFTER_MS, nextRenderDeadline } from "./frame-governor.ts";

/**
 * Decides which animation frames actually render: caps the frame rate
 * (lower once the scene has been idle), and skips redraws of a static scene
 * whose inputs have not changed.
 */
export class FramePacer {
  #lastActivityAt = 0;
  #lastMorphValue = NaN;
  #deadline = 0;
  #wasIdle = false;
  #lastStaticKey: string | null = null;

  /** Pointer, scroll, or intro activity keeps rendering at the active rate. */
  markActivity(now: number) {
    this.#lastActivityAt = now;
  }

  /** Frame-rate gate. Morph changes count as activity. */
  shouldRender(now: number, morphValue: number, canIdle: boolean): boolean {
    if (morphValue !== this.#lastMorphValue) {
      this.#lastMorphValue = morphValue;
      this.#lastActivityAt = now;
    }
    let idle = canIdle && now - this.#lastActivityAt >= IDLE_AFTER_MS;
    if (idle !== this.#wasIdle) {
      this.#wasIdle = idle;
      this.#deadline = 0;
    }
    let nextDeadline = nextRenderDeadline(now, this.#deadline, idle);
    if (nextDeadline === null) return false;
    this.#deadline = nextDeadline;
    return true;
  }

  /** Forces the next static frame to redraw (e.g. after a resize or texture upload). */
  invalidateStatic() {
    this.#lastStaticKey = null;
  }

  /**
   * Returns true when `staticKey` matches the last drawn static frame, so the
   * redraw can be skipped. Pass null while the scene is animating.
   */
  isUnchangedStatic(staticKey: string | null): boolean {
    if (staticKey !== null && staticKey === this.#lastStaticKey) return true;
    this.#lastStaticKey = staticKey;
    return false;
  }
}
