export function getMorphBlend(
  morphValue: number,
  maxValue: number,
): {
  fromIndex: number;
  toIndex: number;
  blend: number;
} {
  const clamped = Math.max(0, Math.min(maxValue, morphValue));
  const fromIndex = Math.min(Math.floor(clamped), maxValue - 1);
  const toIndex = fromIndex + 1;
  const blend = clamped - fromIndex;

  if (clamped >= maxValue) {
    return { fromIndex: maxValue, toIndex: maxValue, blend: 0 };
  }

  return { fromIndex, toIndex, blend };
}
