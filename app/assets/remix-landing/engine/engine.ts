import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { BackgroundPass } from "./background-pass";
import type { SystemSettings } from "./types";

function screenScale(width: number): number {
  const ref = 1440;
  return Math.min(width / ref, 1);
}

export class Engine {
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  controls!: OrbitControls;
  composer!: EffectComposer;
  afterImagePass!: AfterimagePass;
  bloomPass!: UnrealBloomPass;
  backgroundPass!: BackgroundPass;

  private resizeObserver: ResizeObserver | null = null;
  private containerWidth = 1440;
  private startTime = 0;

  init(canvas: HTMLCanvasElement, container: HTMLElement, settings: SystemSettings) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      settings.cameraFov,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 30, 80);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setClearColor(new THREE.Color(settings.backgroundColor));

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableRotate = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 500;

    this.composer = new EffectComposer(this.renderer);

    // Background pass draws the mesh gradient into the composer's read
    // buffer first. RenderPass then runs with `clear = false` so particles
    // composite on top of the gradient instead of wiping it to black.
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
    const bloomSize = new THREE.Vector2(container.clientWidth, container.clientHeight);
    this.bloomPass = new UnrealBloomPass(bloomSize, settings.bloomStrength * s, 0.4, settings.bloomThreshold);
    this.composer.addPass(this.bloomPass);

    this.startTime = performance.now() / 1000;

    this.resizeObserver = new ResizeObserver(() => this.handleResize(container));
    this.resizeObserver.observe(container);
  }

  private handleResize(container: HTMLElement) {
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.containerWidth = w;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.backgroundPass.setSize(w, h);
  }

  getScreenScale(): number {
    return screenScale(this.containerWidth);
  }

  updateSettings(settings: SystemSettings) {
    const s = screenScale(this.containerWidth);
    this.renderer.setClearColor(new THREE.Color(settings.backgroundColor));
    this.afterImagePass.uniforms['damp'].value = settings.trailIntensity;
    this.bloomPass.strength = settings.bloomStrength * s;
    this.bloomPass.threshold = settings.bloomThreshold;

    if (this.camera.fov !== settings.cameraFov) {
      this.camera.fov = settings.cameraFov;
      this.camera.updateProjectionMatrix();
    }
  }

  render() {
    this.controls.update();
    this.backgroundPass.setTime(performance.now() / 1000 - this.startTime);
    this.composer.render();
  }

  dispose() {
    this.resizeObserver?.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.composer.dispose();
    this.backgroundPass.dispose();
  }
}
