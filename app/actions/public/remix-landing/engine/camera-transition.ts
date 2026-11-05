import { Vector3 } from "three";
import type { Preset } from "./types.ts";
import { clamp, lerp } from "../math.ts";

const DEFAULT_CAM_POS: [number, number, number] = [0, 30, 80];
const DEFAULT_CAM_TARGET: [number, number, number] = [0, 0, 0];

export function setDesiredCameraInto(
  presets: Preset[],
  morphValue: number,
  outPos: Vector3,
  outTarget: Vector3,
) {
  let maxIdx = presets.length - 1;
  let clamped = clamp(morphValue, 0, maxIdx);
  let fromIdx = Math.min(Math.floor(clamped), maxIdx);
  let toIdx = Math.min(fromIdx + 1, maxIdx);
  let blend = clamped - fromIdx;

  let fromPos = presets[fromIdx].cameraPosition ?? DEFAULT_CAM_POS;
  let fromTarget = presets[fromIdx].cameraTarget ?? DEFAULT_CAM_TARGET;
  let toPos = presets[toIdx].cameraPosition ?? DEFAULT_CAM_POS;
  let toTarget = presets[toIdx].cameraTarget ?? DEFAULT_CAM_TARGET;

  outTarget.set(
    lerp(fromTarget[0], toTarget[0], blend),
    lerp(fromTarget[1], toTarget[1], blend),
    lerp(fromTarget[2], toTarget[2], blend),
  );

  let cameraTransition = presets[toIdx].cameraTransition;
  if (cameraTransition?.startsWith("orbit")) {
    let fromX = fromPos[0] - fromTarget[0];
    let fromZ = fromPos[2] - fromTarget[2];
    let toX = toPos[0] - toTarget[0];
    let toZ = toPos[2] - toTarget[2];
    let fromYaw = Math.atan2(fromX, fromZ);
    let toYaw = Math.atan2(toX, toZ);
    let yawDelta = Math.atan2(
      Math.sin(toYaw - fromYaw),
      Math.cos(toYaw - fromYaw),
    );

    // Exactly opposite views have two equally short paths. The preset chooses
    // which side of the model the camera should travel around.
    if (Math.abs(Math.abs(yawDelta) - Math.PI) < 0.001) {
      yawDelta = cameraTransition === "orbit-left" ? Math.PI : -Math.PI;
    }

    let yaw = fromYaw + yawDelta * blend;
    let radius = lerp(Math.hypot(fromX, fromZ), Math.hypot(toX, toZ), blend);
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
