import { css, ref, addEventListeners, type Handle } from "remix/ui";
import { Vector3 } from "three";
import { ControlManager } from "../engine/controls";
import { Engine } from "../engine/engine";
import {
  projectLabelsInto,
  type ProjectedLabel,
} from "../engine/label-projection";
import { ParticleSystem } from "../engine/particles";
import { getMorphBlend, type MorphBlend } from "../engine/morph";
import { createModelTexture } from "../engine/model-texture";
import type { ModelData } from "../engine/model-loader";
import type { Preset, ShaderId, SystemSettings } from "../engine/types";
import { clamp, clamp01, lerp } from "../utils/math";
import { reducedMotion } from "../utils/reduced-motion";

// Must match `LOADING_SCREEN_MIN_MS` in `landing-enhancements.tsx`.
const PARTICLE_INTRO_DELAY_S = 1;
const DEFAULT_CAM_POS: [number, number, number] = [0, 30, 80];
const DEFAULT_CAM_TARGET: [number, number, number] = [0, 0, 0];
const CAM_LERP_SPEED = 0.025;

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

function resolveShaderInt(preset: Preset): number {
  return SHADER_ID_TO_INT[preset.shaderId];
}

const shellStyles = css({
  position: "fixed",
  inset: "0",
  zIndex: "5",
  pointerEvents: "none",
});

const canvasStyles = css({
  display: "block",
  width: "100%",
  height: "100%",
});

type PresetRuntimeData = {
  presets: Preset[];
  controls: number[][];
  shaderInts: number[];
  racetrackIndex: number;
  driveIndex: number;
  driveCarPosY: number;
};

function setDesiredCameraInto(
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

  outPos.set(
    lerp(fromPos[0], toPos[0], blend),
    lerp(fromPos[1], toPos[1], blend),
    lerp(fromPos[2], toPos[2], blend),
  );
  outTarget.set(
    lerp(fromTarget[0], toTarget[0], blend),
    lerp(fromTarget[1], toTarget[1], blend),
    lerp(fromTarget[2], toTarget[2], blend),
  );
}

function copyControlsInto(source: number[], target: number[]) {
  for (let i = 0; i < 8; i++) {
    target[i] = source[i] ?? 0;
  }
}

function copyManagedControlsInto(
  preset: Preset,
  controlMgr: ControlManager,
  target: number[],
) {
  for (let i = 0; i < 8; i++) {
    const control = preset.controls[i];
    target[i] = control
      ? (controlMgr.controls.get(control.id)?.value ?? control.initial)
      : 0;
  }
}

function buildInitialControls(preset: Preset): number[] {
  const controls = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < Math.min(preset.controls.length, 8); i++) {
    controls[i] = preset.controls[i].initial;
  }
  return controls;
}

function getControlInitial(preset: Preset, id: string, fallback = 0): number {
  return (
    preset.controls.find((control) => control.id === id)?.initial ?? fallback
  );
}

function buildPresetRuntimeData(presets: Preset[]): PresetRuntimeData {
  const driveIndex = presets.findIndex((preset) => preset.name === "Drive");
  return {
    presets,
    controls: presets.map(buildInitialControls),
    shaderInts: presets.map(resolveShaderInt),
    racetrackIndex: presets.findIndex((preset) => preset.name === "Racetrack"),
    driveIndex,
    driveCarPosY:
      driveIndex >= 0
        ? getControlInitial(presets[driveIndex], "_carPosY", 0)
        : 0,
  };
}

export function ParticleCanvas(handle: Handle) {
  let containerEl: HTMLDivElement | undefined;
  let canvasEl: HTMLCanvasElement | undefined;
  let engine: Engine | null = null;
  let particles: ParticleSystem | null = null;
  const appliedModelSlots = new Set<number>();
  let frameId = 0;
  let startTime = 0;
  let frozenTime: number | null = null;
  let previousNearest = -1;
  let hasReportedReady = false;
  let initFailed = false;
  const labelControlMgr = new ControlManager();
  const desiredCameraPos = new Vector3();
  const desiredCameraTarget = new Vector3();
  const scratchControlsA = [0, 0, 0, 0, 0, 0, 0, 0];
  const scratchControlsB = [0, 0, 0, 0, 0, 0, 0, 0];
  const scratchLabelControls = [0, 0, 0, 0, 0, 0, 0, 0];
  const morphBlend: MorphBlend = { fromIndex: 0, toIndex: 0, blend: 0 };
  let presetRuntimeData: PresetRuntimeData | null = null;
  let currentProps:
    | {
        settings: SystemSettings;
        presets: Preset[];
        morphValueRef: { current: number };
        modelData: (ModelData | undefined)[];
        labelsRef: { current: ProjectedLabel[] };
        labelOpacityRef: { current: number };
        onReady: () => void;
        onError: (error: unknown) => void;
      }
    | undefined;

  let mouseNormX = 0;
  let mouseNormY = 0;
  let smoothMouseOffsetX = 0;
  let smoothCarLane = 0;
  let prevCarLane = 0;
  let laneActivity = 0;

  const MOUSE_RANGE = 1;
  const MOUSE_LERP = 0.04;
  const CAR_LANE_LERP = 0.06;
  const ACTIVITY_DECAY = 0.97;
  const ACTIVITY_GAIN = 20.0;

  function setMousePosition(clientX: number, clientY: number) {
    mouseNormX = (clientX / window.innerWidth) * 2 - 1;
    mouseNormY = (clientY / window.innerHeight) * 2 - 1;
  }

  addEventListeners(window, handle.signal, {
    pointermove: (event) => {
      if (event.pointerType !== "mouse") return;
      setMousePosition(event.clientX, event.clientY);
    },
    mousemove: (event) => {
      if (window.PointerEvent) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
      }

      setMousePosition(event.clientX, event.clientY);
    },
  });

  function getPresetRuntimeData(presets: Preset[]) {
    if (presetRuntimeData?.presets === presets) return presetRuntimeData;
    presetRuntimeData = buildPresetRuntimeData(presets);
    return presetRuntimeData;
  }

  function disposeScene() {
    cancelAnimationFrame(frameId);
    if (particles && engine) {
      particles.dispose(engine.scene);
    }
    appliedModelSlots.clear();
    engine?.dispose();
    particles = null;
    engine = null;
  }

  handle.signal.addEventListener("abort", () => {
    disposeScene();
  });

  function syncModelTextures() {
    if (!particles || !currentProps) return;

    for (const preset of currentProps.presets) {
      if (
        preset.modelUrl == null ||
        preset.modelSlot == null ||
        appliedModelSlots.has(preset.modelSlot)
      )
        continue;

      const model =
        currentProps.modelData[currentProps.presets.indexOf(preset)];
      if (!model) continue;

      particles.setModelTexture(
        preset.modelSlot,
        createModelTexture(model),
        model.positions.length / 3,
      );
      appliedModelSlots.add(preset.modelSlot);
    }
  }

  function maybeInit() {
    if (initFailed || engine || !containerEl || !canvasEl || !currentProps) {
      return;
    }

    try {
      engine = new Engine();
      engine.init(canvasEl, containerEl, currentProps.settings);

      particles = new ParticleSystem();
      particles.init(
        engine.scene,
        currentProps.settings.particleCount,
        currentProps.settings.pointSize,
      );
      syncModelTextures();

      startTime = performance.now() / 1000;
      setDesiredCameraInto(
        currentProps.presets,
        currentProps.morphValueRef.current,
        desiredCameraPos,
        desiredCameraTarget,
      );
      engine.camera.position.copy(desiredCameraPos);
      engine.controls.target.copy(desiredCameraTarget);
    } catch (error) {
      initFailed = true;
      disposeScene();
      currentProps.onError(error);
      return;
    }

    const animate = () => {
      if (!engine || !particles || !currentProps) return;

      const now = performance.now();
      const time = now / 1000 - startTime;
      const presets = currentProps.presets;
      const presetData = getPresetRuntimeData(presets);
      const morphValue = currentProps.morphValueRef.current;
      const reduceMotion = reducedMotion.current;

      if (reduceMotion) {
        frozenTime ??= Math.max(time, PARTICLE_INTRO_DELAY_S + 3.5);
      } else {
        frozenTime = null;
      }
      const visualTime = frozenTime ?? time;

      engine.updateSettings(currentProps.settings);

      const screenScale = engine.getScreenScale();
      particles.setPointSize(currentProps.settings.pointSize);
      particles.setHdrIntensity(
        currentProps.settings.hdrIntensity * screenScale,
      );
      const effectiveMouseNormX = reduceMotion ? 0 : mouseNormX;
      const effectiveMouseNormY = reduceMotion ? 0 : mouseNormY;
      particles.setMousePos(effectiveMouseNormX, -effectiveMouseNormY);
      particles.setMorphEase(currentProps.settings.morphEase);
      particles.setColorMode(currentProps.settings.colorMode);
      particles.setDof(
        currentProps.settings.dofAmount,
        currentProps.settings.dofFocus,
      );
      const introTime = Math.max(0, visualTime - PARTICLE_INTRO_DELAY_S);
      particles.setIntroProgress(
        reduceMotion ? 1.5 : Math.min(introTime / 3.5, 1.5),
      );
      particles.setTime(visualTime);

      const maxValue = presets.length - 1;
      getMorphBlend(morphValue, maxValue, morphBlend);
      const { fromIndex, toIndex, blend } = morphBlend;

      let separation: number;

      if (blend < 0.001) {
        copyControlsInto(presetData.controls[fromIndex], scratchControlsA);
        copyControlsInto(presetData.controls[fromIndex], scratchControlsB);
        separation = presets[fromIndex].separation;
      } else {
        copyControlsInto(presetData.controls[fromIndex], scratchControlsA);
        copyControlsInto(presetData.controls[toIndex], scratchControlsB);
        const easedBlend = blend * blend * (3 - 2 * blend);
        separation =
          presets[fromIndex].separation * (1 - easedBlend) +
          presets[toIndex].separation * easedBlend;
      }

      const racetrackIndex = presetData.racetrackIndex;
      const racetrackDist =
        racetrackIndex >= 0 ? Math.abs(morphValue - racetrackIndex) : 0;
      const departingRacetrack =
        !reduceMotion && racetrackDist > 0.01 && racetrackDist < 1.0;

      if (departingRacetrack) {
        const surge = racetrackDist * racetrackDist * 32;
        if (blend < 0.001) {
          if (fromIndex === racetrackIndex || toIndex === racetrackIndex) {
            scratchControlsA[7] = surge;
            scratchControlsB[7] = surge;
          }
        } else {
          if (fromIndex === racetrackIndex) scratchControlsA[7] = surge;
          if (toIndex === racetrackIndex) scratchControlsB[7] = surge;
        }
      }

      particles.setPresets(
        presetData.shaderInts[fromIndex],
        presetData.shaderInts[toIndex],
        blend,
      );
      particles.setControls(scratchControlsA, scratchControlsB);
      particles.setSeparation(separation);

      const overridesA = presets[fromIndex].systemOverrides;
      const overridesB = presets[toIndex].systemOverrides;
      const easedBlend = blend * blend * (3 - 2 * blend);
      const effectiveTrail =
        (1 - easedBlend) *
          (overridesA?.trailIntensity ?? currentProps.settings.trailIntensity) +
        easedBlend *
          (overridesB?.trailIntensity ?? currentProps.settings.trailIntensity);
      const effectiveRepulsion =
        (1 - easedBlend) *
          (overridesA?.cursorRepulsion ??
            currentProps.settings.cursorRepulsion) +
        easedBlend *
          (overridesB?.cursorRepulsion ??
            currentProps.settings.cursorRepulsion);

      particles.setCursorRepulsion(effectiveRepulsion);

      const trailBoost = departingRacetrack
        ? Math.sin(racetrackDist * Math.PI) * 0.75
        : 0;
      engine.afterImagePass.uniforms.damp.value = reduceMotion
        ? 0
        : Math.min(effectiveTrail + trailBoost, 0.97);

      const driveIndex = presetData.driveIndex;
      const racetrackFogDist =
        racetrackIndex >= 0 ? Math.abs(morphValue - racetrackIndex) : Infinity;
      const driveFogDist =
        driveIndex >= 0 ? Math.abs(morphValue - driveIndex) : Infinity;
      const fogProximity = Math.max(
        0,
        1 - Math.min(racetrackFogDist, driveFogDist),
      );
      particles.setFog(fogProximity, 10, 180);

      const driveProximity =
        driveIndex >= 0 ? clamp01(1 - Math.abs(morphValue - driveIndex)) : 0;
      if (!reduceMotion && driveProximity > 0) {
        smoothCarLane += (effectiveMouseNormX - smoothCarLane) * CAR_LANE_LERP;
      } else {
        smoothCarLane += (0 - smoothCarLane) * CAR_LANE_LERP;
      }

      particles.setCarLaneOffset(smoothCarLane * driveProximity);

      const laneDelta = Math.abs(smoothCarLane - prevCarLane);
      laneActivity = Math.max(
        laneActivity * ACTIVITY_DECAY,
        clamp01(laneDelta * ACTIVITY_GAIN),
      );
      prevCarLane = smoothCarLane;
      particles.setCarLaneActivity(laneActivity * driveProximity);

      if (driveIndex >= 0) {
        particles.setCarPosY(presetData.driveCarPosY * driveProximity);
      }

      engine.controls.enabled = !reduceMotion && driveProximity < 0.5;

      setDesiredCameraInto(
        presets,
        morphValue,
        desiredCameraPos,
        desiredCameraTarget,
      );
      if (reduceMotion) {
        engine.camera.position.copy(desiredCameraPos);
        engine.controls.target.copy(desiredCameraTarget);
      } else {
        engine.camera.position.lerp(desiredCameraPos, CAM_LERP_SPEED);
        engine.controls.target.lerp(desiredCameraTarget, CAM_LERP_SPEED);
      }

      const parallaxScale = 1 - driveProximity;
      smoothMouseOffsetX +=
        (effectiveMouseNormX * MOUSE_RANGE - smoothMouseOffsetX) * MOUSE_LERP;
      if (!reduceMotion) {
        engine.camera.position.x += smoothMouseOffsetX * parallaxScale;
      }

      const nearest = Math.round(clamp(morphValue, 0, maxValue));
      if (nearest !== previousNearest) {
        previousNearest = nearest;
        labelControlMgr.loadPreset(presets[nearest]);
      }

      const nearestPreset = presets[nearest];
      if (
        nearestPreset?.labels &&
        nearestPreset.labels.length > 0 &&
        containerEl
      ) {
        let activeCtrls = presetData.controls[nearest];
        if (blend < 0.001) {
          copyManagedControlsInto(
            nearestPreset,
            labelControlMgr,
            scratchLabelControls,
          );
          activeCtrls = scratchLabelControls;
        }

        projectLabelsInto(
          currentProps.labelsRef.current,
          nearestPreset,
          labelControlMgr,
          activeCtrls,
          visualTime,
          engine.camera,
          containerEl.clientWidth,
          containerEl.clientHeight,
        );

        const distFromNearest = Math.abs(morphValue - nearest);
        currentProps.labelOpacityRef.current = Math.max(
          0,
          1 - distFromNearest * 4,
        );
      } else {
        currentProps.labelsRef.current.length = 0;
        currentProps.labelOpacityRef.current = 0;
      }

      engine.render();
      if (!hasReportedReady) {
        hasReportedReady = true;
        currentProps.onReady();
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
  }

  return (props: {
    settings: SystemSettings;
    presets: Preset[];
    morphValueRef: { current: number };
    modelData: (ModelData | undefined)[];
    labelsRef: { current: ProjectedLabel[] };
    labelOpacityRef: { current: number };
    onReady: () => void;
    onError: (error: unknown) => void;
  }) => {
    currentProps = props;

    if (engine) {
      syncModelTextures();
    }

    if (!engine && !initFailed) {
      handle.queueTask(() => {
        maybeInit();
      });
    }

    return (
      <div
        aria-hidden="true"
        mix={[
          shellStyles,
          ref((node) => {
            containerEl = node;
          }),
        ]}
      >
        <canvas
          mix={[
            canvasStyles,
            ref((node) => {
              canvasEl = node;
            }),
          ]}
        />
      </div>
    );
  };
}
