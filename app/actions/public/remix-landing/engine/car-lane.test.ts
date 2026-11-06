import { it } from "remix/test";
import { expect } from "remix/assert";
import { CarLane } from "./car-lane.ts";

it("eases toward the steering target and back to center", () => {
  let lane = new CarLane();
  for (let i = 0; i < 200; i++) lane.step(1);
  expect(lane.lane).toBeCloseTo(1);

  for (let i = 0; i < 200; i++) lane.step(0);
  expect(lane.lane).toBeCloseTo(0);
});

it("reports lane-change activity that decays once the lane holds", () => {
  let lane = new CarLane();
  lane.step(1);
  expect(lane.activity).toBe(1);

  for (let i = 0; i < 300; i++) lane.step(1);
  expect(lane.activity).toBeLessThan(0.01);
});
