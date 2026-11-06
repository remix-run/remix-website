import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { moveToFront } from "./keepsakes.tsx";

describe("moveToFront", () => {
  it("raises the grabbed item to the top and closes the gap it left", () => {
    let order = { a: 1, b: 2, c: 3, d: 4 };
    moveToFront(order, "b");
    expect(order).toEqual({ a: 1, b: 4, c: 2, d: 3 });
  });

  it("keeps the order unchanged when the top item is grabbed again", () => {
    let order = { a: 1, b: 2, c: 3 };
    moveToFront(order, "c");
    expect(order).toEqual({ a: 1, b: 2, c: 3 });
  });
});
