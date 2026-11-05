import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import {
  getLogoBox,
  getScrollProgress,
  ghostOpacity,
  stepGhosts,
  type LogoBox,
} from "./scroll-logo.tsx";

describe("getLogoBox", () => {
  it("collapses from the full-width hero to the corner over the first scroll", () => {
    let hero = getLogoBox(0, 1000, 24);
    expect(hero.width).toBe(1000);

    let collapsed = getLogoBox(10_000, 1000, 24);
    expect(collapsed.width).toBeLessThan(200);
    expect(collapsed.top).toBe(24);
    expect(getScrollProgress(10_000)).toBe(1);
  });
});

describe("stepGhosts", () => {
  it("lets each ghost trail the target and reports when they settle", () => {
    let target: LogoBox = { width: 100, top: 10 };
    let ghosts: LogoBox[] = [0, 1, 2, 3, 4].map(() => ({
      width: 500,
      top: 90,
    }));

    expect(stepGhosts(ghosts, target, 1 / 60, false)).toBe(true);
    expect(ghosts[0].width).toBeLessThan(ghosts[4].width);

    let frames = 0;
    while (stepGhosts(ghosts, target, 1 / 60, false)) frames++;
    expect(frames).toBeLessThan(120);
  });

  it("jumps straight to the target with reduced motion", () => {
    let ghosts: LogoBox[] = [{ width: 500, top: 90 }];
    expect(stepGhosts(ghosts, { width: 100, top: 10 }, 0, true)).toBe(false);
    expect(ghosts[0]).toEqual({ width: 100, top: 10 });
  });
});

describe("ghostOpacity", () => {
  it("hides ghosts that have caught up and dims later ghosts", () => {
    expect(ghostOpacity(0, 100, 100)).toBe(0);
    expect(ghostOpacity(0, 200, 100)).toBeGreaterThan(
      ghostOpacity(4, 200, 100),
    );
  });
});
