/**
 * Scrolls the page along a fixed curve, frame by frame: a `spring()`
 * iterator's positions, say, so the scroll keeps time with an animation on
 * the same spring. The reader can take the scroll back at any point with a
 * wheel, touch, or key.
 */
export function scrollAlongCurve(
  targetY: number,
  curve: number[],
  signal: AbortSignal,
) {
  let from = window.scrollY;
  let start = performance.now();
  let stop = new AbortController();
  let frame = 0;
  let cancel = () => {
    stop.abort();
    cancelAnimationFrame(frame);
  };
  for (let type of ["wheel", "touchstart", "keydown"]) {
    window.addEventListener(type, cancel, { once: true, signal: stop.signal });
  }
  signal.addEventListener("abort", cancel, { signal: stop.signal });

  let step = (now: number) => {
    // A frame's timestamp can precede `start`, so clamp at 0 as well: a
    // negative index would scroll to NaN, which jumps to the top of the page.
    let index = Math.max(
      0,
      Math.min(curve.length - 1, Math.round((now - start) / (1000 / 60))),
    );
    window.scrollTo(0, from + (targetY - from) * curve[index]);
    if (index < curve.length - 1) frame = requestAnimationFrame(step);
    else stop.abort();
  };
  frame = requestAnimationFrame(step);
}

/**
 * Glides an element's horizontal scroll to a target on a critically damped
 * spring (as quick as it can be without overshooting) that keeps its speed
 * when the target moves, so it can follow a target that keeps changing. A
 * native smooth scroll restarts from rest each time instead.
 */
export class ScrollGlide {
  #stiffness: number;
  #onStop: () => void;
  #glide:
    | {
        x: number;
        velocity: number;
        target: number;
        time: number;
        frame: number;
      }
    | undefined;

  /**
   * @param stiffness The spring's stiffness: (2π / settle time in seconds)².
   * @param onStop Called when the glide lands or is stopped.
   */
  constructor(stiffness: number, onStop: () => void) {
    this.#stiffness = stiffness;
    this.#onStop = onStop;
  }

  /** Starts gliding to the target, or moves the target of the glide under way. */
  to(element: HTMLElement, target: number) {
    if (this.#glide) {
      this.#glide.target = target;
      return;
    }
    let glide = {
      x: element.scrollLeft,
      velocity: 0,
      target,
      time: performance.now(),
      frame: 0,
    };
    this.#glide = glide;
    let step = (now: number) => {
      if (this.#glide !== glide) return;
      let elapsed = Math.min(0.05, (now - glide.time) / 1000);
      glide.time = now;
      let acceleration =
        this.#stiffness * (glide.target - glide.x) -
        2 * Math.sqrt(this.#stiffness) * glide.velocity;
      glide.velocity += acceleration * elapsed;
      glide.x += glide.velocity * elapsed;
      let landed =
        Math.abs(glide.target - glide.x) < 0.5 && Math.abs(glide.velocity) < 20;
      element.scrollLeft = landed ? glide.target : glide.x;
      if (landed) this.stop();
      else glide.frame = requestAnimationFrame(step);
    };
    glide.frame = requestAnimationFrame(step);
  }

  stop() {
    if (!this.#glide) return;
    cancelAnimationFrame(this.#glide.frame);
    this.#glide = undefined;
    this.#onStop();
  }
}
