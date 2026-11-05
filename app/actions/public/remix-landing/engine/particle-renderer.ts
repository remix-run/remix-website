import { Matrix4, Vector3 } from "three";
import { reducedMotion } from "../reduced-motion.ts";
import { setDesiredCameraInto } from "./camera-transition.ts";
import { CarLane } from "./car-lane.ts";
import { Engine } from "./engine.ts";
import { FramePacer } from "./frame-pacer.ts";
import { IntroTimeline } from "./intro-timeline.ts";
import type { ModelData } from "./model-loader.ts";
import { createModelTexture } from "./model-texture.ts";
import { MouseSim } from "./mouse-sim.ts";
import { ParticleSystem } from "./particles.ts";
import { PausableClock } from "./pausable-clock.ts";
import { PointerBrush } from "./pointer-brush.ts";
import {
  capRacetrackParallax,
  computePresetFrame,
  createPresetFrame,
  copyInitialPresetInto,
  type PresetFrame,
} from "./preset-frame.ts";
import { presets } from "./presets.ts";
import { RestBaker } from "./rest-baker.ts";
import { DEFAULT_SETTINGS, type SystemSettings } from "./types.ts";

const BRAND_MODE_SETTINGS: SystemSettings = {
  ...DEFAULT_SETTINGS,
  colorMode: 2,
};
const CAM_LERP_SPEED = 0.025;
const MOUSE_RANGE = 1;
const MOUSE_LERP = 0.04;

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
const MOUSE_SIM_PUSH_GAIN =
  MOUSE_SIM_PEAK_DISP / (MOUSE_SIM_STRENGTH_SCALE * MOUSE_SIM_REPULSION_REF);

/** Live inputs read every frame (the canvas component's props satisfy this). */
export type ParticleFrameInput = {
  brandGradientMode: boolean;
  morphValueRef: { current: number };
  interactionPausedRef: { current: boolean };
};

/** Pointer position in viewport NDC (−1…1, y down). */
export type PointerPosition = { x: number; y: number };

type ParticleScene = {
  engine: Engine;
  particles: ParticleSystem;
  restBaker: RestBaker;
  mouseSim: MouseSim;
};

/**
 * Owns the WebGL particle scene and draws one frame at a time. The canvas
 * component drives the animation-frame loop and feeds in props and pointer
 * position; everything that persists between frames lives here.
 */
export class ParticleRenderer {
  #container: HTMLElement;
  #scene: ParticleScene;
  #appliedModelSlots = new Set<number>();
  #startTime: number;
  #lastFrameNow = 0;
  #interactionWasPaused = false;
  #smoothMouseOffsetX = 0;
  #pacer = new FramePacer();
  #intro = new IntroTimeline();
  #rotationClock = new PausableClock();
  #brush = new PointerBrush();
  #carLane = new CarLane();
  #presetFrame = createPresetFrame();
  #desiredCameraPos = new Vector3();
  #desiredCameraTarget = new Vector3();
  #scratchViewProj = new Matrix4();
  #scratchCamRight = new Vector3();
  #scratchCamUp = new Vector3();

  /** Builds and pre-warms the scene; throws (after cleaning up) if WebGL setup fails. */
  constructor(options: {
    canvas: HTMLCanvasElement;
    container: HTMLElement;
    input: ParticleFrameInput;
    modelData: (ModelData | undefined)[];
  }) {
    this.#container = options.container;
    this.#scene = createParticleScene({
      ...options,
      appliedModelSlots: this.#appliedModelSlots,
    });
    this.#startTime = performance.now() / 1000;
    this.#pacer.markActivity(performance.now());
  }

  markActivity(now: number) {
    this.#pacer.markActivity(now);
  }

  /** Starts the particle fall-in once the loading screen has revealed the canvas. */
  startIntro() {
    this.#intro.startTime = performance.now() / 1000 - this.#startTime;
  }

  /** Uploads any newly loaded preset models to the rest-pose baker. */
  syncModelTextures(modelData: (ModelData | undefined)[]) {
    if (
      applyModelTextures(
        this.#scene.restBaker,
        modelData,
        this.#appliedModelSlots,
      )
    ) {
      this.#pacer.invalidateStatic();
    }
  }

  /** Draws a frame unless pacing skips it; returns whether it rendered. */
  frame(
    now: number,
    input: ParticleFrameInput,
    pointer: PointerPosition,
  ): boolean {
    let { engine, particles } = this.#scene;
    let morphValue = input.morphValueRef.current;
    let reduceMotion = reducedMotion.current;

    if (!this.#pacer.shouldRender(now, morphValue, this.#intro.finished)) {
      return false;
    }
    // Resize after the pacing gate so clearing targets is followed by a draw.
    if (engine.resizeIfNeeded(now)) this.#pacer.invalidateStatic();
    let staticKey = this.#staticFrameKey(
      morphValue,
      input.brandGradientMode,
      reduceMotion,
    );
    if (this.#pacer.isUnchangedStatic(staticKey)) return false;

    let time = now / 1000 - this.#startTime;
    // Real-time delta for the mouse sim. First frame falls back to a 60fps
    // step; afterwards it tracks actual frame pacing. MouseSim.step() also
    // clamps internally to keep the explicit Euler integrator stable.
    let dtSeconds =
      this.#lastFrameNow === 0 ? 1 / 60 : (now - this.#lastFrameNow) / 1000;
    this.#lastFrameNow = now;
    let settings = input.brandGradientMode
      ? BRAND_MODE_SETTINGS
      : DEFAULT_SETTINGS;
    let visualTime = this.#intro.visualTime(time, reduceMotion);
    let interactionPaused = input.interactionPausedRef.current;
    let rotationTime = this.#rotationClock.read(visualTime, interactionPaused);

    if (interactionPaused !== this.#interactionWasPaused) {
      this.#interactionWasPaused = interactionPaused;
      this.#brush.reset();
    }

    engine.updateSettings(settings);
    particles.setPointSize(settings.pointSize);
    particles.setHdrIntensity(settings.hdrIntensity * engine.getScreenScale());
    let pointerX = reduceMotion ? 0 : pointer.x;
    let pointerY = reduceMotion ? 0 : pointer.y;
    this.#brush.step(pointerX, pointerY, dtSeconds, reduceMotion);

    particles.setColorMode(settings.colorMode);
    particles.setDof(settings.dofAmount, settings.dofFocus);
    if (this.#intro.advance(visualTime, reduceMotion)) {
      this.#pacer.markActivity(now);
    }
    particles.setIntroProgress(this.#intro.progress);
    particles.setTime(visualTime);

    let frame = computePresetFrame(
      morphValue,
      reduceMotion,
      settings,
      this.#presetFrame,
    );
    particles.setBlend(frame.blend);
    particles.setMorphT(frame.morphT);
    particles.setSeparation(frame.separation);
    engine.afterImagePass.uniforms.damp.value = frame.afterImageDamp;
    engine.afterImagePass.enabled = frame.afterImageDamp > 0.001;
    particles.setFog(frame.fogProximity, 10, 180);

    this.#bakeRestPoses(frame, pointerX, visualTime, rotationTime);
    this.#moveCamera(morphValue, frame, pointerX, reduceMotion);
    this.#stepMouseSim(frame, pointerX, pointerY, dtSeconds, reduceMotion);

    engine.render(visualTime);
    return true;
  }

  dispose() {
    disposeParticleScene(this.#scene);
    this.#appliedModelSlots.clear();
  }

  /**
   * A settled reduced-motion scene only changes with its inputs, so frames
   * with an unchanged key can skip drawing. Null while anything animates.
   */
  #staticFrameKey(
    morphValue: number,
    brandGradientMode: boolean,
    reduceMotion: boolean,
  ): string | null {
    if (!reduceMotion || !this.#intro.finished || this.#brush.displacing) {
      return null;
    }
    let { clientWidth, clientHeight } = this.#container;
    return `${morphValue}|${brandGradientMode}|${clientWidth}x${clientHeight}`;
  }

  /** Bakes the active endpoint(s); slot B only while the draw shader blends. */
  #bakeRestPoses(
    frame: PresetFrame,
    pointerX: number,
    visualTime: number,
    rotationTime: number,
  ) {
    let { restBaker } = this.#scene;
    let { driveProximity } = frame;
    this.#carLane.step(driveProximity > 0 ? pointerX : 0);
    // Car uniforms feed the baker (used only by the racetrackCar preset).
    restBaker.setCarUniforms(
      this.#carLane.lane * driveProximity,
      this.#carLane.activity * driveProximity,
      frame.carPosY,
    );

    // Matches the `if (uBlend > 0.001)` gate in the draw vertex shader.
    restBaker.bake(0, frame.shaderA, frame.controlsA, visualTime, rotationTime);
    if (frame.blend > 0.001) {
      restBaker.bake(
        1,
        frame.shaderB,
        frame.controlsB,
        visualTime,
        rotationTime,
      );
    }
  }

  #moveCamera(
    morphValue: number,
    frame: PresetFrame,
    pointerX: number,
    reduceMotion: boolean,
  ) {
    let { engine } = this.#scene;
    setDesiredCameraInto(
      presets,
      morphValue,
      this.#desiredCameraPos,
      this.#desiredCameraTarget,
    );
    if (reduceMotion) {
      engine.camera.position.copy(this.#desiredCameraPos);
      engine.controls.target.copy(this.#desiredCameraTarget);
    } else {
      engine.camera.position.lerp(this.#desiredCameraPos, CAM_LERP_SPEED);
      engine.controls.target.lerp(this.#desiredCameraTarget, CAM_LERP_SPEED);
    }

    this.#smoothMouseOffsetX +=
      (pointerX * MOUSE_RANGE - this.#smoothMouseOffsetX) * MOUSE_LERP;
    if (!reduceMotion) {
      engine.camera.position.x += capRacetrackParallax(
        this.#smoothMouseOffsetX * (1 - frame.driveProximity),
        frame.racetrackRoadLock,
      );
    }

    // Run look-at once before reading view/proj so MouseSim matrices match
    // this frame's render (render() calls update() again later on).
    engine.controls.update();
  }

  #stepMouseSim(
    frame: PresetFrame,
    pointerX: number,
    pointerY: number,
    dtSeconds: number,
    reduceMotion: boolean,
  ) {
    let { engine, particles, mouseSim } = this.#scene;
    let displacing = this.#brush.displacing;
    if (displacing) {
      let brushFactor = this.#brush.factor;
      this.#scratchViewProj.multiplyMatrices(
        engine.camera.projectionMatrix,
        engine.camera.matrixWorldInverse,
      );
      let ew = engine.camera.matrixWorld.elements;
      this.#scratchCamRight.set(ew[0], ew[1], ew[2]).normalize();
      this.#scratchCamUp.set(ew[4], ew[5], ew[6]).normalize();
      mouseSim.setViewProj(this.#scratchViewProj);
      mouseSim.setCamBasis(this.#scratchCamRight, this.#scratchCamUp);
      mouseSim.setMouseNDC(pointerX, -pointerY);
      mouseSim.setBlend(frame.blend);
      mouseSim.setMorphT(frame.morphT);
      mouseSim.setMouseNdcRadius(MOUSE_SIM_NDC_RADIUS * brushFactor);
      mouseSim.setMouseStrength(
        reduceMotion
          ? 0
          : frame.repulsion * MOUSE_SIM_STRENGTH_SCALE * brushFactor,
      );
      mouseSim.step(dtSeconds);
      particles.setDispTexture(mouseSim.getDispTexture());
    }
    particles.setDisplacementEnabled(displacing);
  }
}

/**
 * Creates the engine, rest-pose baker, draw system, and mouse sim, then
 * pre-bakes and compiles so the first animated frame doesn't hitch. Disposes
 * whatever it built if any step throws.
 */
function createParticleScene(options: {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  input: ParticleFrameInput;
  modelData: (ModelData | undefined)[];
  appliedModelSlots: Set<number>;
}): ParticleScene {
  let { input } = options;
  let settings = input.brandGradientMode
    ? BRAND_MODE_SETTINGS
    : DEFAULT_SETTINGS;
  let engine = new Engine();
  let scene: Partial<ParticleScene> = { engine };
  try {
    engine.init(options.canvas, options.container, settings);

    let particleCount = adaptiveParticleCount(settings.particleCount);
    let restBaker = (scene.restBaker = new RestBaker(
      engine.renderer,
      particleCount,
    ));
    restBaker.setCount(particleCount);

    let particles = (scene.particles = new ParticleSystem());
    particles.init(
      engine.scene,
      particleCount,
      settings.pointSize,
      engine.renderer.getPixelRatio(),
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
    applyModelTextures(restBaker, options.modelData, options.appliedModelSlots);

    let mouseSim = (scene.mouseSim = new MouseSim(
      engine.renderer,
      particleCount,
    ));
    mouseSim.setRestTextures(
      restBaker.getPosTexture(0),
      restBaker.getPosTexture(1),
    );
    mouseSim.setPushGain(MOUSE_SIM_PUSH_GAIN);
    mouseSim.setFollowTau(MOUSE_SIM_FOLLOW_TAU);
    // Bind the cleared-zero disp texture so the first compile + render see
    // a real sampler. step() in frame() updates this every frame.
    particles.setDispTexture(mouseSim.getDispTexture());

    let morphValue = input.morphValueRef.current;
    let cameraPos = new Vector3();
    let cameraTarget = new Vector3();
    setDesiredCameraInto(presets, morphValue, cameraPos, cameraTarget);
    engine.camera.position.copy(cameraPos);
    engine.controls.target.copy(cameraTarget);
    // Pre-bake slot A using the starting preset so the very first render
    // samples populated rest textures. This also forces the baker's
    // RawShaderMaterial to compile here, hiding the link/upload cost from
    // the first frame().
    let controls = [0, 0, 0, 0, 0, 0, 0, 0];
    let shader = copyInitialPresetInto(morphValue, controls);
    restBaker.bake(0, shader, controls, 0, 0);
    // Compile the particle RawShaderMaterial up front so the first
    // `composer.render()` doesn't pay for the GLSL3 link/upload during
    // the intro frame. Three otherwise compiles materials lazily on first
    // draw, which can show up as a hitch on lower-end GPUs.
    engine.renderer.compile(engine.scene, engine.camera);

    return { engine, particles, restBaker, mouseSim };
  } catch (error) {
    disposeParticleScene(scene);
    throw error;
  }
}

function disposeParticleScene({
  engine,
  particles,
  restBaker,
  mouseSim,
}: Partial<ParticleScene>) {
  if (particles && engine) particles.dispose(engine.scene);
  mouseSim?.dispose();
  restBaker?.dispose();
  engine?.dispose();
}

/** Uploads not-yet-applied preset models; returns whether any were added. */
function applyModelTextures(
  restBaker: RestBaker,
  modelData: (ModelData | undefined)[],
  appliedModelSlots: Set<number>,
): boolean {
  let applied = false;
  for (let [index, preset] of presets.entries()) {
    if (
      preset.modelUrl == null ||
      preset.modelSlot == null ||
      appliedModelSlots.has(preset.modelSlot)
    )
      continue;

    let model = modelData[index];
    if (!model) continue;

    restBaker.setModelTexture(
      preset.modelSlot,
      createModelTexture(model),
      model.positions.length / 3,
    );
    appliedModelSlots.add(preset.modelSlot);
    applied = true;
  }
  return applied;
}

function adaptiveParticleCount(base: number): number {
  let nav = navigator as Navigator & { deviceMemory?: number };
  let lowEnd =
    window.matchMedia("(pointer: coarse)").matches ||
    (nav.hardwareConcurrency || 8) <= 4 ||
    (nav.deviceMemory ?? 8) <= 4;
  return lowEnd ? Math.round(base / 2) : base;
}
