export const ACTIVE_MAX_FPS = 60;
export const IDLE_MAX_FPS = 30;
export const IDLE_AFTER_MS = 5000;

const FRAME_TIME_TOLERANCE = 0.15;

export function nextRenderDeadline(
  nowMs: number,
  deadlineMs: number,
  idle: boolean,
): number | null {
  const intervalMs = 1000 / (idle ? IDLE_MAX_FPS : ACTIVE_MAX_FPS);
  if (deadlineMs === 0) return nowMs + intervalMs;
  if (nowMs < deadlineMs - intervalMs * FRAME_TIME_TOLERANCE) return null;

  const elapsedIntervals = Math.max(
    1,
    Math.floor((nowMs - deadlineMs) / intervalMs) + 1,
  );
  return deadlineMs + elapsedIntervals * intervalMs;
}
