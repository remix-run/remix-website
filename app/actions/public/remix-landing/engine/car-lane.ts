import { clamp01 } from "../math.ts";

const CAR_LANE_LERP = 0.06;
const ACTIVITY_DECAY = 0.97;
const ACTIVITY_GAIN = 20.0;

/**
 * Steers the Drive preset's car toward the pointer. `activity` spikes while
 * the car changes lanes and decays once it holds a lane.
 */
export class CarLane {
  lane = 0;
  activity = 0;

  /** Advances one frame; the car drifts back to center when `steerX` is 0. */
  step(steerX: number) {
    let prevLane = this.lane;
    this.lane += (steerX - this.lane) * CAR_LANE_LERP;
    this.activity = Math.max(
      this.activity * ACTIVITY_DECAY,
      clamp01(Math.abs(this.lane - prevLane) * ACTIVITY_GAIN),
    );
  }
}
