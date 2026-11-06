import { breakpoints } from "../../../../ui/public/styles/theme.ts";
import { clamp01 } from "../math.ts";

export const PACKAGE_LOGOS = [
  {
    src: "/landing/remix-package-auth.svg",
    alt: "Auth",
    ratio: "904 / 245",
    maxWidth: 440,
    stageWidth: 0.85,
  },
  {
    src: "/landing/remix-package-routing.svg",
    alt: "Routing",
    ratio: "1440 / 288",
    maxWidth: 460,
    stageWidth: 0.86,
  },
  {
    src: "/landing/remix-package-data.svg",
    alt: "Data",
    ratio: "577 / 290",
    maxWidth: 310,
    stageWidth: 0.65,
  },
  {
    src: "/landing/remix-package-session.svg",
    alt: "Session",
    ratio: "797 / 288",
    maxWidth: 360,
    stageWidth: 0.72,
  },
  {
    src: "/landing/remix-package-component.svg",
    alt: "Component",
    ratio: "1438 / 414",
    maxWidth: 440,
    stageWidth: 0.85,
  },
] as const;

const STAGGER = 0.18;
const FADE_IN = 0.16;
const FADE_OUT_VIEWPORT_START = 0.45;
const FADE_OUT_VIEWPORT_END = 0.1;

export type PanelRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type LayoutInput = {
  /** Panel rect in document coordinates. */
  panel: PanelRect;
  scrollY: number;
  viewportWidth: number;
  viewportHeight: number;
  reduceMotion: boolean;
};

/**
 * Stacks the package logos down the panel and fades each one in, staggered,
 * as the panel scrolls into view, then fades them all out as the panel's
 * bottom edge approaches the top of the viewport.
 */
export function layoutPackageLogos({
  panel,
  scrollY,
  viewportWidth,
  viewportHeight,
  reduceMotion,
}: LayoutInput) {
  let revealDistance = Math.min(900, Math.max(650, viewportHeight));
  let revealProgress = clamp01(
    (scrollY + viewportHeight * 0.68 - panel.top) / revealDistance,
  );
  let panelBottomInViewport = panel.top + panel.height - scrollY;
  let inSection =
    panel.top < scrollY + viewportHeight && panelBottomInViewport > 0;
  let fadeOut = clamp01(
    (panelBottomInViewport - viewportHeight * FADE_OUT_VIEWPORT_END) /
      (viewportHeight * (FADE_OUT_VIEWPORT_START - FADE_OUT_VIEWPORT_END)),
  );

  let stackedHeight = panel.height * 0.94;
  let logoScale = viewportWidth < Number.parseInt(breakpoints.md, 10) ? 0.8 : 1;
  let sizes = PACKAGE_LOGOS.map((logo) => {
    let [intrinsicWidth, intrinsicHeight] = logo.ratio
      .split("/")
      .map((value) => parseFloat(value.trim()));
    let width =
      Math.min(logo.maxWidth, panel.width * logo.stageWidth) * logoScale;
    return { width, height: width * (intrinsicHeight / intrinsicWidth) };
  });
  let totalLogoHeight = sizes.reduce((total, size) => total + size.height, 0);
  let rowGap = (stackedHeight - totalLogoHeight) / (PACKAGE_LOGOS.length - 1);

  let top = 0;
  let logos = sizes.map((size, index) => {
    let fadeIn = clamp01((revealProgress - index * STAGGER) / FADE_IN);
    let logo = {
      ...size,
      top,
      right: (panel.width - size.width) / 2,
      opacity: reduceMotion && inSection ? 1 : fadeIn * fadeOut,
    };
    top = top + size.height + rowGap;
    return logo;
  });

  return {
    top: panel.top + (panel.height - stackedHeight) / 2,
    height: stackedHeight,
    logos,
  };
}
