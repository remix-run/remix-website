import { css, ref, addEventListeners, type Handle } from "remix/component";
import * as THREE from "three";
import { ControlManager } from "../engine/controls";
import { Engine } from "../engine/engine";
import { projectLabels, type ProjectedLabel } from "../engine/label-projection";
import { ParticleSystem } from "../engine/particles";
import { getMorphBlend } from "../engine/morph";
import { createModelTexture } from "../engine/model-texture";
import type { ModelData } from "../engine/model-loader";
import type { Preset, ShaderId, SystemSettings } from "../engine/types";

// Must match the `1000ms` start delay on `.loading-screen-overlay` in `home.css`.
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

function getDesiredCamera(
  presets: Preset[],
  morphValue: number,
): { pos: THREE.Vector3; target: THREE.Vector3 } {
  const maxIdx = presets.length - 1;
  const clamped = Math.max(0, Math.min(maxIdx, morphValue));
  const fromIdx = Math.min(Math.floor(clamped), maxIdx);
  const toIdx = Math.min(fromIdx + 1, maxIdx);
  const blend = clamped - fromIdx;

  const fromPos = presets[fromIdx].cameraPosition ?? DEFAULT_CAM_POS;
  const fromTarget = presets[fromIdx].cameraTarget ?? DEFAULT_CAM_TARGET;
  const toPos = presets[toIdx].cameraPosition ?? DEFAULT_CAM_POS;
  const toTarget = presets[toIdx].cameraTarget ?? DEFAULT_CAM_TARGET;

  return {
    pos: new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...fromPos),
      new THREE.Vector3(...toPos),
      blend,
    ),
    target: new THREE.Vector3().lerpVectors(
      new THREE.Vector3(...fromTarget),
      new THREE.Vector3(...toTarget),
      blend,
    ),
  };
}

function padCtrl(arr: number[]): number[] {
  const out = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < Math.min(arr.length, 8); i++) out[i] = arr[i];
  return out;
}

function initialControls(preset: Preset): number[] {
  return preset.controls.map((control) => control.initial);
}

function getControlInitial(preset: Preset, id: string, fallback = 0): number {
  return (
    preset.controls.find((control) => control.id === id)?.initial ?? fallback
  );
}

export function ParticleCanvas(handle: Handle) {
  let containerEl: HTMLDivElement | undefined;
  let canvasEl: HTMLCanvasElement | undefined;
  let engine: Engine | null = null;
  let particles: ParticleSystem | null = null;
  const appliedModelSlots = new Set<number>();
  let frameId = 0;
  let startTime = 0;
  let previousNearest = -1;
  const labelControlMgr = new ControlManager();
  let currentProps:
    | {
        settings: SystemSettings;
        presets: Preset[];
        morphValue: number;
        modelData: (ModelData | undefined)[];
        labelsRef: { current: ProjectedLabel[] };
        labelOpacityRef: { current: number };
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

  addEventListeners(window, handle.signal, {
    mousemove: (event) => {
      mouseNormX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseNormY = (event.clientY / window.innerHeight) * 2 - 1;
    },
  });

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
    if (engine || !containerEl || !canvasEl || !currentProps) return;

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
    const initialCamera = getDesiredCamera(
      currentProps.presets,
      currentProps.morphValue,
    );
    engine.camera.position.copy(initialCamera.pos);
    engine.controls.target.copy(initialCamera.target);

    const animate = () => {
      if (!engine || !particles || !currentProps) return;

      const now = performance.now();
      const time = now / 1000 - startTime;
      const presets = currentProps.presets;
      const morphValue = currentProps.morphValue;

      engine.updateSettings(currentProps.settings);

      const screenScale = engine.getScreenScale();
      particles.setPointSize(currentProps.settings.pointSize);
      particles.setHdrIntensity(
        currentProps.settings.hdrIntensity * screenScale,
      );
      particles.setMousePos(mouseNormX, -mouseNormY);
      particles.setMorphEase(currentProps.settings.morphEase);
      particles.setColorMode(currentProps.settings.colorMode);
      particles.setDof(
        currentProps.settings.dofAmount,
        currentProps.settings.dofFocus,
      );
      const introTime = Math.max(0, time - PARTICLE_INTRO_DELAY_S);
      particles.setIntroProgress(Math.min(introTime / 3.5, 1.5));
      particles.setTime(time);

      const maxValue = presets.length - 1;
      const { fromIndex, toIndex, blend } = getMorphBlend(morphValue, maxValue);

      let ctrlA: number[];
      let ctrlB: number[];
      let separation: number;

      if (blend < 0.001) {
        ctrlA = initialControls(presets[fromIndex]);
        ctrlB = ctrlA;
        separation = presets[fromIndex].separation;
      } else {
        ctrlA = initialControls(presets[fromIndex]);
        ctrlB = initialControls(presets[toIndex]);
        const easedBlend = blend * blend * (3 - 2 * blend);
        separation =
          presets[fromIndex].separation * (1 - easedBlend) +
          presets[toIndex].separation * easedBlend;
      }

      const racetrackIndex = presets.findIndex(
        (preset) => preset.name === "Racetrack",
      );
      const racetrackDist =
        racetrackIndex >= 0 ? Math.abs(morphValue - racetrackIndex) : 0;
      const departingRacetrack = racetrackDist > 0.01 && racetrackDist < 1.0;

      if (departingRacetrack) {
        const surge = racetrackDist * racetrackDist * 32;
        if (fromIndex === racetrackIndex) ctrlA[7] = surge;
        if (toIndex === racetrackIndex) ctrlB[7] = surge;
      }

      particles.setPresets(
        resolveShaderInt(presets[fromIndex]),
        resolveShaderInt(presets[toIndex]),
        blend,
      );
      particles.setControls(padCtrl(ctrlA), padCtrl(ctrlB));
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
      engine.afterImagePass.uniforms.damp.value = Math.min(
        effectiveTrail + trailBoost,
        0.97,
      );

      const driveIndex = presets.findIndex((preset) => preset.name === "Drive");
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
        driveIndex >= 0
          ? Math.max(0, 1 - Math.abs(morphValue - driveIndex))
          : 0;
      if (driveProximity > 0) {
        smoothCarLane += (mouseNormX - smoothCarLane) * CAR_LANE_LERP;
      } else {
        smoothCarLane += (0 - smoothCarLane) * CAR_LANE_LERP;
      }

      particles.setCarLaneOffset(smoothCarLane * driveProximity);

      const laneDelta = Math.abs(smoothCarLane - prevCarLane);
      laneActivity = Math.max(
        laneActivity * ACTIVITY_DECAY,
        Math.min(laneDelta * ACTIVITY_GAIN, 1.0),
      );
      prevCarLane = smoothCarLane;
      particles.setCarLaneActivity(laneActivity * driveProximity);

      if (driveIndex >= 0) {
        const drivePreset = presets[driveIndex];
        particles.setCarPosY(
          getControlInitial(drivePreset, "_carPosY", 0) * driveProximity,
        );
      }

      engine.controls.enabled = driveProximity < 0.5;

      const desiredCamera = getDesiredCamera(presets, morphValue);
      engine.camera.position.lerp(desiredCamera.pos, CAM_LERP_SPEED);
      engine.controls.target.lerp(desiredCamera.target, CAM_LERP_SPEED);

      const parallaxScale = 1 - driveProximity;
      smoothMouseOffsetX +=
        (mouseNormX * MOUSE_RANGE - smoothMouseOffsetX) * MOUSE_LERP;
      engine.camera.position.x += smoothMouseOffsetX * parallaxScale;

      const nearest = Math.round(Math.max(0, Math.min(maxValue, morphValue)));
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
        const activeCtrls =
          blend < 0.001
            ? labelControlMgr.getControlValues(nearestPreset)
            : initialControls(nearestPreset);

        currentProps.labelsRef.current = projectLabels(
          nearestPreset,
          labelControlMgr,
          activeCtrls,
          time,
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
        currentProps.labelsRef.current = [];
        currentProps.labelOpacityRef.current = 0;
      }

      engine.render();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
  }

  return (props: {
    settings: SystemSettings;
    presets: Preset[];
    morphValue: number;
    modelData: (ModelData | undefined)[];
    labelsRef: { current: ProjectedLabel[] };
    labelOpacityRef: { current: number };
  }) => {
    currentProps = props;

    if (engine) {
      syncModelTextures();
    }

    if (!engine) {
      handle.queueTask(() => {
        maybeInit();
      });
    }

    return (
      <div
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
