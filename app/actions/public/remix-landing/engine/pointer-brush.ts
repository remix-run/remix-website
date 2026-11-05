import { clamp01 } from "../math.ts";

/** /s smoothing of measured NDC speed (higher = snappier). */
const VEL_SMOOTH_TAU = 22;
/** Below this smoothed speed (NDC/sec) the brush is essentially off — kills pointer jitter. */
const VEL_GATE = 0.14;
/** Smoothed speed at which radius/strength reach full strength. */
const VEL_FULL = 5.5;
/**
 * Smooth the applied brush toward the velocity-derived target (/s).
 * Decouples visible falloff/strength step from uneven frame deltas and removes stair-step jitter.
 */
const BRUSH_SMOOTH_TAU = 14;
/** Seconds the displacement sim keeps running after the brush turns off. */
const SETTLE_S = 1.0;

/**
 * Turns pointer movement into a 0…1 brush strength for the mouse sim. A
 * steady cursor fades the brush out so displaced particles can settle back,
 * and the sim keeps stepping for `SETTLE_S` afterwards to finish relaxing.
 */
export class PointerBrush {
  /** Brush strength from the latest `step()`. */
  factor = 0;
  #primed = false;
  #prevX = 0;
  #prevY = 0;
  #speedSmoothed = 0;
  #brushSmoothed = 0;
  #settleS = SETTLE_S;

  /** True while particles may still be displaced and the sim must step. */
  get displacing() {
    return this.#settleS < SETTLE_S;
  }

  /** Forgets velocity history so the next movement starts from rest. */
  reset() {
    this.#primed = false;
    this.#speedSmoothed = 0;
    this.#brushSmoothed = 0;
  }

  step(x: number, y: number, dtSeconds: number, reduceMotion: boolean) {
    this.factor = 0;
    if (reduceMotion) {
      this.reset();
    } else {
      let dt = Math.max(dtSeconds, 1e-4);
      if (!this.#primed) {
        this.#primed = true;
      } else {
        let speed = Math.hypot((x - this.#prevX) / dt, (y - this.#prevY) / dt);
        let kVel = 1 - Math.exp(-VEL_SMOOTH_TAU * dt);
        this.#speedSmoothed += (speed - this.#speedSmoothed) * kVel;
      }
      this.#prevX = x;
      this.#prevY = y;
      let span = Math.max(VEL_FULL - VEL_GATE, 1e-4);
      let linear = clamp01((this.#speedSmoothed - VEL_GATE) / span);
      let brushTarget = linear * linear * (3 - 2 * linear);
      let kBrush = 1 - Math.exp(-BRUSH_SMOOTH_TAU * dt);
      this.#brushSmoothed += (brushTarget - this.#brushSmoothed) * kBrush;
      if (this.#brushSmoothed < 1e-3) this.#brushSmoothed = 0;
      this.factor = this.#brushSmoothed;
    }

    this.#settleS =
      this.factor > 0 ? 0 : Math.min(this.#settleS + dtSeconds, SETTLE_S);
    return this.factor;
  }
}
