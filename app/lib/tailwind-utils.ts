const objectPosition = {
  top: "object-top",
  center: "object-center",
  bottom: "object-bottom",
} as const;

type ObjectPosition = keyof typeof objectPosition;

export function twObjectPosition(position: ObjectPosition) {
  return objectPosition[position];
}
