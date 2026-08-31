import { Vector3 } from "three";
import type { Preset } from "./types.ts";
import { clamp, lerp } from "../utils/math.ts";

const DEFAULT_CAM_POS: [number, number, number] = [0, 30, 80];
const DEFAULT_CAM_TARGET: [number, number, number] = [0, 0, 0];

export function setDesiredCameraInto(
  presets: Preset[],
  morphValue: number,
  outPos: Vector3,
  outTarget: Vector3,
) {
  const maxIdx = presets.length - 1;
  const clamped = clamp(morphValue, 0, maxIdx);
  const fromIdx = Math.min(Math.floor(clamped), maxIdx);
  const toIdx = Math.min(fromIdx + 1, maxIdx);
  const blend = clamped - fromIdx;

  const fromPos = presets[fromIdx].cameraPosition ?? DEFAULT_CAM_POS;
  const fromTarget = presets[fromIdx].cameraTarget ?? DEFAULT_CAM_TARGET;
  const toPos = presets[toIdx].cameraPosition ?? DEFAULT_CAM_POS;
  const toTarget = presets[toIdx].cameraTarget ?? DEFAULT_CAM_TARGET;

  outTarget.set(
    lerp(fromTarget[0], toTarget[0], blend),
    lerp(fromTarget[1], toTarget[1], blend),
    lerp(fromTarget[2], toTarget[2], blend),
  );

  const cameraTransition = presets[toIdx].cameraTransition;
  if (cameraTransition?.startsWith("orbit")) {
    const fromX = fromPos[0] - fromTarget[0];
    const fromZ = fromPos[2] - fromTarget[2];
    const toX = toPos[0] - toTarget[0];
    const toZ = toPos[2] - toTarget[2];
    const fromYaw = Math.atan2(fromX, fromZ);
    const toYaw = Math.atan2(toX, toZ);
    let yawDelta = Math.atan2(
      Math.sin(toYaw - fromYaw),
      Math.cos(toYaw - fromYaw),
    );

    // Exactly opposite views have two equally short paths. The preset chooses
    // which side of the model the camera should travel around.
    if (Math.abs(Math.abs(yawDelta) - Math.PI) < 0.001) {
      yawDelta = cameraTransition === "orbit-left" ? Math.PI : -Math.PI;
    }

    const yaw = fromYaw + yawDelta * blend;
    const radius = lerp(Math.hypot(fromX, fromZ), Math.hypot(toX, toZ), blend);
    outPos.set(
      outTarget.x + Math.sin(yaw) * radius,
      outTarget.y +
        lerp(fromPos[1] - fromTarget[1], toPos[1] - toTarget[1], blend),
      outTarget.z + Math.cos(yaw) * radius,
    );
    return;
  }

  outPos.set(
    lerp(fromPos[0], toPos[0], blend),
    lerp(fromPos[1], toPos[1], blend),
    lerp(fromPos[2], toPos[2], blend),
  );
}
