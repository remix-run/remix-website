export const FULLSCREEN_VERTEX_SHADER = /* glsl */ `
  out vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const COMMON_NOISE = /* glsl */ `
  #define PI 3.14159265359

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

  float remap(float value, float oldMin, float oldMax, float newMin, float newMax) {
    float normalized = saturate((value - oldMin) / max(oldMax - oldMin, 0.0001));
    return mix(newMin, newMax, normalized);
  }

  vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float hash13(vec3 p) {
    return fract(sin(dot(p, vec3(17.17, 83.31, 29.73))) * 43758.5453123);
  }

  float perlinNoise(vec3 x, float freq) {
    vec3 p = floor(x);
    vec3 w = fract(x);
    vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);

    vec3 ga = hash33(mod(p + vec3(0.0, 0.0, 0.0), freq));
    vec3 gb = hash33(mod(p + vec3(1.0, 0.0, 0.0), freq));
    vec3 gc = hash33(mod(p + vec3(0.0, 1.0, 0.0), freq));
    vec3 gd = hash33(mod(p + vec3(1.0, 1.0, 0.0), freq));
    vec3 ge = hash33(mod(p + vec3(0.0, 0.0, 1.0), freq));
    vec3 gf = hash33(mod(p + vec3(1.0, 0.0, 1.0), freq));
    vec3 gg = hash33(mod(p + vec3(0.0, 1.0, 1.0), freq));
    vec3 gh = hash33(mod(p + vec3(1.0, 1.0, 1.0), freq));

    float va = dot(ga, w - vec3(0.0, 0.0, 0.0));
    float vb = dot(gb, w - vec3(1.0, 0.0, 0.0));
    float vc = dot(gc, w - vec3(0.0, 1.0, 0.0));
    float vd = dot(gd, w - vec3(1.0, 1.0, 0.0));
    float ve = dot(ge, w - vec3(0.0, 0.0, 1.0));
    float vf = dot(gf, w - vec3(1.0, 0.0, 1.0));
    float vg = dot(gg, w - vec3(0.0, 1.0, 1.0));
    float vh = dot(gh, w - vec3(1.0, 1.0, 1.0));

    return va +
      u.x * (vb - va) +
      u.y * (vc - va) +
      u.z * (ve - va) +
      u.x * u.y * (va - vb - vc + vd) +
      u.y * u.z * (va - vc - ve + vg) +
      u.z * u.x * (va - vb - ve + vf) +
      u.x * u.y * u.z * (-va + vb + vc - vd + ve - vf - vg + vh);
  }

  float perlinFbm(vec3 p, float freq, int octaves) {
    float gain = exp2(-0.85);
    float amplitude = 1.0;
    float noise = 0.0;
    float maxValue = 0.0;

    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      noise += amplitude * perlinNoise(p * freq, freq);
      maxValue += amplitude;
      freq *= 2.0;
      amplitude *= gain;
    }

    noise = noise / max(maxValue, 0.0001);
    return abs((mix(1.0, noise, 0.5) * 2.0) - 1.0);
  }

  float worleyNoise(vec3 uv, float freq) {
    vec3 id = floor(uv);
    vec3 p = fract(uv);
    float minDist = 10000.0;

    for (float x = -1.0; x <= 1.0; x += 1.0) {
      for (float y = -1.0; y <= 1.0; y += 1.0) {
        for (float z = -1.0; z <= 1.0; z += 1.0) {
          vec3 offset = vec3(x, y, z);
          vec3 h = hash33(mod(id + offset, vec3(freq))) * 0.5 + 0.5;
          h += offset;
          vec3 d = p - h;
          minDist = min(minDist, dot(d, d));
        }
      }
    }

    return 1.0 - minDist;
  }

  float worleyFbm(vec3 p, float freq) {
    return worleyNoise(p * freq, freq) * 0.625 +
      worleyNoise(p * freq * 2.0, freq * 2.0) * 0.25 +
      worleyNoise(p * freq * 4.0, freq * 4.0) * 0.125;
  }

  float curlNoise(vec3 p, float freq) {
    p *= freq;
    vec3 q = vec3(
      perlinNoise(p, freq),
      perlinNoise(p + vec3(5.2, 1.3, 7.1), freq),
      perlinNoise(p + vec3(1.7, 9.2, 3.1), freq)
    );
    vec3 r = vec3(
      perlinNoise(p + q * 2.0, freq),
      perlinNoise(p + q * 2.0 + vec3(5.2, 1.3, 7.1), freq),
      perlinNoise(p + q * 2.0 + vec3(1.7, 9.2, 3.1), freq)
    );
    return remap(perlinNoise(p + r * 2.0, freq), -1.0, 1.0, 0.0, 1.0);
  }
`;

export const BASE_3D_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uZCoord;
  uniform float uSeed;

  in vec2 vUv;
  out vec4 outColor;

  ${COMMON_NOISE}

  void main() {
    vec3 pos = vec3(vUv, uZCoord);
    pos += hash33(vec3(uSeed, uSeed * 0.31, uSeed * 1.37)) * 100.0;

    float baseFreq = 4.0;
    float worleyA = worleyFbm(pos, baseFreq);
    float worleyB = worleyFbm(pos, baseFreq * 2.0);
    float worleyC = worleyFbm(pos, baseFreq * 4.0);
    float perlin = perlinFbm(pos, baseFreq, 7);
    float perlinWorley = remap(perlin, 0.0, 1.0, worleyA, 1.0);

    outColor = vec4(perlinWorley, worleyA, worleyB, worleyC);
  }
`;

export const DETAIL_3D_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uZCoord;
  uniform float uSeed;

  in vec2 vUv;
  out vec4 outColor;

  ${COMMON_NOISE}

  void main() {
    vec3 pos = vec3(vUv, uZCoord);
    pos += hash33(vec3(uSeed * 1.91, uSeed * 0.73, uSeed * 2.11)) * 100.0;

    float baseFreq = 2.0;
    float worleyA = worleyFbm(pos, baseFreq);
    float worleyB = worleyFbm(pos, baseFreq * 2.0);
    float worleyC = worleyFbm(pos, baseFreq * 4.0);

    outColor = vec4(worleyA, worleyB, worleyC, 1.0);
  }
`;

export const CURL_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uSeed;

  in vec2 vUv;
  out vec4 outColor;

  ${COMMON_NOISE}

  void main() {
    vec3 pos = vec3(vUv, 0.0);
    pos += hash33(vec3(uSeed * 0.37, uSeed * 1.13, uSeed * 1.97)) * 100.0;

    float curlA = curlNoise(pos, 4.0);
    float curlB = curlNoise(pos, 8.0);
    float curlC = curlNoise(pos, 16.0);

    outColor = vec4(curlA, curlB, curlC, 1.0);
  }
`;

export const ENVELOPE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uSeed;

  in vec2 vUv;
  out vec4 outColor;

  ${COMMON_NOISE}

  float blob(vec2 uv, vec2 center, float radius) {
    float dist = length((uv - center) / vec2(radius, radius * 0.72));
    return smoothstep(1.0, 0.0, dist);
  }

  void main() {
    vec2 uv = vUv;
    vec3 seeded = vec3(uv + hash33(vec3(uSeed)).xy * 100.0, uSeed * 0.017);

    float broad = remap(perlinNoise(seeded * vec3(2.0, 1.2, 1.0), 2.0), -1.0, 1.0, 0.0, 1.0);
    float streaks = remap(perlinNoise(vec3(uv * vec2(5.0, 2.0), uSeed * 0.023), 5.0), -1.0, 1.0, 0.0, 1.0);

    float cells = 0.0;
    for (int i = 0; i < 7; i++) {
      float fi = float(i);
      vec2 center = vec2(hash13(vec3(fi, uSeed, 1.0)), hash13(vec3(fi, uSeed, 2.0)));
      center.y = mix(0.28, 0.78, center.y);
      float radius = mix(0.18, 0.38, hash13(vec3(fi, uSeed, 3.0)));
      cells = max(cells, blob(uv, center, radius));
    }

    float minHeight = mix(0.10, 0.24, broad);
    float maxHeight = clamp(minHeight + mix(0.38, 0.76, broad * 0.72 + cells * 0.28), 0.32, 0.98);
    float type = smoothstep(0.18, 0.86, uv.y + broad * 0.16);
    float coverage = saturate(cells * 0.85 + streaks * 0.35 + broad * 0.25);

    outColor = vec4(minHeight, maxHeight, type, coverage);
  }
`;

export const CLOUD_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  precision highp sampler3D;

  uniform sampler3D uBaseTexture;
  uniform sampler3D uDetailTexture;
  uniform sampler2D uCurlTexture;
  uniform sampler2D uEnvelopeTexture;
  uniform sampler2D uJitterTexture;

  uniform vec3 uCameraPosition;
  uniform mat4 uProjectionInverse;
  uniform mat4 uCameraMatrixWorld;
  uniform vec3 uBoxMin;
  uniform vec3 uBoxMax;
  uniform float uWindTime;

  uniform float uCoverage;
  uniform float uDensity;
  uniform float uDetail;
  uniform float uShape;
  uniform float uErosion;
  uniform float uLightAbsorption;
  uniform float uSunBrightness;
  uniform float uMultiScattering;
  uniform float uAnisotropy;
  uniform float uPhaseMix;
  uniform int uPrimarySteps;
  uniform int uLightSteps;

  uniform vec3 uLightDir;
  uniform vec3 uSunColor;
  uniform vec3 uAmbientColor;
  uniform vec3 uSkyBounceColor;
  uniform vec3 uCloudWhite;
  uniform vec3 uCloudShadow;

  in vec2 vUv;
  out vec4 outColor;

  #define PI 3.14159265359
  const int MAX_PRIMARY_STEPS = 96;
  const int MAX_LIGHT_STEPS = 5;

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

  float remap(float value, float oldMin, float oldMax, float newMin, float newMax) {
    float normalized = saturate((value - oldMin) / max(oldMax - oldMin, 0.0001));
    return mix(newMin, newMax, normalized);
  }

  vec2 intersectAabb(vec3 ro, vec3 rd, vec3 boxMin, vec3 boxMax) {
    vec3 invDir = 1.0 / rd;
    vec3 t0 = (boxMin - ro) * invDir;
    vec3 t1 = (boxMax - ro) * invDir;
    vec3 tmin = min(t0, t1);
    vec3 tmax = max(t0, t1);
    float nearHit = max(max(tmin.x, tmin.y), tmin.z);
    float farHit = min(min(tmax.x, tmax.y), tmax.z);
    return vec2(nearHit, farHit);
  }

  float hg(float g, float cosTheta) {
    float gg = g * g;
    return (1.0 - gg) / (4.0 * PI * pow(max(1.0 + gg - 2.0 * g * cosTheta, 0.0001), 1.5));
  }

  float dualLobePhase(float cosTheta) {
    return mix(hg(uAnisotropy, cosTheta), hg(-uAnisotropy * 0.52, cosTheta), uPhaseMix);
  }

  float multipleScattering(float depth, float cosTheta, float basePhase) {
    float luminance = 0.0;
    float attenuation = 1.0;
    float contribution = 1.0;
    float phaseScale = 1.0;

    for (int i = 0; i < 4; i++) {
      float beer = exp(-depth * attenuation);
      float phase = mix(basePhase, hg(uAnisotropy * phaseScale, cosTheta), 0.38);
      luminance += contribution * phase * beer;
      attenuation *= 0.55;
      contribution *= 0.48;
      phaseScale *= 0.72;
    }

    return luminance;
  }

  vec3 worldToCloudUv(vec3 position) {
    return (position - uBoxMin) / (uBoxMax - uBoxMin);
  }

  vec3 getWindOffset() {
    return fract(vec3(uWindTime * 0.035, uWindTime * 0.0025, uWindTime * 0.012));
  }

  float edgeFade(vec3 p) {
    vec3 edge = smoothstep(vec3(0.0), vec3(0.035, 0.08, 0.035), p) *
      (1.0 - smoothstep(vec3(0.965, 0.96, 0.965), vec3(1.0), p));
    return edge.x * edge.y * edge.z;
  }

  float heightProfile(vec3 p, vec4 envelope) {
    float minHeight = envelope.r;
    float maxHeight = max(envelope.g, minHeight + 0.12);
    float height = remap(p.y, minHeight, maxHeight, 0.0, 1.0);
    float base = smoothstep(0.0, mix(0.05, 0.16, 1.0 - uShape), height);
    float top = 1.0 - smoothstep(mix(0.54, 0.76, uShape), 1.0, height);
    float dome = pow(saturate(1.0 - abs(height - 0.52) * mix(1.4, 2.2, uShape)), mix(0.72, 1.45, uShape));
    return base * max(top, dome * 0.55);
  }

  float sampleDensityUv(vec3 p, bool cheap, vec3 windOffset) {
    if (any(lessThan(p, vec3(0.0))) || any(greaterThan(p, vec3(1.0)))) {
      return 0.0;
    }

    vec2 envelopeUv = fract(p.xz + windOffset.xz * 0.025);
    vec4 envelope = texture(uEnvelopeTexture, envelopeUv);
    float profile = heightProfile(p, envelope) * edgeFade(p);

    vec3 curl = texture(uCurlTexture, fract(p.xz * 1.65 + windOffset.xz * 0.12)).rgb - 0.5;
    vec3 coord = fract(p * vec3(1.75, 1.0, 1.35) + windOffset + curl * vec3(0.09, 0.02, 0.09));
    vec4 base = texture(uBaseTexture, coord);

    float coverageField = saturate(envelope.a * 0.62 + base.r * 0.38);
    float coverage = mix(0.62, 0.18, uCoverage);
    float cloud = remap(coverageField, coverage, 1.0, 0.0, 1.0);

    float worleyErosion = base.g * 0.58 + base.b * 0.28 + base.a * 0.14;
    if (!cheap && uDetail > 0.001) {
      vec3 detailCoord = fract(p * vec3(7.5, 3.6, 6.0) - windOffset * 1.85 + curl * 0.16);
      vec3 detail = texture(uDetailTexture, detailCoord).rgb;
      float detailFbm = detail.r * 0.58 + detail.g * 0.29 + detail.b * 0.13;
      worleyErosion = mix(worleyErosion, detailFbm, uDetail);
    }

    float erosion = mix(1.0, smoothstep(0.05, 0.96, 1.0 - worleyErosion), uErosion);
    float typedLift = mix(0.76, 1.24, envelope.b);
    float shapeDensity = pow(saturate(cloud * profile), mix(1.65, 0.92, uShape));

    return shapeDensity * erosion * typedLift * uDensity;
  }

  float lightTransmittance(vec3 p, vec3 lightDir, float cosTheta, float basePhase, vec3 windOffset) {
    float opticalDepth = 0.0;
    float stepSize = 0.085;

    for (int i = 0; i < MAX_LIGHT_STEPS; i++) {
      if (i >= uLightSteps) break;
      vec3 samplePoint = p + lightDir * (float(i) + 0.5) * stepSize;
      opticalDepth += sampleDensityUv(samplePoint, true, windOffset) * stepSize;
      if (opticalDepth > 1.25) break;
    }

    float beer = exp(-opticalDepth * uLightAbsorption);
    float scatter = multipleScattering(opticalDepth * uLightAbsorption, cosTheta, basePhase);
    return mix(beer, scatter * 4.4, uMultiScattering);
  }

  vec3 getRayDirection(vec2 uv) {
    vec4 clip = vec4(uv * 2.0 - 1.0, 1.0, 1.0);
    vec4 view = uProjectionInverse * clip;
    view /= view.w;
    vec3 world = (uCameraMatrixWorld * vec4(view.xyz, 1.0)).xyz;
    return normalize(world - uCameraPosition);
  }

  void main() {
    vec3 rayOrigin = uCameraPosition;
    vec3 rayDirection = getRayDirection(vUv);
    vec2 bounds = intersectAabb(rayOrigin, rayDirection, uBoxMin, uBoxMax);
    bounds.x = max(bounds.x, 0.0);

    if (bounds.x >= bounds.y) {
      discard;
    }

    float rayLength = bounds.y - bounds.x;
    float primarySteps = float(max(uPrimarySteps, 1));
    float baseStepSize = rayLength / primarySteps;
    float stepSize = baseStepSize;
    float jitter = texture(uJitterTexture, mod(gl_FragCoord.xy, 64.0) / 64.0).r;
    float t = bounds.x + jitter * stepSize;
    bool refined = false;

    vec3 accumulated = vec3(0.0);
    float transmittance = 1.0;
    vec3 windOffset = getWindOffset();
    vec3 lightDir = uLightDir;
    float cosTheta = dot(rayDirection, -lightDir);
    float phase = dualLobePhase(cosTheta);
    vec3 cloudShadow = mix(uCloudShadow, uCloudWhite, 0.28);
    vec3 directLight = uSunColor * uSunBrightness * (0.48 + phase * 8.0);

    for (int i = 0; i < MAX_PRIMARY_STEPS; i++) {
      if (i >= uPrimarySteps || t > bounds.y || transmittance < 0.012) break;

      vec3 worldPos = rayOrigin + rayDirection * t;
      vec3 cloudUv = worldToCloudUv(worldPos);
      float density = sampleDensityUv(cloudUv, false, windOffset);

      if (density > 0.002) {
        if (!refined) {
          t = max(bounds.x, t - stepSize * 0.75);
          stepSize *= 0.5;
          refined = true;
          continue;
        }

        float vertical = saturate(cloudUv.y);
        float lightEnergy = max(lightTransmittance(cloudUv, lightDir, cosTheta, phase, windOffset), 0.18);
        vec3 albedo = mix(cloudShadow, uCloudWhite, smoothstep(0.0, 0.78, vertical));
        vec3 direct = directLight * lightEnergy;
        vec3 ambient = uAmbientColor * (0.34 + vertical * 0.52);
        vec3 bounce = uSkyBounceColor * (1.0 - lightEnergy) * (0.22 + vertical * 0.28);
        vec3 source = albedo * (direct + ambient + bounce);

        float alphaStep = 1.0 - exp(-density * stepSize * 1.85);
        accumulated += transmittance * source * alphaStep;
        transmittance *= 1.0 - alphaStep;
      } else if (refined) {
        stepSize = min(stepSize * 1.08, baseStepSize);
      } else {
        t += stepSize * 0.82;
      }

      t += stepSize;
    }

    float alpha = saturate(1.0 - transmittance);
    outColor = vec4(accumulated * 1.12, alpha);
  }
`;

export const CLOUD_BLUR_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uSourceTexture;
  uniform vec2 uTexelSize;
  uniform vec2 uDirection;
  uniform float uRadius;

  in vec2 vUv;
  out vec4 outColor;

  vec4 weightedSample(vec2 offset, float weight) {
    return texture(uSourceTexture, vUv + offset) * weight;
  }

  void main() {
    vec2 offset = uTexelSize * uDirection * uRadius;
    vec4 blurred =
      weightedSample(-offset, 0.25) +
      weightedSample(vec2(0.0), 0.5) +
      weightedSample(offset, 0.25);

    if (blurred.a <= 0.001) {
      discard;
    }

    outColor = blurred;
  }
`;

export const COMPOSITE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uCloudTexture;
  uniform vec2 uResolution;
  uniform float uPixelSize;
  uniform float uColorLevels;

  in vec2 vUv;
  out vec4 outColor;

  void main() {
    vec2 sampleUv = vUv;
    if (uPixelSize > 1.0) {
      // Snap to the center of each pixelation cell so the whole block
      // collapses onto a single sample of the (already raymarched +
      // optionally blurred) cloud texture.
      vec2 cell = floor(gl_FragCoord.xy / uPixelSize);
      sampleUv = (cell * uPixelSize + uPixelSize * 0.5) / uResolution;
    }

    vec4 cloud = texture(uCloudTexture, sampleUv);
    if (cloud.a <= 0.001) {
      discard;
    }

    if (uColorLevels < 64.0) {
      // Round-to-nearest quantization so both pure black (0) and pure
      // white (1) survive untouched; floor-only would push 1.0 over the
      // top step and clip highlights.
      float levels = max(uColorLevels, 2.0);
      cloud.rgb = floor(cloud.rgb * (levels - 1.0) + 0.5) / (levels - 1.0);
    }

    outColor = cloud;
  }
`;
