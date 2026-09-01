/**
 * Frame pacing for the landing particle loop. rAF fires at native refresh
 * (120Hz on ProMotion); capping saves the entire GPU pipeline per skipped
 * tick, and an idle ambient scene needs even less.
 */
export const ACTIVE_MAX_FPS = 60;
export const IDLE_MAX_FPS = 30;

/** How long after the last scroll/pointer/morph activity we drop to idle fps. */
export const IDLE_AFTER_MS = 5000;

/**
 * Accept a frame at >= 85% of the target interval: loose enough to absorb
 * rAF timestamp jitter without dropping ticks, strict enough that a 120Hz
 * display can't slip an extra tick (75% would run idle at 40fps, not 30).
 */
const FRAME_ACCEPT_FRACTION = 0.85;

export function shouldRenderFrame(
  nowMs: number,
  lastRenderMs: number,
  idle: boolean,
): boolean {
  if (lastRenderMs === 0) return true;
  const intervalMs = 1000 / (idle ? IDLE_MAX_FPS : ACTIVE_MAX_FPS);
  return nowMs - lastRenderMs >= intervalMs * FRAME_ACCEPT_FRACTION;
}
