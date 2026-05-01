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

const MODEL_TEX_W = 512;
const MODEL_TEX_H = 256;

const VERTEX_SHADER = /* glsl */ `#version 300 es

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
  uniform float uCarLaneOffset;
  uniform float uCarLaneActivity;
  uniform float uCarPosY;
  uniform float uMorphT;
  uniform float uColorMode;
  uniform float uCtrlA[8];
  uniform float uCtrlB[8];
  uniform float uModelCount0;
  uniform float uModelCount1;
  uniform float uModelCount2;
  uniform float uModelCount3;
  uniform sampler2D uModelTex0;
  uniform sampler2D uModelTex1;
  uniform sampler2D uModelTex2;
  uniform sampler2D uModelTex3;

  /* ── helpers ───────────────────────────────────────────── */

  vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float hp = h * 6.0;
    float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
    float m = l - c * 0.5;
    vec3 rgb;
    if      (hp < 1.0) rgb = vec3(c, x, 0.0);
    else if (hp < 2.0) rgb = vec3(x, c, 0.0);
    else if (hp < 3.0) rgb = vec3(0.0, c, x);
    else if (hp < 4.0) rgb = vec3(0.0, x, c);
    else if (hp < 5.0) rgb = vec3(x, 0.0, c);
    else               rgb = vec3(c, 0.0, x);
    return rgb + m;
  }

  float grHash(float fi, float k) {
    float hi = floor(fi * 0.0078125);
    float lo = fi - hi * 128.0;
    return fract(fract(hi * fract(128.0 * k)) + fract(lo * k));
  }

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  vec3 brandGradient(float ratio, float t) {
    float hue = fract(ratio + t * 0.51);
    float sat = 0.8 + sin(t + ratio * 10.0) * 0.2;
    float lum = 0.55 + 0.35 * cos(t + ratio * 3.14159);
    return hsl2rgb(hue, clamp(sat, 0.5, 1.0), clamp(lum, 0.2, 0.85));
  }

  // Each preset binds a fixed model slot (Logo→0, Racecar→1, Runner→2,
  // RacetrackCar→3), so callers pass the matching sampler+count directly
  // instead of routing through a runtime if-cascade. This avoids two
  // dynamic-uniform branches per particle for every model-driven preset.
  vec3 sampleModelTex(sampler2D tex, float cnt, float fi) {
    float idx = (cnt > 0.0) ? mod(fi, cnt) : 0.0;
    float u = (mod(idx, ${MODEL_TEX_W}.0) + 0.5) / ${MODEL_TEX_W}.0;
    float v = (floor(idx / ${MODEL_TEX_W}.0) + 0.5) / ${MODEL_TEX_H}.0;
    return texture(tex, vec2(u, v)).xyz;
  }

  /* ── preset 0: Remix Logo ─────────────────────────────── */

  void presetRemixLogo(float fi, int cnt, float time,
    float c0, float c1, float c2, float c3,
    float c4, float c5, float c6, float c7,
    out vec3 pos, out vec3 col)
  {
    float scale = c0;
    float rX = c1 * 0.01745329;
    float rY = c2 * 0.01745329 - time * c4;
    float rZ = c3 * 0.01745329;

    vec3 mp = sampleModelTex(uModelTex0, uModelCount0, fi);
    float px = mp.x * scale;
    float py = mp.y * scale;
    float pz = mp.z * scale;

    float cx = cos(rX), sx = sin(rX);
    float t1y = py * cx - pz * sx;
    float t1z = py * sx + pz * cx;
    py = t1y; pz = t1z;

    float cy = cos(rY), sy = sin(rY);
    float t2x = px * cy + pz * sy;
    float t2z = -px * sy + pz * cy;
    px = t2x; pz = t2z;

    float cz = cos(rZ), sz = sin(rZ);
    float t3x = px * cz - py * sz;
    float t3y = px * sz + py * cz;
    px = t3x; py = t3y;

    pos = vec3(px, py, pz);

    float height = mp.y * 0.5 + 0.5;
    float pulse = 1.0 + 0.1 * sin(time * 2.5 + fi * 0.02);
    float lum = (0.3 + 0.5 * height) * pulse;
    col = hsl2rgb(0.55 + 0.1 * height, 0.6, lum);
  }

  /* ── preset 1: Racecar ────────────────────────────────── */

  void presetRacecar(float fi, int cnt, float time,
    float c0, float c1, float c2, float c3,
    float c4, float c5, float c6, float c7,
    out vec3 pos, out vec3 col)
  {
    float scale = c0;
    float spin = c1;
    float shimmer = c2;
    float rotZ = c3 * 0.01745329;

    float angle = time * spin;
    float cosA = cos(angle), sinA = sin(angle);

    vec3 mp = sampleModelTex(uModelTex1, uModelCount1, fi);
    float mx = mp.x * scale;
    float my = mp.y * scale;
    float mz = mp.z * scale;

    float px = mx * cosA - mz * sinA;
    float py = my;
    float pz = mx * sinA + mz * cosA;

    float cz = cos(rotZ), sz = sin(rotZ);
    float qx = px * cz - py * sz;
    float qy = px * sz + py * cz;
    pos = vec3(qx, qy, pz);

    float height = mp.y * 0.5 + 0.5;
    float pulse = 1.0 + shimmer * 0.1 * sin(time * 2.5 + fi * 0.02);
    float lum = (0.3 + 0.5 * height) * pulse;
    col = hsl2rgb(0.55 + 0.1 * height, 0.6, lum);
  }

  /* ── preset 2: Racetrack ──────────────────────────────── */

  void presetRacetrack(float fi, int cnt, float time,
    float c0, float c1, float c2, float c3,
    float c4, float c5, float c6, float c7,
    out vec3 pos, out vec3 col)
  {
    float speed = c0 + c7;
    float baseSpeed = c0;
    float trackW = c1;
    float curveAmp = c2;
    float hillH = c3;
    float fogMode = c4;
    float curveSway = c6;

    if (curveSway > 0.0) {
      curveAmp *= sin(time * curveSway * baseSpeed);
    }

    float zNear = 72.0;
    float zFar  = -100.0;
    float trackY = -24.0;
    float PI = 3.14159265;
    float hillWidth = 50.0;
    float fcnt = float(cnt);

    float starFrac = c5;
    float groundFrac = 1.0 - starFrac;

    int surfaceEnd   = int(floor(fcnt * 0.10 * groundFrac));
    int leftCurbEnd  = surfaceEnd + int(floor(fcnt * 0.05 * groundFrac));
    int rightCurbEnd = leftCurbEnd + int(floor(fcnt * 0.05 * groundFrac));
    int leftHillEnd  = rightCurbEnd + int(floor(fcnt * 0.40 * groundFrac));
    int rightHillEnd = leftHillEnd + int(floor(fcnt * 0.40 * groundFrac));
    int idx = int(fi);

    if (idx < surfaceEnd) {
      float along = fract(grHash(fi, 0.6180339887) - time * speed * 0.12);
      float across = hash11(fi + 0.5);
      float z = zNear + (zFar - zNear) * along * along;
      float cx = sin(along * PI * 3.0) * curveAmp
               + sin(along * PI * 5.5 + 2.0) * curveAmp * 0.3;
      float perspN = 1.0 - along * 0.5;
      float lane = (across - 0.5) * trackW * perspN;
      float jX = (hash11(fi * 1.731) - 0.5) * 1.4;
      float jY = (hash11(fi * 3.917) - 0.5) * 0.35;
      pos = vec3(cx + lane + jX, trackY + jY, z);
      float tarmac = 0.06 + 0.03 * hash11(fi * 2.473);
      col = vec3(tarmac);
      if (fogMode < 0.5) col *= (1.0 - along);

    } else if (idx < leftCurbEnd) {
      float bi = float(idx - surfaceEnd);
      float bHash = grHash(bi, 0.6180339887);
      float bt = fract(bHash - time * speed * 0.12);
      float bz = zNear + (zFar - zNear) * bt * bt;
      float bcx = sin(bt * PI * 3.0) * curveAmp
                + sin(bt * PI * 5.5 + 2.0) * curveAmp * 0.3;
      float bN = 1.0 - bt * 0.5;
      float strip = mod(bi, 8.0) / 8.0 * 1.5;
      pos = vec3(bcx - trackW * 0.5 * bN - strip, trackY, bz);
      col = (mod(floor(bHash * 35.0), 2.0) < 0.5)
        ? hsl2rgb(0.0, 0.85, 0.45) : vec3(0.85);
      if (fogMode < 0.5) col *= (1.0 - bt);

    } else if (idx < rightCurbEnd) {
      float bi = float(idx - leftCurbEnd);
      float bHash = grHash(bi, 0.6180339887);
      float bt = fract(bHash - time * speed * 0.12);
      float bz = zNear + (zFar - zNear) * bt * bt;
      float bcx = sin(bt * PI * 3.0) * curveAmp
                + sin(bt * PI * 5.5 + 2.0) * curveAmp * 0.3;
      float bN = 1.0 - bt * 0.5;
      float strip = mod(bi, 8.0) / 8.0 * 1.5;
      pos = vec3(bcx + trackW * 0.5 * bN + strip, trackY, bz);
      col = (mod(floor(bHash * 35.0), 2.0) < 0.5)
        ? hsl2rgb(0.0, 0.85, 0.45) : vec3(0.85);
      if (fogMode < 0.5) col *= (1.0 - bt);

    } else if (idx < leftHillEnd) {
      float hi = float(idx - rightCurbEnd);
      float ht = fract(grHash(hi, 0.6180339887) - time * speed * 0.12);
      float hz = zNear + (zFar - zNear) * ht * ht;
      float hcx = sin(ht * PI * 3.0) * curveAmp
                + sin(ht * PI * 5.5 + 2.0) * curveAmp * 0.3;
      float hN = 1.0 - ht * 0.5;
      float lat = hash11(hi + 0.5);
      float xOff = (trackW * 0.5 + 1.5 + lat * hillWidth) * hN;
      float jX = (hash11(hi * 2.317) - 0.5) * 1.2;
      float jZ = (hash11(hi * 4.193) - 0.5) * 1.0;
      float nx = lat * 3.5;
      float nz = ht * 8.0;
      float ridge = sin(nz * 1.1 + nx * 0.7) * 0.5 + 0.5;
      float broad = sin(nz * 0.4 + nx * 1.3 + 2.0) * 0.5 + 0.5;
      float fine  = sin(nz * 3.7 + nx * 2.1 + 5.0) * 0.3;
      float slope = lat * 0.4 + 0.1;
      float nearCurb = 1.0 - exp(-lat * 6.0);
      float elev = (ridge * 0.5 + broad * 0.35 + fine * 0.15 + slope) * hillH * nearCurb;
      pos = vec3(hcx - xOff + jX, trackY + elev, hz + jZ);
      float eN = min(elev / hillH, 1.0);
      col = hsl2rgb(0.30 - eN * 0.06, 0.75 - eN * 0.35, 0.08 + eN * 0.14 + 0.03 * hash11(hi * 1.73));
      if (fogMode < 0.5) col *= (1.0 - ht);

    } else if (idx < rightHillEnd) {
      float hi = float(idx - leftHillEnd);
      float ht = fract(grHash(hi, 0.6180339887) - time * speed * 0.12);
      float hz = zNear + (zFar - zNear) * ht * ht;
      float hcx = sin(ht * PI * 3.0) * curveAmp
                + sin(ht * PI * 5.5 + 2.0) * curveAmp * 0.3;
      float hN = 1.0 - ht * 0.5;
      float lat = hash11(hi + 7.1);
      float xOff = (trackW * 0.5 + 1.5 + lat * hillWidth) * hN;
      float jX = (hash11(hi * 2.713) - 0.5) * 1.2;
      float jZ = (hash11(hi * 5.371) - 0.5) * 1.0;
      float nx = lat * 3.5;
      float nz = ht * 8.0;
      float ridge = sin(nz * 1.1 + nx * 0.7 + 1.5) * 0.5 + 0.5;
      float broad = sin(nz * 0.4 + nx * 1.3 + 4.0) * 0.5 + 0.5;
      float fine  = sin(nz * 3.7 + nx * 2.1 + 8.0) * 0.3;
      float slope = lat * 0.4 + 0.1;
      float nearCurb = 1.0 - exp(-lat * 6.0);
      float elev = (ridge * 0.5 + broad * 0.35 + fine * 0.15 + slope) * hillH * nearCurb;
      pos = vec3(hcx + xOff + jX, trackY + elev, hz + jZ);
      float eN = min(elev / hillH, 1.0);
      col = hsl2rgb(0.30 - eN * 0.06, 0.75 - eN * 0.35, 0.08 + eN * 0.14 + 0.03 * hash11(hi * 1.73));
      if (fogMode < 0.5) col *= (1.0 - ht);

    } else {
      float si = float(idx - rightHillEnd);
      float st = fract(grHash(si, 0.6180339887) - time * speed * 0.12);
      float sz = zNear + (zFar - zNear) * st * st;
      float perspN = 1.0 - st * 0.5;

      float sx = (grHash(si, 0.5381) - 0.5) * 180.0 * perspN;
      float rawY = grHash(si, 0.3571);
      float sy = trackY + hillH * 0.8 + rawY * 48.0;

      pos = vec3(sx, sy, sz);

      float brightness = pow(grHash(si, 0.4231), 2.5);
      float twinkle = 0.9 + 0.1 * sin(time * (3.0 + grHash(si, 0.9137) * 5.0) + si * 1.73);
      float lum = (0.15 + 0.85 * brightness) * twinkle;
      float warmth = grHash(si, 0.2917);
      float hue = mix(0.6, 0.12, warmth);
      float sat = 0.1 + 0.15 * abs(warmth - 0.5);
      col = hsl2rgb(hue, sat, lum);
      if (fogMode < 0.5) col *= (1.0 - st * 0.3);
    }
  }

  /* ── preset 3: Model Kit Runner ──────────────────────── */

  void presetRunner(float fi, int cnt, float time,
    float c0, float c1, float c2, float c3,
    float c4, float c5, float c6, float c7,
    out vec3 pos, out vec3 col)
  {
    float scale = c0;
    float spin = c1;
    float shimmer = c2;
    float rotZ = c3 * 0.01745329;

    float angle = time * spin;
    float cosA = cos(angle), sinA = sin(angle);

    vec3 mp = sampleModelTex(uModelTex2, uModelCount2, fi);
    float mx = mp.x * scale;
    float my = mp.y * scale;
    float mz = mp.z * scale;

    float px = mx * cosA - mz * sinA;
    float py = my;
    float pz = mx * sinA + mz * cosA;

    float cz = cos(rotZ), sz = sin(rotZ);
    float qx = px * cz - py * sz;
    float qy = px * sz + py * cz;
    pos = vec3(qx, qy, pz);

    float t = fi / float(cnt);
    float height = mp.y * 0.5 + 0.5;
    float pulse = 1.0 + shimmer * 0.1 * sin(time * 2.5 + fi * 0.02);
    float lum = (0.3 + 0.5 * height) * pulse;
    col = hsl2rgb(0.55 + 0.1 * height, 0.6, lum);
  }

  /* ── preset 4: 4D Tesseract ───────────────────────────── */

  vec4 tessVert(int idx) {
    float fi = float(idx);
    return vec4(
      mod(fi, 2.0) * 2.0 - 1.0,
      mod(floor(fi / 2.0), 2.0) * 2.0 - 1.0,
      mod(floor(fi / 4.0), 2.0) * 2.0 - 1.0,
      floor(fi / 8.0) * 2.0 - 1.0
    );
  }

  void tessEdge(int eIdx, out vec4 vA, out vec4 vB) {
    int dim = eIdx / 8;
    int sub = eIdx - dim * 8;
    int idxA, idxB;
    if (dim == 0) {
      idxA = sub * 2;
      idxB = idxA + 1;
    } else if (dim == 1) {
      int lo = sub - (sub / 2) * 2;
      int hi = sub / 2;
      idxA = lo + hi * 4;
      idxB = idxA + 2;
    } else if (dim == 2) {
      int lo = sub - (sub / 4) * 4;
      int hi = sub / 4;
      idxA = lo + hi * 8;
      idxB = idxA + 4;
    } else {
      idxA = sub;
      idxB = sub + 8;
    }
    vA = tessVert(idxA);
    vB = tessVert(idxB);
  }

  void presetTesseract(float fi, int cnt, float time,
    float c0, float c1, float c2, float c3,
    float c4, float c5, float c6, float c7,
    out vec3 pos, out vec3 col)
  {
    float speedXW = c0;
    float speedYZ = c1;
    float projDist = c2;
    float edgeDens = c3;

    float ppef = max(float(cnt) / 32.0, 1.0);
    int eIdx = int(min(fi / ppef, 31.0));
    float t = mod(fi, ppef) / ppef;

    vec4 vA, vB;
    tessEdge(eIdx, vA, vB);

    float noise = sin(fi * 7.37) * 0.1 * edgeDens;
    float px = vA.x + (vB.x - vA.x) * t + noise;
    float py = vA.y + (vB.y - vA.y) * t + cos(fi * 3.91) * 0.1 * edgeDens;
    float pz = vA.z + (vB.z - vA.z) * t + sin(fi * 5.13) * 0.1 * edgeDens;
    float pw = vA.w + (vB.w - vA.w) * t + cos(fi * 2.17) * 0.1 * edgeDens;

    float axw = time * speedXW;
    float cXW = cos(axw), sXW = sin(axw);
    float rx = px * cXW - pw * sXW;
    float rw = px * sXW + pw * cXW;

    float ayz = time * speedYZ;
    float cYZ = cos(ayz), sYZ = sin(ayz);
    float ry = py * cYZ - pz * sYZ;
    float rz = py * sYZ + pz * cYZ;

    float sc = projDist / (projDist - rw);
    pos = vec3(rx * sc * 20.0, ry * sc * 20.0, rz * sc * 20.0);

    float h = (float(eIdx) / 32.0) * 0.8 + 0.1;
    float l = 0.4 + 0.3 * sc + 0.1 * sin(time + float(eIdx));
    col = hsl2rgb(h, 0.7, clamp(l, 0.2, 1.0));
  }

  /* ── preset 5: Racetrack + Car ─────────────────────────── */

  void presetRacetrackCar(float fi, int cnt, float time,
    float c0, float c1, float c2, float c3,
    float c4, float c5, float c6, float c7,
    out vec3 pos, out vec3 col)
  {
    float fcnt = float(cnt);
    int trackEnd = int(floor(fcnt * 0.88));
    int carStart = int(floor(fcnt * 0.92));

    float carScale = 7.5;
    float trackY = -24.0;
    float carZ = 52.0;
    float carY = trackY + carScale * 0.35 + uCarPosY;

    float along = sqrt((72.0 - carZ) / (72.0 - (-100.0)));
    float perspN = 1.0 - along * 0.5;
    float halfW = c1 * 0.5 * perspN;
    float laneX = clamp(uCarLaneOffset, -1.0, 1.0) * halfW;

    int carCount = int(fcnt) - carStart;
    int wheelTotal = carCount / 5;
    int wheelStart = int(fcnt) - wheelTotal;

    float wheelWidth = c3;
    float wheelBase = c4;
    float wheelTrk = c5;
    float wheelYPos = c6;
    float wheelZOff = c7;
    float halfTrk = wheelTrk * 0.5;
    float frontZ = wheelBase * 0.5 - 0.02 + wheelZOff;
    float rearZ = -wheelBase * 0.5 - 0.02 + wheelZOff;

    vec3 wheels[4];
    wheels[0] = vec3(-halfTrk, wheelYPos,  frontZ);
    wheels[1] = vec3( halfTrk, wheelYPos,  frontZ);
    wheels[2] = vec3(-halfTrk, wheelYPos,  rearZ);
    wheels[3] = vec3( halfTrk, wheelYPos,  rearZ);

    float wheelDiscR = 0.12;
    float spinAngle = time * c0 * 20.0;
    float goldenAngle = 2.39996323;

    if (int(fi) >= wheelStart) {
      int wfi = int(fi) - wheelStart;
      int perWheel = wheelTotal / 4;
      int wIdx = min(wfi / perWheel, 3);
      int localIdx = wfi - wIdx * perWheel;
      float t = float(localIdx) / float(perWheel);
      float r = sqrt(t) * wheelDiscR;
      float theta = float(localIdx) * goldenAngle + spinAngle;
      float xSpread = (fract(float(localIdx) * 0.7071) - 0.5) * wheelWidth;

      vec3 wc = wheels[wIdx];
      vec3 mp = vec3(wc.x + xSpread, wc.y + r * cos(theta), wc.z + r * sin(theta));

      float mx = mp.x * carScale;
      float my = mp.y * carScale;
      float mz = mp.z * carScale;

      pos = vec3(mx + laneX, my + carY, -mz + carZ);

      float height = wc.y * 0.5 + 0.5;
      float pulse = 1.0 + 0.1 * sin(time * 2.5 + float(localIdx) * 0.02);
      float lum = (0.3 + 0.5 * height) * pulse;
      col = hsl2rgb(0.55 + 0.1 * height, 0.6, lum);

    } else if (int(fi) >= carStart) {
      float carFi = float(int(fi) - carStart);
      float spreadFi = floor(fract(carFi * 0.6180339887) * uModelCount3);
      vec3 mp = sampleModelTex(uModelTex3, uModelCount3, spreadFi);

      float mx = mp.x * carScale;
      float my = mp.y * carScale;
      float mz = mp.z * carScale;

      pos = vec3(mx + laneX, my + carY, -mz + carZ);

      float height = mp.y * 0.5 + 0.5;
      float pulse = 1.0 + 0.1 * sin(time * 2.5 + carFi * 0.02);
      float lum = (0.3 + 0.5 * height) * pulse;
      col = hsl2rgb(0.55 + 0.1 * height, 0.6, lum);

    } else if (int(fi) >= trackEnd) {
      float trailFi = float(int(fi) - trackEnd);
      float speed = c0;

      float ringCount = 9.0;
      float ringSlot = floor(hash11(trailFi) * ringCount);
      float age = fract(ringSlot / ringCount + time * speed * 0.15);
      float trailDepth = 9.0;
      float rearOffset = carScale * 1.0;
      float tz = carZ + rearOffset + age * trailDepth;

      float rectW = 6.0 * (1.0 - age);
      float rectH = 3.0 * (1.0 - age);
      float halfRW = rectW * 0.5;
      float halfRH = rectH * 0.5;
      float perim = 2.0 * (rectW + rectH);
      float d = hash11(trailFi + 0.5) * perim;
      float px, py;
      if (d < rectW) {
        px = d - halfRW;
        py = halfRH;
      } else if (d < rectW + rectH) {
        px = halfRW;
        py = halfRH - (d - rectW);
      } else if (d < 2.0 * rectW + rectH) {
        px = halfRW - (d - rectW - rectH);
        py = -halfRH;
      } else {
        px = -halfRW;
        py = -halfRH + (d - 2.0 * rectW - rectH);
      }
      float jit = (hash11(trailFi * 2.317) - 0.5) * 0.05;
      px += jit;
      py += (hash11(trailFi * 3.491) - 0.5) * 0.05;

      float trailLaneX = laneX;
      float waveSway = sin(time * speed * 2.0 - age * 8.0) * laneX * age * 0.5 * uCarLaneActivity;
      float tx = trailLaneX + waveSway + px;
      float ty = carY + py;

      pos = vec3(tx, ty, tz);

      float ratio = fract(age + time * 0.08);
      vec3 gradCol = brandGradient(ratio, time * 0.25);
      float fade = (1.0 - age * age) * 0.1;
      col = gradCol * fade;

    } else {
      presetRacetrack(fi, trackEnd, time, c0, c1, c2, 7.8, 1.0, 0.02, 0.0, 0.0, pos, col);
    }
  }

  /* ── dispatch ─────────────────────────────────────────── */

  void computePreset(int id, float fi, int cnt, float time,
    float c0, float c1, float c2, float c3,
    float c4, float c5, float c6, float c7,
    out vec3 pos, out vec3 col)
  {
    // The integer 'id' is a ShaderId enum set up in ParticleCanvas
    // (SHADER_ID_TO_INT), not a position in the presets array. Keep the
    // JS-side map in sync whenever a branch is added or reordered here.
    if      (id == 0) presetRacetrack    (fi, cnt, time, c0,c1,c2,c3,c4,c5,c6,c7, pos, col);
    else if (id == 1) presetRacecar      (fi, cnt, time, c0,c1,c2,c3,c4,c5,c6,c7, pos, col);
    else if (id == 2) presetRunner       (fi, cnt, time, c0,c1,c2,c3,c4,c5,c6,c7, pos, col);
    else if (id == 3) presetRemixLogo    (fi, cnt, time, c0,c1,c2,c3,c4,c5,c6,c7, pos, col);
    else              presetRacetrackCar (fi, cnt, time, c0,c1,c2,c3,c4,c5,c6,c7, pos, col);
  }

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

const FRAGMENT_SHADER = /* glsl */ `#version 300 es

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
      // RawShaderMaterial: no Three prefix chunks (lights, fog, map, etc.).
      // Shaders carry their own `#version 300 es`, precisions, `position`
      // attribute (kept active via `_keepVertexAttribsActive`), and matrix
      // uniforms. `gl_VertexID` still drives particle identity (no index VBO).
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
