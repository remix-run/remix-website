import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { layoutPackageLogos } from "./package-logos-layout.ts";

let panel = { top: 2000, left: 100, width: 500, height: 1000 };
let viewport = { viewportWidth: 1280, viewportHeight: 800 };

describe("layoutPackageLogos", () => {
  it("stacks the logos down 94% of the panel, centered in both axes", () => {
    let layout = layoutPackageLogos({
      panel,
      scrollY: 0,
      ...viewport,
      reduceMotion: false,
    });

    expect(layout.height).toBeCloseTo(940);
    expect(layout.top).toBeCloseTo(2030);
    expect(layout.logos[0].top).toBe(0);
    let last = layout.logos[layout.logos.length - 1];
    expect(last.top + last.height).toBeCloseTo(940);
    for (let logo of layout.logos) {
      expect(logo.right * 2 + logo.width).toBeCloseTo(panel.width);
    }
    for (let i = 1; i < layout.logos.length; i++) {
      expect(layout.logos[i].top).toBeGreaterThan(layout.logos[i - 1].top);
    }
  });

  it("caps logos at their max width and shrinks them on narrow viewports", () => {
    let wide = layoutPackageLogos({
      panel: { ...panel, width: 2000 },
      scrollY: 0,
      ...viewport,
      reduceMotion: false,
    });
    let narrow = layoutPackageLogos({
      panel: { ...panel, width: 2000 },
      scrollY: 0,
      viewportWidth: 600,
      viewportHeight: 800,
      reduceMotion: false,
    });

    expect(wide.logos[0].width).toBe(440);
    expect(narrow.logos[0].width).toBeCloseTo(352);
  });

  it("reveals logos in order as the panel scrolls in, then fades them out", () => {
    let opacitiesAt = (scrollY: number) =>
      layoutPackageLogos({
        panel,
        scrollY,
        ...viewport,
        reduceMotion: false,
      }).logos.map((logo) => logo.opacity);

    expect(opacitiesAt(0)).toEqual([0, 0, 0, 0, 0]);

    let revealing = opacitiesAt(1756);
    expect(revealing[0]).toBe(1);
    expect(revealing[4]).toBe(0);
    for (let i = 1; i < revealing.length; i++) {
      expect(revealing[i]).toBeLessThanOrEqual(revealing[i - 1]);
    }

    expect(opacitiesAt(2600)).toEqual([1, 1, 1, 1, 1]);
    expect(opacitiesAt(3000)).toEqual([0, 0, 0, 0, 0]);
  });

  it("shows every logo while the panel is on screen with reduced motion", () => {
    let layoutAt = (scrollY: number) =>
      layoutPackageLogos({
        panel,
        scrollY,
        ...viewport,
        reduceMotion: true,
      }).logos.map((logo) => logo.opacity);

    expect(layoutAt(1500)).toEqual([1, 1, 1, 1, 1]);
    expect(layoutAt(0)).toEqual([0, 0, 0, 0, 0]);
  });
});
