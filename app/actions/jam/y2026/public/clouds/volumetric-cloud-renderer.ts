import {
  Camera,
  Color,
  DataTexture,
  GLSL3,
  LinearFilter,
  MathUtils,
  Mesh,
  NearestFilter,
  NoBlending,
  PerspectiveCamera,
  PlaneGeometry,
  RedFormat,
  RepeatWrapping,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGL3DRenderTarget,
  WebGLRenderer,
  WebGLRenderTarget,
  type Material,
  type MinificationTextureFilter,
} from "three";
import {
  BASE_3D_FRAGMENT_SHADER,
  CLOUD_BLUR_FRAGMENT_SHADER,
  CLOUD_FRAGMENT_SHADER,
  COMPOSITE_FRAGMENT_SHADER,
  CURL_FRAGMENT_SHADER,
  DETAIL_3D_FRAGMENT_SHADER,
  ENVELOPE_FRAGMENT_SHADER,
  FULLSCREEN_VERTEX_SHADER,
} from "./shaders.ts";
import {
  type CloudBackdropSettings,
  normalizeCloudSettings,
} from "./settings.ts";

type VolumetricCloudRendererOptions = {
  host: HTMLElement;
  seed: number;
  reducedMotion: boolean;
  settings?: Partial<CloudBackdropSettings>;
};

type TextureProfile = {
  baseSize: number;
  detailSize: number;
  curlSize: number;
  envelopeSize: number;
};

class FullScreenQuad {
  private readonly camera = new Camera();
  private readonly scene = new Scene();
  private readonly geometry = new PlaneGeometry(2, 2);
  private readonly mesh: Mesh<PlaneGeometry, Material>;

  constructor(material: Material) {
    this.mesh = new Mesh(this.geometry, material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  set material(material: Material) {
    this.mesh.material = material;
  }

  render(renderer: WebGLRenderer) {
    renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.geometry.dispose();
  }
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createJitterTexture(seed: number): DataTexture {
  const size = 64;
  const random = createSeededRandom(seed ^ 0xa53a9b1f);
  const data = new Uint8Array(size * size);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.floor(random() * 256);
  }

  const texture = new DataTexture(
    data,
    size,
    size,
    RedFormat,
    UnsignedByteType,
  );
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}

function create3DTarget(size: number): WebGL3DRenderTarget {
  const target = new WebGL3DRenderTarget(size, size, size, {
    depthBuffer: false,
    stencilBuffer: false,
  });
  target.texture.type = UnsignedByteType;
  target.texture.format = RGBAFormat;
  target.texture.minFilter = LinearFilter;
  target.texture.magFilter = LinearFilter;
  target.texture.wrapS = RepeatWrapping;
  target.texture.wrapT = RepeatWrapping;
  target.texture.wrapR = RepeatWrapping;
  target.texture.generateMipmaps = false;
  return target;
}

function create2DTarget(
  width: number,
  height: number,
  filter: MinificationTextureFilter = LinearFilter,
): WebGLRenderTarget {
  const target = new WebGLRenderTarget(width, height, {
    depthBuffer: false,
    stencilBuffer: false,
  });
  target.texture.type = UnsignedByteType;
  target.texture.format = RGBAFormat;
  target.texture.minFilter = filter;
  target.texture.magFilter =
    filter === NearestFilter ? NearestFilter : LinearFilter;
  target.texture.wrapS = RepeatWrapping;
  target.texture.wrapT = RepeatWrapping;
  target.texture.generateMipmaps = false;
  return target;
}

function createGenerationMaterial(
  fragmentShader: string,
  seed: number,
  hasDepth: boolean,
) {
  return new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: FULLSCREEN_VERTEX_SHADER,
    fragmentShader,
    uniforms: {
      uSeed: { value: seed / 9973 },
      ...(hasDepth ? { uZCoord: { value: 0 } } : {}),
    },
    depthTest: false,
    depthWrite: false,
  });
}

function getTextureProfile(reducedMotion: boolean): TextureProfile {
  if (reducedMotion) {
    return {
      baseSize: 56,
      detailSize: 24,
      curlSize: 64,
      envelopeSize: 128,
    };
  }

  return {
    baseSize: 96,
    detailSize: 32,
    curlSize: 128,
    envelopeSize: 256,
  };
}

function clampInt(value: number, min: number, max: number) {
  return Math.round(MathUtils.clamp(value, min, max));
}

function getAdaptiveRenderScale(
  settings: CloudBackdropSettings,
  reducedMotion: boolean,
  adaptiveRenderScale: number,
) {
  const scale = reducedMotion
    ? Math.min(settings.renderScale, 0.36)
    : settings.renderScale * adaptiveRenderScale;
  return MathUtils.clamp(scale, 0.28, 0.85);
}

function getTargetFps(reducedMotion: boolean) {
  return reducedMotion ? 1 : 30;
}

export class VolumetricCloudRenderer {
  readonly domElement: HTMLCanvasElement;

  private readonly host: HTMLElement;
  private readonly renderer: WebGLRenderer;
  private readonly camera = new PerspectiveCamera(54, 1, 0.1, 180);
  private readonly fsQuad: FullScreenQuad;
  private readonly cloudMaterial: ShaderMaterial;
  private readonly blurMaterial: ShaderMaterial;
  private readonly compositeMaterial: ShaderMaterial;
  private readonly baseTextureTarget: WebGL3DRenderTarget;
  private readonly detailTextureTarget: WebGL3DRenderTarget;
  private readonly curlTextureTarget: WebGLRenderTarget;
  private readonly envelopeTextureTarget: WebGLRenderTarget;
  private readonly cloudTarget = create2DTarget(1, 1);
  private readonly blurTarget = create2DTarget(1, 1);
  private readonly jitterTexture: DataTexture;
  private readonly reducedMotion: boolean;
  private readonly pixelRatio: number;
  private readonly boxMin = new Vector3();
  private readonly boxMax = new Vector3();
  private settings: CloudBackdropSettings;
  private settingsDirty = true;
  private viewportWidth = 1;
  private viewportHeight = 1;
  private targetWidth = 1;
  private targetHeight = 1;
  private windTime = 0;
  private frameRateSampleStart = 0;
  private frameRateSampleCount = 0;
  private adaptiveRenderScale = 1;

  constructor({
    host,
    seed,
    reducedMotion,
    settings,
  }: VolumetricCloudRendererOptions) {
    this.host = host;
    this.reducedMotion = reducedMotion;
    this.settings = normalizeCloudSettings(settings);
    this.jitterTexture = createJitterTexture(seed);

    const textureProfile = getTextureProfile(reducedMotion);
    this.baseTextureTarget = create3DTarget(textureProfile.baseSize);
    this.detailTextureTarget = create3DTarget(textureProfile.detailSize);
    this.curlTextureTarget = create2DTarget(
      textureProfile.curlSize,
      textureProfile.curlSize,
    );
    this.envelopeTextureTarget = create2DTarget(
      textureProfile.envelopeSize,
      textureProfile.envelopeSize,
    );

    this.renderer = new WebGLRenderer({
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      stencil: false,
    });
    this.pixelRatio = reducedMotion
      ? 0.55
      : Math.min(window.devicePixelRatio, 1);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.domElement = this.renderer.domElement;

    this.camera.position.set(...this.settings.camera.position);
    this.camera.lookAt(...this.settings.camera.lookAt);

    this.cloudMaterial = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: FULLSCREEN_VERTEX_SHADER,
      fragmentShader: CLOUD_FRAGMENT_SHADER,
      uniforms: {
        uBaseTexture: { value: this.baseTextureTarget.texture },
        uDetailTexture: { value: this.detailTextureTarget.texture },
        uCurlTexture: { value: this.curlTextureTarget.texture },
        uEnvelopeTexture: { value: this.envelopeTextureTarget.texture },
        uJitterTexture: { value: this.jitterTexture },
        uCameraPosition: { value: this.camera.position.clone() },
        uProjectionInverse: {
          value: this.camera.projectionMatrixInverse.clone(),
        },
        uCameraMatrixWorld: { value: this.camera.matrixWorld.clone() },
        uBoxMin: { value: this.boxMin },
        uBoxMax: { value: this.boxMax },
        uWindTime: { value: 0 },
        uCoverage: { value: this.settings.coverage },
        uDensity: { value: this.settings.density },
        uDetail: { value: this.settings.detail },
        uShape: { value: this.settings.shape },
        uErosion: { value: this.settings.erosion },
        uLightAbsorption: { value: this.settings.lightAbsorption },
        uSunBrightness: { value: this.settings.sunBrightness },
        uMultiScattering: { value: this.settings.multiScattering },
        uAnisotropy: { value: this.settings.anisotropy },
        uPhaseMix: { value: this.settings.phaseMix },
        uPrimarySteps: { value: this.settings.primarySteps },
        uLightSteps: { value: this.settings.lightSteps },
        uLightDir: {
          value: new Vector3(
            ...this.settings.lighting.lightDirection,
          ).normalize(),
        },
        uSunColor: { value: new Color(this.settings.lighting.sunColor) },
        uAmbientColor: {
          value: new Color(this.settings.lighting.ambientColor),
        },
        uSkyBounceColor: {
          value: new Color(this.settings.lighting.skyBounceColor),
        },
        uCloudWhite: {
          value: new Color(this.settings.lighting.cloudWhite),
        },
        uCloudShadow: {
          value: new Color(this.settings.lighting.cloudShadow),
        },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.blurMaterial = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: FULLSCREEN_VERTEX_SHADER,
      fragmentShader: CLOUD_BLUR_FRAGMENT_SHADER,
      uniforms: {
        uSourceTexture: { value: this.cloudTarget.texture },
        uTexelSize: { value: new Vector2(1, 1) },
        uDirection: { value: new Vector2(1, 0) },
        uRadius: { value: this.settings.cloudBlur },
      },
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
    });

    this.compositeMaterial = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: FULLSCREEN_VERTEX_SHADER,
      fragmentShader: COMPOSITE_FRAGMENT_SHADER,
      uniforms: {
        uCloudTexture: { value: this.cloudTarget.texture },
        uResolution: { value: new Vector2(1, 1) },
        uPixelSize: { value: this.settings.pixelSize },
        uColorLevels: { value: this.settings.colorLevels },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    this.fsQuad = new FullScreenQuad(this.compositeMaterial);
    this.host.appendChild(this.domElement);
    this.generateStaticTextures(seed);
  }

  setSettings(settings?: Partial<CloudBackdropSettings>) {
    this.settings = normalizeCloudSettings(settings);
    this.settingsDirty = true;
  }

  get targetFrameMs() {
    return 1000 / getTargetFps(this.reducedMotion);
  }

  resize(width: number, height: number) {
    this.viewportWidth = Math.max(width, 1);
    this.viewportHeight = Math.max(height, 1);
    this.renderer.setSize(this.viewportWidth, this.viewportHeight, false);
    this.camera.aspect = this.viewportWidth / this.viewportHeight;
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.settingsDirty = true;
    this.resizeCloudTarget();
    // Composite samples gl_FragCoord in physical pixels, so feed it the
    // canvas resolution rather than CSS pixels. With the renderer's
    // pixelRatio (clamped to <=1 here) this is effectively viewport size.
    this.compositeMaterial.uniforms.uResolution.value.set(
      this.viewportWidth * this.pixelRatio,
      this.viewportHeight * this.pixelRatio,
    );
  }

  render(deltaSeconds: number) {
    this.advanceWind(deltaSeconds);
    this.syncSettingsUniforms();

    this.fsQuad.material = this.cloudMaterial;
    this.renderer.setRenderTarget(this.cloudTarget);
    this.renderer.clear();
    this.fsQuad.render(this.renderer);
    this.renderer.setRenderTarget(null);

    this.blurCloudTarget();

    this.fsQuad.material = this.compositeMaterial;
    this.renderer.clear();
    this.fsQuad.render(this.renderer);

    this.sampleFrameRate();
  }

  dispose() {
    if (this.domElement.parentNode === this.host) {
      this.host.removeChild(this.domElement);
    }
    this.fsQuad.dispose();
    this.cloudMaterial.dispose();
    this.blurMaterial.dispose();
    this.compositeMaterial.dispose();
    this.baseTextureTarget.dispose();
    this.detailTextureTarget.dispose();
    this.curlTextureTarget.dispose();
    this.envelopeTextureTarget.dispose();
    this.cloudTarget.dispose();
    this.blurTarget.dispose();
    this.jitterTexture.dispose();
    this.renderer.dispose();
  }

  private generateStaticTextures(seed: number) {
    const previousTarget = this.renderer.getRenderTarget();
    const baseMaterial = createGenerationMaterial(
      BASE_3D_FRAGMENT_SHADER,
      seed,
      true,
    );
    const detailMaterial = createGenerationMaterial(
      DETAIL_3D_FRAGMENT_SHADER,
      seed ^ 0x9e3779b9,
      true,
    );
    const curlMaterial = createGenerationMaterial(
      CURL_FRAGMENT_SHADER,
      seed ^ 0x85ebca6b,
      false,
    );
    const envelopeMaterial = createGenerationMaterial(
      ENVELOPE_FRAGMENT_SHADER,
      seed ^ 0xc2b2ae35,
      false,
    );

    this.generate3DTexture(baseMaterial, this.baseTextureTarget);
    this.generate3DTexture(detailMaterial, this.detailTextureTarget);
    this.generate2DTexture(curlMaterial, this.curlTextureTarget);
    this.generate2DTexture(envelopeMaterial, this.envelopeTextureTarget);

    baseMaterial.dispose();
    detailMaterial.dispose();
    curlMaterial.dispose();
    envelopeMaterial.dispose();
    this.renderer.setRenderTarget(previousTarget);
  }

  private generate3DTexture(
    material: ShaderMaterial,
    target: WebGL3DRenderTarget,
  ) {
    this.fsQuad.material = material;

    for (let z = 0; z < target.depth; z += 1) {
      material.uniforms.uZCoord.value = (z + 0.5) / target.depth;
      this.renderer.setRenderTarget(target, z);
      this.fsQuad.render(this.renderer);
    }

    this.renderer.setRenderTarget(null);
  }

  private generate2DTexture(
    material: ShaderMaterial,
    target: WebGLRenderTarget,
  ) {
    this.fsQuad.material = material;
    this.renderer.setRenderTarget(target);
    this.fsQuad.render(this.renderer);
    this.renderer.setRenderTarget(null);
  }

  private resizeCloudTarget() {
    const scale = getAdaptiveRenderScale(
      this.settings,
      this.reducedMotion,
      this.adaptiveRenderScale,
    );
    const width = Math.max(
      1,
      Math.floor(this.viewportWidth * this.pixelRatio * scale),
    );
    const height = Math.max(
      1,
      Math.floor(this.viewportHeight * this.pixelRatio * scale),
    );

    if (width === this.targetWidth && height === this.targetHeight) return;
    this.targetWidth = width;
    this.targetHeight = height;
    this.cloudTarget.setSize(width, height);
    this.blurTarget.setSize(width, height);
    this.blurMaterial.uniforms.uTexelSize.value.set(1 / width, 1 / height);
  }

  private blurCloudTarget() {
    if (this.blurMaterial.uniforms.uRadius.value <= 0.001) return;

    this.fsQuad.material = this.blurMaterial;

    this.blurMaterial.uniforms.uSourceTexture.value = this.cloudTarget.texture;
    this.blurMaterial.uniforms.uDirection.value.set(1, 0);
    this.renderer.setRenderTarget(this.blurTarget);
    this.renderer.clear();
    this.fsQuad.render(this.renderer);

    this.blurMaterial.uniforms.uSourceTexture.value = this.blurTarget.texture;
    this.blurMaterial.uniforms.uDirection.value.set(0, 1);
    this.renderer.setRenderTarget(this.cloudTarget);
    this.renderer.clear();
    this.fsQuad.render(this.renderer);

    this.renderer.setRenderTarget(null);
  }

  private advanceWind(deltaSeconds: number) {
    if (this.reducedMotion) return;

    this.windTime +=
      Math.min(deltaSeconds, 0.2) * Math.max(this.settings.speed, 0);
    this.cloudMaterial.uniforms.uWindTime.value = this.windTime;
  }

  private syncSettingsUniforms() {
    if (!this.settingsDirty) return;
    this.settingsDirty = false;

    const current = this.settings;
    const lighting = current.lighting;
    const primarySteps = this.reducedMotion
      ? Math.min(current.primarySteps, 36)
      : current.primarySteps;
    const lightSteps = this.reducedMotion
      ? Math.min(current.lightSteps, 2)
      : current.lightSteps;

    this.resizeCloudTarget();
    this.updateBounds();

    this.camera.position.set(...current.camera.position);
    this.camera.lookAt(...current.camera.lookAt);
    this.camera.updateMatrixWorld();
    this.cloudMaterial.uniforms.uCameraPosition.value.copy(
      this.camera.position,
    );
    this.cloudMaterial.uniforms.uProjectionInverse.value.copy(
      this.camera.projectionMatrixInverse,
    );
    this.cloudMaterial.uniforms.uCameraMatrixWorld.value.copy(
      this.camera.matrixWorld,
    );
    this.cloudMaterial.uniforms.uCoverage.value = MathUtils.clamp(
      current.coverage,
      0,
      1,
    );
    this.cloudMaterial.uniforms.uDensity.value = MathUtils.clamp(
      current.density,
      0.1,
      2.4,
    );
    this.cloudMaterial.uniforms.uDetail.value = MathUtils.clamp(
      current.detail,
      0,
      1,
    );
    this.cloudMaterial.uniforms.uShape.value = MathUtils.clamp(
      current.shape,
      0,
      1,
    );
    this.cloudMaterial.uniforms.uErosion.value = MathUtils.clamp(
      current.erosion,
      0,
      1,
    );
    this.cloudMaterial.uniforms.uLightAbsorption.value = MathUtils.clamp(
      current.lightAbsorption,
      0.2,
      4,
    );
    this.cloudMaterial.uniforms.uSunBrightness.value = MathUtils.clamp(
      current.sunBrightness,
      0,
      10,
    );
    this.cloudMaterial.uniforms.uMultiScattering.value = MathUtils.clamp(
      current.multiScattering,
      0,
      1,
    );
    this.cloudMaterial.uniforms.uAnisotropy.value = MathUtils.clamp(
      current.anisotropy,
      0,
      0.82,
    );
    this.cloudMaterial.uniforms.uPhaseMix.value = MathUtils.clamp(
      current.phaseMix,
      0,
      1,
    );
    this.cloudMaterial.uniforms.uPrimarySteps.value = clampInt(
      primarySteps,
      16,
      96,
    );
    this.cloudMaterial.uniforms.uLightSteps.value = clampInt(lightSteps, 1, 5);
    this.blurMaterial.uniforms.uRadius.value = MathUtils.clamp(
      current.cloudBlur,
      0,
      8,
    );
    this.compositeMaterial.uniforms.uPixelSize.value = MathUtils.clamp(
      current.pixelSize,
      1,
      64,
    );
    this.compositeMaterial.uniforms.uColorLevels.value = MathUtils.clamp(
      current.colorLevels,
      2,
      256,
    );
    this.cloudMaterial.uniforms.uLightDir.value
      .set(...lighting.lightDirection)
      .normalize();
    this.cloudMaterial.uniforms.uSunColor.value.set(lighting.sunColor);
    this.cloudMaterial.uniforms.uAmbientColor.value.set(lighting.ambientColor);
    this.cloudMaterial.uniforms.uSkyBounceColor.value.set(
      lighting.skyBounceColor,
    );
    this.cloudMaterial.uniforms.uCloudWhite.value.set(lighting.cloudWhite);
    this.cloudMaterial.uniforms.uCloudShadow.value.set(lighting.cloudShadow);
  }

  private updateBounds() {
    const width = 58 * Math.max(this.settings.horizontalDistribution, 0.2);
    const height = 14 * Math.max(this.settings.verticalDistribution, 0.2);
    const depth = 34 * Math.max(this.settings.depthDistribution, 0.2);
    const baseY = -6.8;
    const shapeLift = MathUtils.lerp(-1.2, 1.4, this.settings.shape);

    this.boxMin.set(-width * 0.5, baseY, -18 - depth * 0.5);
    this.boxMax.set(width * 0.5, baseY + height + shapeLift, -18 + depth * 0.5);
  }

  private sampleFrameRate() {
    this.frameRateSampleCount += 1;
    const now = performance.now();

    if (this.frameRateSampleStart === 0) {
      this.frameRateSampleStart = now;
      return;
    }

    const elapsed = now - this.frameRateSampleStart;
    if (elapsed < 500) return;

    const fps = Math.round((this.frameRateSampleCount * 1000) / elapsed);
    this.adjustAdaptiveQuality(fps);

    this.frameRateSampleCount = 0;
    this.frameRateSampleStart = now;
  }

  private adjustAdaptiveQuality(fps: number) {
    if (this.reducedMotion) return;

    const targetFps = getTargetFps(this.reducedMotion);
    const previousRenderScale = this.adaptiveRenderScale;

    if (fps < targetFps * 0.8) {
      this.adaptiveRenderScale = Math.max(0.68, this.adaptiveRenderScale * 0.9);
    } else if (fps > targetFps * 0.96) {
      this.adaptiveRenderScale = Math.min(1, this.adaptiveRenderScale * 1.04);
    }

    if (this.adaptiveRenderScale !== previousRenderScale) {
      this.resizeCloudTarget();
    }
  }
}
