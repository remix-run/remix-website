import { expect } from "remix/assert";
import { it } from "remix/test";
import { presets } from "./presets.ts";

it("keeps the racecar rotation synchronized through the camera orbit", () => {
  const racecarIndex = presets.findIndex((preset) => preset.name === "Racecar");
  const racecar = presets[racecarIndex];
  const underTheHood = presets[racecarIndex + 1];

  expect(underTheHood.cameraTransition).toBe("orbit-left");
  expect(underTheHood.modelUrl).toBe(racecar.modelUrl);
  expect(underTheHood.modelSlot).toBe(racecar.modelSlot);
  expect(
    underTheHood.controls.find((control) => control.id === "spin")?.initial,
  ).toBe(racecar.controls.find((control) => control.id === "spin")?.initial);
});
