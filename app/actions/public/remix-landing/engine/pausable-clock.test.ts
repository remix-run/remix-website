import { expect } from "remix/assert";
import { it } from "remix/test";
import { PausableClock } from "./pausable-clock.ts";

it("holds animation time while paused and resumes without jumping", () => {
  const clock = new PausableClock();

  expect(clock.read(1, false)).toBe(1);
  expect(clock.read(2, true)).toBe(2);
  expect(clock.read(5, true)).toBe(2);
  expect(clock.read(6, false)).toBe(2);
  expect(clock.read(7, false)).toBe(3);
});
