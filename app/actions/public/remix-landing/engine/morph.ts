import { clamp } from "../math.ts";

export type MorphBlend = {
  fromIndex: number;
  toIndex: number;
  blend: number;
};

export function getMorphBlend(
  morphValue: number,
  maxValue: number,
  out: MorphBlend = { fromIndex: 0, toIndex: 0, blend: 0 },
): MorphBlend {
  let clamped = clamp(morphValue, 0, maxValue);
  let fromIndex = Math.min(Math.floor(clamped), maxValue - 1);
  let toIndex = fromIndex + 1;
  let blend = clamped - fromIndex;

  if (clamped >= maxValue) {
    out.fromIndex = maxValue;
    out.toIndex = maxValue;
    out.blend = 0;
    return out;
  }

  out.fromIndex = fromIndex;
  out.toIndex = toIndex;
  out.blend = blend;
  return out;
}
