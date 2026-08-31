import { Vector3 } from "three";
import { expect } from "remix/assert";
import { it } from "remix/test";
import { setDesiredCameraInto } from "./camera-transition.ts";
import type { Preset } from "./types.ts";

const preset = (overrides: Partial<Preset>): Preset => ({
  name: "Camera test",
  shaderId: "racecar",
  controls: [],
  separation: 0,
  info: { title: "Camera test", description: "Camera test" },
  ...overrides,
});

it("orbits between opposite views without passing through the model", () => {
  const presets = [
    preset({ cameraPosition: [0, 20, 80], cameraTarget: [0, 0, 0] }),
    preset({
      cameraPosition: [0, 8, -30],
      cameraTarget: [0, 0, 0],
      cameraTransition: "orbit-left",
    }),
  ];
  const position = new Vector3();
  const target = new Vector3();

  setDesiredCameraInto(presets, 0.5, position, target);

  expect(position.x).toBeCloseTo(55);
  expect(position.z).toBeCloseTo(0);
  expect(Math.hypot(position.x - target.x, position.z - target.z)).toBeCloseTo(
    55,
  );
});
