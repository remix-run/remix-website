import {
  Color,
  HalfFloatType,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { BackgroundPass } from "./background-pass.ts";
import type { SystemSettings } from "./types.ts";

function screenScale(width: number): number {
  const ref = 1440;
  return Math.min(width / ref, 1);
}

const MAX_PIXEL_RATIO = 1.5;
const BLOOM_RESOLUTION_SCALE = 0.5;
const LIVE_RESIZE_INTERVAL_MS = 1000 / 30;
const RESIZE_SETTLE_MS = 100;

class HalfResolutionBloomPass extends UnrealBloomPass {
  override setSize(width: number, height: number) {
    super.setSize(
      Math.max(1, Math.round(width * BLOOM_RESOLUTION_SCALE)),
      Math.max(1, Math.round(height * BLOOM_RESOLUTION_SCALE)),
    );
  }
}

// Stand-in for `three/addons/controls/OrbitControls`. We only need the
// look-at target and an enabled flag; the real addon pulled in pointer/touch/
// wheel gesture handlers and damping logic that the landing never used.
class CameraTargetControls {
  target = new Vector3();
  enabled = true;

  constructor(private camera: PerspectiveCamera) {}

  update() {
    this.camera.lookAt(this.target);
  }

  dispose() {}
}

export class Engine {
  renderer!: WebGLRenderer;
  scene!: Scene;
  camera!: PerspectiveCamera;
  controls!: CameraTargetControls;
  composer!: EffectComposer;
  afterImagePass!: AfterimagePass;
  bloomPass!: UnrealBloomPass;
  backgroundPass!: BackgroundPass;

  private resizeObserver: ResizeObserver | null = null;
  private container: HTMLElement | null = null;
  private resizeRequestedAt: number | null = null;
  private lastResizeAt = -Infinity;
  private liveResize = false;
  private containerWidth = 0;
  private containerHeight = 0;
  private lastAppliedSettings: SystemSettings | null = null;
  private lastAppliedWidth = -1;
  private clearColor = new Color();

  init(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    settings: SystemSettings,
  ) {
    this.scene = new Scene();

    this.camera = new PerspectiveCamera(
      settings.cameraFov,
      container.clientWidth / container.clientHeight,
      0.1,
      2000,
    );
    this.camera.position.set(0, 30, 80);

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      // No pass uses depth or stencil.
      depth: false,
      stencil: false,
    });
    // Float MRTs require this extension; otherwise use the static fallback.
    if (!this.renderer.extensions.has("EXT_color_buffer_float")) {
      throw new Error(
        "EXT_color_buffer_float is not supported; skipping particle scene",
      );
    }
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO),
    );
    this.clearColor.set(settings.backgroundColor);
    this.renderer.setClearColor(this.clearColor);

    this.controls = new CameraTargetControls(this.camera);

    // Preserve Three's HalfFloat color target without depth/stencil buffers.
    const composerTarget = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    this.composer = new EffectComposer(this.renderer, composerTarget);

    // Render the gradient before particles without clearing the shared buffer.
    this.backgroundPass = new BackgroundPass();
    this.backgroundPass.setSize(container.clientWidth, container.clientHeight);
    this.composer.addPass(this.backgroundPass);

    const renderPass = new RenderPass(this.scene, this.camera);
    renderPass.clear = false;
    this.composer.addPass(renderPass);

    this.afterImagePass = new AfterimagePass(settings.trailIntensity);
    this.composer.addPass(this.afterImagePass);

    this.containerWidth = container.clientWidth;
    const s = screenScale(this.containerWidth);
    const bloomSize = new Vector2(
      container.clientWidth,
      container.clientHeight,
    );
    this.bloomPass = new HalfResolutionBloomPass(
      bloomSize,
      settings.bloomStrength * s,
      0.4,
      settings.bloomThreshold,
    );
    this.composer.addPass(this.bloomPass);

    this.container = container;
    this.liveResize = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    this.applyResize(container.clientWidth, container.clientHeight);
    // setSize clears the canvas, so resize targets immediately before a frame.
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeRequestedAt = performance.now();
    });
    this.resizeObserver.observe(container);
  }

  resizeIfNeeded(nowMs: number): boolean {
    if (!this.container || this.resizeRequestedAt === null) return false;

    if (this.liveResize) {
      if (nowMs - this.lastResizeAt < LIVE_RESIZE_INTERVAL_MS) return false;
    } else if (nowMs - this.resizeRequestedAt < RESIZE_SETTLE_MS) {
      return false;
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width <= 0 || height <= 0) return false;

    this.resizeRequestedAt = null;
    if (width === this.containerWidth && height === this.containerHeight) {
      return false;
    }

    this.applyResize(width, height);
    this.lastResizeAt = nowMs;
    return true;
  }

  private applyResize(width: number, height: number) {
    this.containerWidth = width;
    this.containerHeight = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.backgroundPass.setSize(width, height);
  }

  getScreenScale(): number {
    return screenScale(this.containerWidth);
  }

  updateSettings(settings: SystemSettings) {
    // Called every frame from the animate loop. Most frames see the same
    // settings reference and the same container width, so guard the body to
    // skip a per-frame Color allocation, a `setClearColor` round-trip and a
    // few uniform writes. The afterimage `damp` uniform is intentionally not
    // touched here: the animate loop overrides it every frame with a value
    // that blends in trail boost and reduce-motion, so any value written here
    // would be immediately clobbered.
    if (
      settings === this.lastAppliedSettings &&
      this.containerWidth === this.lastAppliedWidth
    ) {
      return;
    }
    this.lastAppliedSettings = settings;
    this.lastAppliedWidth = this.containerWidth;

    const s = screenScale(this.containerWidth);
    this.clearColor.set(settings.backgroundColor);
    this.renderer.setClearColor(this.clearColor);
    this.bloomPass.strength = settings.bloomStrength * s;
    this.bloomPass.threshold = settings.bloomThreshold;

    if (this.camera.fov !== settings.cameraFov) {
      this.camera.fov = settings.cameraFov;
      this.camera.updateProjectionMatrix();
    }
  }

  render(time: number) {
    this.controls.update();
    this.backgroundPass.setTime(time);
    this.composer.render();
  }

  dispose() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.container = null;
    this.resizeRequestedAt = null;
    this.lastResizeAt = -Infinity;
    this.liveResize = false;
    this.controls?.dispose();
    this.renderer?.dispose();
    this.composer?.dispose();
    this.backgroundPass?.dispose();
  }
}
