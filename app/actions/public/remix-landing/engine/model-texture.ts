import { DataTexture, FloatType, NearestFilter, RGBAFormat } from "three";
import type { ModelData } from "./model-loader.ts";

const TEX_WIDTH = 512;
const TEX_HEIGHT = 256;

export function createModelTexture(model: ModelData): DataTexture {
  let data = packModelPositions(model.positions, TEX_WIDTH * TEX_HEIGHT);
  let tex = new DataTexture(data, TEX_WIDTH, TEX_HEIGHT, RGBAFormat, FloatType);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Packs xyz model positions into an RGBA float buffer with one texel per
 * point (alpha 0). Points beyond `texelCount` are dropped and unused texels
 * stay zero.
 */
export function packModelPositions(
  positions: ArrayLike<number>,
  texelCount: number,
): Float32Array {
  let data = new Float32Array(texelCount * 4);
  let count = Math.min(Math.floor(positions.length / 3), texelCount);
  for (let i = 0; i < count; i++) {
    data[i * 4] = positions[i * 3];
    data[i * 4 + 1] = positions[i * 3 + 1];
    data[i * 4 + 2] = positions[i * 3 + 2];
  }
  return data;
}
