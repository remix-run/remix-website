import { describe, expect, it } from "vitest";
import { resolveAppNavFrameTarget } from "./app-navigation";

describe("resolveAppNavFrameTarget", () => {
  it("prefers pending frame state for fresh navigations", () => {
    expect(
      resolveAppNavFrameTarget({
        navigationType: "push",
        currentFrameName: "app",
        stateFrameName: null,
        pendingFrameName: "app",
      }),
    ).toEqual({
      nextFrameName: "app",
      pendingFrameName: null,
    });
  });

  it("prefers destination state for traversal", () => {
    expect(
      resolveAppNavFrameTarget({
        navigationType: "traverse",
        currentFrameName: "app",
        stateFrameName: "modal",
        pendingFrameName: "app",
      }),
    ).toEqual({
      nextFrameName: "modal",
      pendingFrameName: null,
    });
  });

  it("falls back to the current frame on traversal without state", () => {
    expect(
      resolveAppNavFrameTarget({
        navigationType: "traverse",
        currentFrameName: "app",
        stateFrameName: null,
        pendingFrameName: "stale",
      }),
    ).toEqual({
      nextFrameName: "app",
      pendingFrameName: null,
    });
  });
});
