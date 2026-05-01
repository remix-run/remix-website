import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  GLSL3,
  Points,
  RGBAFormat,
  RawShaderMaterial,
  Scene,
} from "three";
import { PRESET_GLSL, PRESET_UNIFORMS_GLSL } from "./preset-glsl";

const VERTEX_SHADER = /* glsl */ `
precision highp float;
precision highp int;
precision highp sampler2D;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in float aRandom;

out vec3 vColor;
  out float vAlpha;
  out float vViewDist;
  out float vIntro;
  out float vPulse;
  out float vCoc;

  uniform float uPointSize;
  uniform float uPixelRatio;
  uniform float uIntroProgress;
  uniform float uDofAmount;
  uniform float uDofFocus;
  uniform float uTime;
  uniform float uCount;
  uniform float uPresetA;
  uniform float uPresetB;
  uniform float uBlend;
  uniform float uSeparation;
  uniform vec2 uMousePos;
  uniform float uCursorRepulsion;
  uniform float uMorphT;
  uniform float uColorMode;
  uniform float uCtrlA[8];
  uniform float uCtrlB[8];
  ${PRESET_UNIFORMS_GLSL}
  ${PRESET_GLSL}

  /* ── main ─────────────────────────────────────────────── */

  void main() {
    float fi = float(gl_VertexID);
    int i = gl_VertexID;
    int cnt = int(uCount);

    vec3 posA, colA;
    computePreset(int(uPresetA), fi, cnt, uTime,
      uCtrlA[0], uCtrlA[1], uCtrlA[2], uCtrlA[3],
      uCtrlA[4], uCtrlA[5], uCtrlA[6], uCtrlA[7],
      posA, colA);

    vec3 finalPos, finalCol;
    if (uBlend > 0.001) {
      vec3 posB, colB;
      computePreset(int(uPresetB), fi, cnt, uTime,
        uCtrlB[0], uCtrlB[1], uCtrlB[2], uCtrlB[3],
        uCtrlB[4], uCtrlB[5], uCtrlB[6], uCtrlB[7],
        posB, colB);
      finalPos = mix(posA, posB, uMorphT);
      finalCol = mix(colA, colB, uMorphT);
    } else {
      finalPos = posA;
      finalCol = colA;
    }

    float h = fi * 2.3999;
    finalPos.x += sin(h) * uSeparation;
    finalPos.y += cos(h * 1.731) * uSeparation;
    finalPos.z += sin(h * 2.419) * uSeparation;
    // Unused position attribute is kept so the linker keeps it active
    // (computePreset uses gl_VertexID only); scale avoids affecting the scene.
    finalPos.xy += position.xy * 1e-7;

    if (uCursorRepulsion > 0.0) {
      vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
      vec2 ndc = clipPos.xy / clipPos.w;
      vec2 diff = ndc - uMousePos;
      float d2 = dot(diff, diff);
      float radius = 0.15;
      float falloff = exp(-d2 / (radius * radius));
      vec2 push = normalize(diff + vec2(0.0001)) * falloff * uCursorRepulsion * 8.0;
      finalPos += transpose(mat3(modelViewMatrix)) * vec3(push, 0.0);
    }

    if (uColorMode > 1.5) {
      float spatialRatio = fract(dot(finalPos, vec3(0.018, 0.014, 0.012)));
      vec3 gradCol = brandGradient(spatialRatio, uTime * 0.25);
      float origBright = dot(finalCol, vec3(0.299, 0.587, 0.114));
      finalCol = gradCol * (0.5 + origBright * 1.5);
    } else if (uColorMode > 0.5) {
      float height = clamp((finalPos.y + 30.0) / 60.0, 0.0, 1.0);
      float pulse = 1.0 + 0.1 * sin(uTime * 2.5 + fi * 0.02);
      float lum = (0.3 + 0.5 * height) * pulse;
      finalCol = hsl2rgb(0.55 + 0.1 * height, 0.6, lum);
    }

    vColor = finalCol;

    float delay = aRandom * 0.7;
    float fallDuration = 0.5;
    float local = clamp((uIntroProgress - delay) / fallDuration, 0.0, 1.0);
    float inv = 1.0 - local;
    float easedLocal = 1.0 - inv * inv * inv;
    float landTime = delay + fallDuration;
    float sinceL = max(uIntroProgress - landTime, 0.0);
    vPulse = (local >= 1.0) ? exp(-sinceL * 8.0) : 0.0;

    float landed = step(1.0, local);
    float opacityRamp = 1.0 - exp(-sinceL * 3.0);
    vIntro = mix(easedLocal * 0.5, 0.5 + 0.5 * opacityRamp, landed);

    float introOffset = (1.0 - easedLocal) * (50.0 + aRandom * 30.0);
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    mvPosition.z -= introOffset;
    float dist = -mvPosition.z;
    vViewDist = dist;

    float baseSize = uPointSize * uPixelRatio * (300.0 / dist);
    float coc = uDofAmount > 0.0
      ? abs(dist - uDofFocus) * uDofAmount * 0.01
      : 0.0;
    vCoc = clamp(coc, 0.0, 1.0);

    gl_PointSize = clamp(baseSize + coc * 12.0, 1.0, 128.0);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = smoothstep(500.0, 50.0, dist);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
precision highp int;

in vec3 vColor;
  in float vAlpha;
  in float vViewDist;
  in float vIntro;
  in float vPulse;
  in float vCoc;
  uniform float uFogEnabled;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uHdrIntensity;

  out vec4 fragColor;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float sharpness = mix(10.0, 2.0, vCoc);
    float glow = exp(-d * sharpness);
    float core = smoothstep(0.5, 0.08 + vCoc * 0.3, d);
    float alpha = (glow * 0.2 + core * 0.8) * vAlpha * vIntro;
    alpha *= mix(1.0, 0.35, vCoc);

    vec3 col = vColor * (0.8 + core * 0.4) * (1.0 + vPulse * 9.0);

    if (uFogEnabled > 0.0) {
      float fogFactor = smoothstep(uFogNear, uFogFar, vViewDist) * uFogEnabled;
      col *= 1.0 - fogFactor;
      alpha *= 1.0 - fogFactor;
    }

    col *= uHdrIntensity;

    fragColor = vec4(col, alpha);
  }
`;

export class ParticleSystem {
  private points: Points | null = null;
  private geometry: BufferGeometry | null = null;
  private material: RawShaderMaterial | null = null;
  private count = 0;
  // Per-frame setter caches. NaN sentinels guarantee the first call after
  // init() always writes, since `NaN !== anything` is always true.
  private lastPointSize = NaN;
  private lastIntroProgress = NaN;
  private lastHdrIntensity = NaN;
  private lastDofAmount = NaN;
  private lastDofFocus = NaN;
  private lastSeparation = NaN;
  private lastCursorRepulsion = NaN;
  private lastCarLaneOffset = NaN;
  private lastCarLaneActivity = NaN;
  private lastCarPosY = NaN;
  private lastColorMode = NaN;
  private lastMorphT = NaN;
  private lastFogIntensity = NaN;
  private lastFogNear = NaN;
  private lastFogFar = NaN;
  private lastPresetA = NaN;
  private lastPresetB = NaN;
  private lastBlend = NaN;

  private resetSetterCaches() {
    this.lastPointSize = NaN;
    this.lastIntroProgress = NaN;
    this.lastHdrIntensity = NaN;
    this.lastDofAmount = NaN;
    this.lastDofFocus = NaN;
    this.lastSeparation = NaN;
    this.lastCursorRepulsion = NaN;
    this.lastCarLaneOffset = NaN;
    this.lastCarLaneActivity = NaN;
    this.lastCarPosY = NaN;
    this.lastColorMode = NaN;
    this.lastMorphT = NaN;
    this.lastFogIntensity = NaN;
    this.lastFogNear = NaN;
    this.lastFogFar = NaN;
    this.lastPresetA = NaN;
    this.lastPresetB = NaN;
    this.lastBlend = NaN;
  }

  init(scene: Scene, count: number, pointSize: number) {
    this.dispose(scene);
    this.count = count;
    this.resetSetterCaches();

    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random();
    }

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
    this.geometry.setAttribute("aRandom", new BufferAttribute(randoms, 1));

    this.material = new RawShaderMaterial({
      // RawShaderMaterial: no default prefix chunks (lights, fog, maps). With
      // `glslVersion: GLSL3`, Three still prepends `#version 300 es` and a few
      // defines — do not repeat `#version` in the sources. Precisions + matrix
      // uniforms stay explicit here; gl_VertexID drives particle identity.
      glslVersion: GLSL3,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uPointSize: { value: pointSize },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uIntroProgress: { value: 0.0 },
        uFogEnabled: { value: 0.0 },
        uFogNear: { value: 10.0 },
        uFogFar: { value: 180.0 },
        uHdrIntensity: { value: 1.0 },
        uDofAmount: { value: 0.0 },
        uDofFocus: { value: 80.0 },
        uTime: { value: 0.0 },
        uCount: { value: count },
        uPresetA: { value: 0 },
        uPresetB: { value: 0 },
        uBlend: { value: 0.0 },
        uSeparation: { value: 0.0 },
        uMousePos: { value: [0, 0] },
        uCursorRepulsion: { value: 0 },
        uCarLaneOffset: { value: 0 },
        uCarLaneActivity: { value: 0 },
        uCarPosY: { value: 0 },
        uColorMode: { value: 0.0 },
        uMorphT: { value: 0 },
        uCtrlA: { value: [0, 0, 0, 0, 0, 0, 0, 0] },
        uCtrlB: { value: [0, 0, 0, 0, 0, 0, 0, 0] },
        uModelCount0: { value: 0 },
        uModelCount1: { value: 0 },
        uModelCount2: { value: 0 },
        uModelCount3: { value: 0 },
        uModelTex0: {
          value: new DataTexture(
            new Float32Array(4),
            1,
            1,
            RGBAFormat,
            FloatType,
          ),
        },
        uModelTex1: {
          value: new DataTexture(
            new Float32Array(4),
            1,
            1,
            RGBAFormat,
            FloatType,
          ),
        },
        uModelTex2: {
          value: new DataTexture(
            new Float32Array(4),
            1,
            1,
            RGBAFormat,
            FloatType,
          ),
        },
        uModelTex3: {
          value: new DataTexture(
            new Float32Array(4),
            1,
            1,
            RGBAFormat,
            FloatType,
          ),
        },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  setPointSize(size: number) {
    if (!this.material || size === this.lastPointSize) return;
    this.lastPointSize = size;
    this.material.uniforms.uPointSize.value = size;
  }

  setIntroProgress(value: number) {
    if (!this.material || value === this.lastIntroProgress) return;
    this.lastIntroProgress = value;
    this.material.uniforms.uIntroProgress.value = value;
  }

  setFog(intensity: number, near: number, far: number) {
    if (!this.material) return;
    if (
      intensity === this.lastFogIntensity &&
      near === this.lastFogNear &&
      far === this.lastFogFar
    ) {
      return;
    }
    this.lastFogIntensity = intensity;
    this.lastFogNear = near;
    this.lastFogFar = far;
    this.material.uniforms.uFogEnabled.value = intensity;
    this.material.uniforms.uFogNear.value = near;
    this.material.uniforms.uFogFar.value = far;
  }

  setHdrIntensity(value: number) {
    if (!this.material || value === this.lastHdrIntensity) return;
    this.lastHdrIntensity = value;
    this.material.uniforms.uHdrIntensity.value = value;
  }

  setDof(amount: number, focus: number) {
    if (!this.material) return;
    if (amount === this.lastDofAmount && focus === this.lastDofFocus) return;
    this.lastDofAmount = amount;
    this.lastDofFocus = focus;
    this.material.uniforms.uDofAmount.value = amount;
    this.material.uniforms.uDofFocus.value = focus;
  }

  setPresets(presetA: number, presetB: number, blend: number) {
    if (!this.material) return;
    if (
      presetA === this.lastPresetA &&
      presetB === this.lastPresetB &&
      blend === this.lastBlend
    ) {
      return;
    }
    this.lastPresetA = presetA;
    this.lastPresetB = presetB;
    this.lastBlend = blend;
    this.material.uniforms.uPresetA.value = presetA;
    this.material.uniforms.uPresetB.value = presetB;
    this.material.uniforms.uBlend.value = blend;
  }

  setTime(time: number) {
    if (this.material) this.material.uniforms.uTime.value = time;
  }

  setSeparation(value: number) {
    if (!this.material || value === this.lastSeparation) return;
    this.lastSeparation = value;
    this.material.uniforms.uSeparation.value = value;
  }

  setMousePos(x: number, y: number) {
    if (this.material) {
      const v = this.material.uniforms.uMousePos.value as number[];
      v[0] = x;
      v[1] = y;
    }
  }

  setCursorRepulsion(value: number) {
    if (!this.material || value === this.lastCursorRepulsion) return;
    this.lastCursorRepulsion = value;
    this.material.uniforms.uCursorRepulsion.value = value;
  }

  setCarLaneOffset(value: number) {
    if (!this.material || value === this.lastCarLaneOffset) return;
    this.lastCarLaneOffset = value;
    this.material.uniforms.uCarLaneOffset.value = value;
  }

  setCarLaneActivity(value: number) {
    if (!this.material || value === this.lastCarLaneActivity) return;
    this.lastCarLaneActivity = value;
    this.material.uniforms.uCarLaneActivity.value = value;
  }

  setCarPosY(value: number) {
    if (!this.material || value === this.lastCarPosY) return;
    this.lastCarPosY = value;
    this.material.uniforms.uCarPosY.value = value;
  }

  setColorMode(value: number) {
    if (!this.material || value === this.lastColorMode) return;
    this.lastColorMode = value;
    this.material.uniforms.uColorMode.value = value;
  }

  setMorphT(value: number) {
    if (!this.material || value === this.lastMorphT) return;
    this.lastMorphT = value;
    this.material.uniforms.uMorphT.value = value;
  }

  setControls(ctrlA: number[], ctrlB: number[]) {
    if (!this.material) return;
    const a = this.material.uniforms.uCtrlA.value as number[];
    const b = this.material.uniforms.uCtrlB.value as number[];
    for (let j = 0; j < 8; j++) {
      a[j] = ctrlA[j] ?? 0;
      b[j] = ctrlB[j] ?? 0;
    }
  }

  setModelTexture(slot: number, texture: DataTexture, pointCount: number) {
    if (!this.material) return;
    if (slot === 0) {
      this.material.uniforms.uModelTex0.value = texture;
      this.material.uniforms.uModelCount0.value = pointCount;
    } else if (slot === 1) {
      this.material.uniforms.uModelTex1.value = texture;
      this.material.uniforms.uModelCount1.value = pointCount;
    } else if (slot === 2) {
      this.material.uniforms.uModelTex2.value = texture;
      this.material.uniforms.uModelCount2.value = pointCount;
    } else {
      this.material.uniforms.uModelTex3.value = texture;
      this.material.uniforms.uModelCount3.value = pointCount;
    }
  }

  dispose(scene?: Scene) {
    if (this.points && scene) scene.remove(this.points);
    this.geometry?.dispose();
    this.material?.dispose();
    this.points = null;
    this.geometry = null;
    this.material = null;
  }
}
