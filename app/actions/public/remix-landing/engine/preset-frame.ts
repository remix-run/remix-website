import { clamp, clamp01, lerp } from "../math.ts";
import { getMorphBlend } from "./morph.ts";
import { presets } from "./presets.ts";
import type { Preset, ShaderId, SystemSettings } from "./types.ts";

/**
 * Maps each `ShaderId` to the integer expected by the `computePreset` switch
 * in the particle shader. This is the single source of truth that couples the
 * JS side to the GLSL side; keep it in lockstep with `particles.ts`.
 */
const SHADER_ID_TO_INT: Record<ShaderId, number> = {
  racetrack: 0,
  racecar: 1,
  runner: 2,
  remixLogo: 3,
  racetrackCar: 4,
};

/**
 * Racetrack (no car): parallax uses the same base as other slides, multiplied
 * by RACETRACK_MOUSE_STRAFE_ATTENUATION (less lateral drift), then clamped to
 * ±(trackW × RACETRACK_MOUSE_STRAFE_OF_TRACKW) so it can never exceed road width.
 */
const RACETRACK_MOUSE_STRAFE_ATTENUATION = 0.4;
const RACETRACK_MOUSE_STRAFE_OF_TRACKW = 0.18;

const PRESET_CONTROLS = presets.map(buildInitialControls);
const PRESET_SHADER_INTS = presets.map(
  (preset) => SHADER_ID_TO_INT[preset.shaderId],
);
const RACETRACK_INDEX = presets.findIndex(
  (preset) => preset.name === "Racetrack",
);
const DRIVE_INDEX = presets.findIndex((preset) => preset.name === "Drive");
const DRIVE_CAR_POS_Y =
  DRIVE_INDEX >= 0
    ? (presets[DRIVE_INDEX].controls.find(
        (control) => control.id === "_carPosY",
      )?.initial ?? 0)
    : 0;

/**
 * Everything the renderer derives from the scroll morph value in one frame:
 * which presets to bake and blend, plus the per-preset effects (trail, fog,
 * cursor repulsion, car placement) eased across the transition.
 */
export type PresetFrame = {
  fromIndex: number;
  toIndex: number;
  blend: number;
  /** Eased blend handed to the draw shader; `0` when `blend` is negligible. */
  morphT: number;
  shaderA: number;
  shaderB: number;
  controlsA: number[];
  controlsB: number[];
  separation: number;
  afterImageDamp: number;
  repulsion: number;
  fogProximity: number;
  driveProximity: number;
  /** How strongly racetrack parallax is capped to the road width (0…1). */
  racetrackRoadLock: number;
  carPosY: number;
};

export function createPresetFrame(): PresetFrame {
  return {
    fromIndex: 0,
    toIndex: 0,
    blend: 0,
    morphT: 0,
    shaderA: 0,
    shaderB: 0,
    controlsA: [0, 0, 0, 0, 0, 0, 0, 0],
    controlsB: [0, 0, 0, 0, 0, 0, 0, 0],
    separation: 0,
    afterImageDamp: 0,
    repulsion: 0,
    fogProximity: 0,
    driveProximity: 0,
    racetrackRoadLock: 0,
    carPosY: 0,
  };
}

/** Fills `frame` in place so the render loop does not allocate per frame. */
export function computePresetFrame(
  morphValue: number,
  reduceMotion: boolean,
  settings: SystemSettings,
  frame: PresetFrame = createPresetFrame(),
): PresetFrame {
  getMorphBlend(morphValue, presets.length - 1, frame);
  let { fromIndex, toIndex, blend } = frame;
  let easedBlend = blend * blend * (3 - 2 * blend);

  copyControlsInto(PRESET_CONTROLS[fromIndex], frame.controlsA);
  if (blend < 0.001) {
    copyControlsInto(PRESET_CONTROLS[fromIndex], frame.controlsB);
    frame.separation = presets[fromIndex].separation;
  } else {
    copyControlsInto(PRESET_CONTROLS[toIndex], frame.controlsB);
    frame.separation =
      presets[fromIndex].separation * (1 - easedBlend) +
      presets[toIndex].separation * easedBlend;
  }
  frame.shaderA = PRESET_SHADER_INTS[fromIndex];
  frame.shaderB = PRESET_SHADER_INTS[toIndex];

  let racetrackDist =
    RACETRACK_INDEX >= 0 ? Math.abs(morphValue - RACETRACK_INDEX) : 0;
  let departingRacetrack =
    !reduceMotion && racetrackDist > 0.01 && racetrackDist < 1.0;
  if (departingRacetrack) applyRacetrackSurge(frame, racetrackDist);

  // Hoisted from the vertex shader: when blending, t is constant across all
  // particles, so do the pow()/divide once per frame on the CPU instead of
  // per vertex on the GPU. When blend < 0.001 the shader takes the
  // early-exit branch and ignores uMorphT, so any value is safe.
  frame.morphT = 0;
  if (blend > 0.001) {
    let ease = settings.morphEase;
    let tk = Math.pow(blend, ease);
    frame.morphT = tk / (tk + Math.pow(1 - blend, ease));
  }

  let overridesA = presets[fromIndex].systemOverrides;
  let overridesB = presets[toIndex].systemOverrides;
  let effectiveTrail =
    (1 - easedBlend) * (overridesA?.trailIntensity ?? settings.trailIntensity) +
    easedBlend * (overridesB?.trailIntensity ?? settings.trailIntensity);
  frame.repulsion =
    (1 - easedBlend) *
      (overridesA?.cursorRepulsion ?? settings.cursorRepulsion) +
    easedBlend * (overridesB?.cursorRepulsion ?? settings.cursorRepulsion);
  let trailBoost = departingRacetrack
    ? Math.sin(racetrackDist * Math.PI) * 0.75
    : 0;
  frame.afterImageDamp = reduceMotion
    ? 0
    : Math.min(effectiveTrail + trailBoost, 0.97);

  let racetrackFogDist =
    RACETRACK_INDEX >= 0 ? Math.abs(morphValue - RACETRACK_INDEX) : Infinity;
  let driveFogDist =
    DRIVE_INDEX >= 0 ? Math.abs(morphValue - DRIVE_INDEX) : Infinity;
  frame.fogProximity = Math.max(
    0,
    1 - Math.min(racetrackFogDist, driveFogDist),
  );

  let driveProximity =
    DRIVE_INDEX >= 0 ? clamp01(1 - Math.abs(morphValue - DRIVE_INDEX)) : 0;
  frame.driveProximity = driveProximity;
  // Racetrack (no car): scale/cap lateral camera follow from live track width;
  // × (1 − driveProximity) so Drive keeps uncapped parallax for steering context.
  frame.racetrackRoadLock =
    RACETRACK_INDEX >= 0
      ? clamp01(1 - racetrackDist) * (1 - driveProximity)
      : 0;
  frame.carPosY = DRIVE_INDEX >= 0 ? DRIVE_CAR_POS_Y * driveProximity : 0;

  return frame;
}

/**
 * Caps lateral camera parallax near the racetrack so the camera never drifts
 * past the road edge; elsewhere the parallax passes through unchanged.
 */
export function capRacetrackParallax(
  parallaxX: number,
  racetrackRoadLock: number,
): number {
  if (RACETRACK_INDEX < 0 || racetrackRoadLock <= 0) return parallaxX;
  let trackW = PRESET_CONTROLS[RACETRACK_INDEX][1] ?? 40;
  let strafeCap = trackW * RACETRACK_MOUSE_STRAFE_OF_TRACKW;
  let parallaxRacetrack = clamp(
    parallaxX * RACETRACK_MOUSE_STRAFE_ATTENUATION,
    -strafeCap,
    strafeCap,
  );
  return lerp(parallaxX, parallaxRacetrack, racetrackRoadLock);
}

/** Initial controls and shader for baking a preset before the first frame. */
export function initialPresetBake(morphValue: number, controls: number[]) {
  let index = Math.min(Math.max(0, Math.floor(morphValue)), presets.length - 1);
  copyControlsInto(PRESET_CONTROLS[index], controls);
  return PRESET_SHADER_INTS[index];
}

// While departing the racetrack, its spare control slot 7 carries a surge
// that grows with distance from the racetrack preset.
function applyRacetrackSurge(frame: PresetFrame, racetrackDist: number) {
  let surge = racetrackDist * racetrackDist * 32;
  let { fromIndex, toIndex } = frame;
  if (frame.blend < 0.001) {
    if (fromIndex === RACETRACK_INDEX || toIndex === RACETRACK_INDEX) {
      frame.controlsA[7] = surge;
      frame.controlsB[7] = surge;
    }
  } else {
    if (fromIndex === RACETRACK_INDEX) frame.controlsA[7] = surge;
    if (toIndex === RACETRACK_INDEX) frame.controlsB[7] = surge;
  }
}

function copyControlsInto(source: number[], target: number[]) {
  for (let i = 0; i < 8; i++) {
    target[i] = source[i] ?? 0;
  }
}

function buildInitialControls(preset: Preset): number[] {
  let controls = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < Math.min(preset.controls.length, 8); i++) {
    controls[i] = preset.controls[i].initial;
  }
  return controls;
}
