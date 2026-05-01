import { css, ref, addEventListeners, type Handle } from "remix/ui";
import { Matrix4, Vector3 } from "three";
import { ControlManager } from "../engine/controls";
import { Engine } from "../engine/engine";
import {
  projectLabelsInto,
  type ProjectedLabel,
} from "../engine/label-projection";
import { MouseSim } from "../engine/mouse-sim";
import { ParticleSystem } from "../engine/particles";
import { RestBaker } from "../engine/rest-baker";
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
  let restBaker: RestBaker | null = null;
  let mouseSim: MouseSim | null = null;
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
  const scratchViewProj = new Matrix4();
  const scratchCamRight = new Vector3();
  const scratchCamUp = new Vector3();
  let lastFrameNow = 0;
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
  let prevMouseNormX = 0;
  let prevMouseNormY = 0;
  let mouseVelPrimed = false;
  let mouseNdcSpeedSmoothed = 0;
  let mouseBrushSmoothed = 0;
  let smoothMouseOffsetX = 0;
  let smoothCarLane = 0;
  let prevCarLane = 0;
  let laneActivity = 0;

  const MOUSE_RANGE = 1;
  const MOUSE_LERP = 0.04;
  const CAR_LANE_LERP = 0.06;
  const ACTIVITY_DECAY = 0.97;
  const ACTIVITY_GAIN = 20.0;
  /**
   * Racetrack (no car): parallax uses the same base as other slides, multiplied
   * by RACETRACK_MOUSE_STRAFE_ATTENUATION (less lateral drift), then clamped to
   * ±(trackW × RACETRACK_MOUSE_STRAFE_OF_TRACKW) so it can never exceed road width.
   */
  const RACETRACK_MOUSE_STRAFE_ATTENUATION = 0.4;
  const RACETRACK_MOUSE_STRAFE_OF_TRACKW = 0.18;

  // Mouse sim: screen-space falloff (NDC) + camera right/up → tracks the pointer
  // through preset cameras. Peak offset @ ref repulsion:
  //   PEAK_DISP ≈ PUSH_GAIN × (STRENGTH_SCALE × REF_REPULSION).
  const MOUSE_SIM_STRENGTH_SCALE = 3900;
  const MOUSE_SIM_REPULSION_REF = 0.2;
  const MOUSE_SIM_PEAK_DISP = 17.0;
  const MOUSE_SIM_FOLLOW_TAU = 10;
  // Screen-space halo size at full velocity (NDC −1…1 spans). Effective radius scales
  // down when the cursor is steady so displaced particles can settle back.
  const MOUSE_SIM_NDC_RADIUS = 0.154;
  /** /s smoothing of measured NDC speed (higher = snappier). */
  const MOUSE_SIM_VEL_SMOOTH_TAU = 22;
  /** Below this smoothed speed (NDC/sec) the brush is essentially off — kills pointer jitter. */
  const MOUSE_SIM_VEL_GATE = 0.14;
  /** Smoothed speed at which radius/strength reach full strength. */
  const MOUSE_SIM_VEL_FULL = 5.5;
  /**
   * Smooth the applied brush toward the velocity-derived target (/s).
   * Decouples visible falloff/strength step from uneven frame deltas and removes stair-step jitter.
   */
  const MOUSE_SIM_BRUSH_SMOOTH_TAU = 14;
  const MOUSE_SIM_PUSH_GAIN =
    MOUSE_SIM_PEAK_DISP / (MOUSE_SIM_STRENGTH_SCALE * MOUSE_SIM_REPULSION_REF);

  function setMousePosition(clientX: number, clientY: number) {
    const vp = containerEl ?? canvasEl;
    if (vp) {
      const rect = vp.getBoundingClientRect();
      const rw = rect.width > 1e-4 ? rect.width : window.innerWidth;
      const rh = rect.height > 1e-4 ? rect.height : window.innerHeight;
      mouseNormX = ((clientX - rect.left) / rw) * 2 - 1;
      mouseNormY = ((clientY - rect.top) / rh) * 2 - 1;
    } else {
      mouseNormX = (clientX / window.innerWidth) * 2 - 1;
      mouseNormY = (clientY / window.innerHeight) * 2 - 1;
    }
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
    mouseSim?.dispose();
    restBaker?.dispose();
    appliedModelSlots.clear();
    engine?.dispose();
    particles = null;
    restBaker = null;
    mouseSim = null;
    engine = null;
    mouseVelPrimed = false;
    mouseNdcSpeedSmoothed = 0;
    mouseBrushSmoothed = 0;
  }

  handle.signal.addEventListener("abort", () => {
    disposeScene();
  });

  function syncModelTextures() {
    if (!restBaker || !currentProps) return;

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

      restBaker.setModelTexture(
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

      restBaker = new RestBaker(
        engine.renderer,
        currentProps.settings.particleCount,
      );
      restBaker.setCount(currentProps.settings.particleCount);

      particles = new ParticleSystem();
      particles.init(
        engine.scene,
        currentProps.settings.particleCount,
        currentProps.settings.pointSize,
      );
      // Bind the baker's MRT texture refs to the draw material once. Three
      // caches the references; subsequent bake() calls update the GL backing
      // in place.
      particles.setRestTextures(
        restBaker.getPosTexture(0),
        restBaker.getColTexture(0),
        restBaker.getPosTexture(1),
        restBaker.getColTexture(1),
      );
      syncModelTextures();

      mouseSim = new MouseSim(
        engine.renderer,
        currentProps.settings.particleCount,
      );
      mouseSim.setRestTextures(
        restBaker.getPosTexture(0),
        restBaker.getPosTexture(1),
      );
      mouseSim.setPushGain(MOUSE_SIM_PUSH_GAIN);
      mouseSim.setFollowTau(MOUSE_SIM_FOLLOW_TAU);
      // Bind the cleared-zero disp texture so the first compile + render see
      // a real sampler. step() in animate() updates this every frame.
      particles.setDispTexture(mouseSim.getDispTexture());

      startTime = performance.now() / 1000;
      setDesiredCameraInto(
        currentProps.presets,
        currentProps.morphValueRef.current,
        desiredCameraPos,
        desiredCameraTarget,
      );
      engine.camera.position.copy(desiredCameraPos);
      engine.controls.target.copy(desiredCameraTarget);
      // Pre-bake slot A using the starting preset so the very first render
      // samples populated rest textures. This also forces the baker's
      // RawShaderMaterial to compile here, hiding the link/upload cost from
      // the first animate() frame.
      const initialPresetData = getPresetRuntimeData(currentProps.presets);
      const initialIndex = Math.min(
        Math.max(0, Math.floor(currentProps.morphValueRef.current)),
        initialPresetData.presets.length - 1,
      );
      copyControlsInto(
        initialPresetData.controls[initialIndex],
        scratchControlsA,
      );
      restBaker.bake(
        0,
        initialPresetData.shaderInts[initialIndex],
        scratchControlsA,
        0,
      );
      // Compile the particle RawShaderMaterial up front so the first
      // `composer.render()` doesn't pay for the GLSL3 link/upload during
      // the intro frame. Three otherwise compiles materials lazily on first
      // draw, which can show up as a hitch on lower-end GPUs.
      engine.renderer.compile(engine.scene, engine.camera);
    } catch (error) {
      initFailed = true;
      disposeScene();
      currentProps.onError(error);
      return;
    }

    const animate = () => {
      if (!engine || !particles || !restBaker || !mouseSim || !currentProps) {
        return;
      }

      const now = performance.now();
      const time = now / 1000 - startTime;
      // Real-time delta for the mouse sim. First frame falls back to a 60fps
      // step; afterwards it tracks actual frame pacing. MouseSim.step() also
      // clamps internally to keep the explicit Euler integrator stable.
      const dtSeconds =
        lastFrameNow === 0 ? 1 / 60 : (now - lastFrameNow) / 1000;
      lastFrameNow = now;
      const settings = currentProps.settings;
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

      engine.updateSettings(settings);

      const screenScale = engine.getScreenScale();
      particles.setPointSize(settings.pointSize);
      particles.setHdrIntensity(settings.hdrIntensity * screenScale);
      const effectiveMouseNormX = reduceMotion ? 0 : mouseNormX;
      const effectiveMouseNormY = reduceMotion ? 0 : mouseNormY;

      let mouseBrushFactor = 0;
      const dtClamp = Math.max(dtSeconds, 1e-4);
      if (reduceMotion) {
        mouseVelPrimed = false;
        mouseNdcSpeedSmoothed = 0;
        mouseBrushSmoothed = 0;
      } else {
        if (!mouseVelPrimed) {
          prevMouseNormX = effectiveMouseNormX;
          prevMouseNormY = effectiveMouseNormY;
          mouseVelPrimed = true;
        } else {
          const speed = Math.hypot(
            (effectiveMouseNormX - prevMouseNormX) / dtClamp,
            (effectiveMouseNormY - prevMouseNormY) / dtClamp,
          );
          const kVel = 1 - Math.exp(-MOUSE_SIM_VEL_SMOOTH_TAU * dtClamp);
          mouseNdcSpeedSmoothed += (speed - mouseNdcSpeedSmoothed) * kVel;
        }
        prevMouseNormX = effectiveMouseNormX;
        prevMouseNormY = effectiveMouseNormY;
        const span = Math.max(MOUSE_SIM_VEL_FULL - MOUSE_SIM_VEL_GATE, 1e-4);
        const linear = clamp01(
          (mouseNdcSpeedSmoothed - MOUSE_SIM_VEL_GATE) / span,
        );
        const brushTarget = linear * linear * (3 - 2 * linear);
        const kBrush = 1 - Math.exp(-MOUSE_SIM_BRUSH_SMOOTH_TAU * dtClamp);
        mouseBrushSmoothed += (brushTarget - mouseBrushSmoothed) * kBrush;
        mouseBrushFactor = mouseBrushSmoothed;
      }

      particles.setColorMode(settings.colorMode);
      particles.setDof(settings.dofAmount, settings.dofFocus);
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

      // Hoisted from the vertex shader: when blending, t is constant across all
      // particles, so do the pow()/divide once per frame on the CPU instead of
      // per vertex on the GPU. When blend < 0.001 the shader takes the
      // early-exit branch and ignores uMorphT, so any value is safe.
      let morphT = 0;
      if (blend > 0.001) {
        const ease = settings.morphEase;
        const tk = Math.pow(blend, ease);
        morphT = tk / (tk + Math.pow(1 - blend, ease));
      }
      particles.setBlend(blend);
      particles.setMorphT(morphT);
      particles.setSeparation(separation);

      const overridesA = presets[fromIndex].systemOverrides;
      const overridesB = presets[toIndex].systemOverrides;
      const easedBlend = blend * blend * (3 - 2 * blend);
      const effectiveTrail =
        (1 - easedBlend) *
          (overridesA?.trailIntensity ?? settings.trailIntensity) +
        easedBlend * (overridesB?.trailIntensity ?? settings.trailIntensity);
      const effectiveRepulsion =
        (1 - easedBlend) *
          (overridesA?.cursorRepulsion ?? settings.cursorRepulsion) +
        easedBlend * (overridesB?.cursorRepulsion ?? settings.cursorRepulsion);

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
      // Racetrack (no car): scale/cap lateral camera follow from live track width;
      // × (1 − driveProximity) so Drive keeps uncapped parallax for steering context.
      const racetrackRoadLock =
        racetrackIndex >= 0
          ? clamp01(1 - racetrackDist) * (1 - driveProximity)
          : 0;
      if (!reduceMotion && driveProximity > 0) {
        smoothCarLane += (effectiveMouseNormX - smoothCarLane) * CAR_LANE_LERP;
      } else {
        smoothCarLane += (0 - smoothCarLane) * CAR_LANE_LERP;
      }

      const laneDelta = Math.abs(smoothCarLane - prevCarLane);
      laneActivity = Math.max(
        laneActivity * ACTIVITY_DECAY,
        clamp01(laneDelta * ACTIVITY_GAIN),
      );
      prevCarLane = smoothCarLane;

      // Car uniforms feed the baker (used only by the racetrackCar preset).
      const carLaneOffset = smoothCarLane * driveProximity;
      const carLaneActivity = laneActivity * driveProximity;
      const carPosY =
        driveIndex >= 0 ? presetData.driveCarPosY * driveProximity : 0;
      restBaker.setCarUniforms(carLaneOffset, carLaneActivity, carPosY);

      // Bake the active endpoint(s). Slot B is skipped when the draw shader
      // would ignore it (matches the `if (uBlend > 0.001)` gate in the VS).
      restBaker.bake(
        0,
        presetData.shaderInts[fromIndex],
        scratchControlsA,
        visualTime,
      );
      if (blend > 0.001) {
        restBaker.bake(
          1,
          presetData.shaderInts[toIndex],
          scratchControlsB,
          visualTime,
        );
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
        const parallaxUncapped = smoothMouseOffsetX * parallaxScale;
        let parallaxX = parallaxUncapped;
        if (racetrackIndex >= 0 && racetrackRoadLock > 0) {
          const trackW = presetData.controls[racetrackIndex][1] ?? 40;
          const strafeCap = trackW * RACETRACK_MOUSE_STRAFE_OF_TRACKW;
          const parallaxRacetrack = clamp(
            parallaxUncapped * RACETRACK_MOUSE_STRAFE_ATTENUATION,
            -strafeCap,
            strafeCap,
          );
          parallaxX = lerp(parallaxUncapped, parallaxRacetrack, racetrackRoadLock);
        }
        engine.camera.position.x += parallaxX;
      }

      // Run look-at once before reading view/proj so MouseSim matrices match
      // this frame's render (render() calls update() again later on).
      engine.controls.update();
      scratchViewProj.multiplyMatrices(
        engine.camera.projectionMatrix,
        engine.camera.matrixWorldInverse,
      );
      const ew = engine.camera.matrixWorld.elements;
      scratchCamRight.set(ew[0], ew[1], ew[2]).normalize();
      scratchCamUp.set(ew[4], ew[5], ew[6]).normalize();
      mouseSim.setViewProj(scratchViewProj);
      mouseSim.setCamBasis(scratchCamRight, scratchCamUp);
      mouseSim.setMouseNDC(effectiveMouseNormX, -effectiveMouseNormY);
      mouseSim.setBlend(blend);
      mouseSim.setMorphT(morphT);
      mouseSim.setMouseNdcRadius(MOUSE_SIM_NDC_RADIUS * mouseBrushFactor);
      mouseSim.setMouseStrength(
        reduceMotion
          ? 0
          : effectiveRepulsion * MOUSE_SIM_STRENGTH_SCALE * mouseBrushFactor,
      );
      mouseSim.step(dtSeconds);
      particles.setDispTexture(mouseSim.getDispTexture());

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

      engine.render(time);
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
