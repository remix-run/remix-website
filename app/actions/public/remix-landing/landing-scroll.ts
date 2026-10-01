import { presets } from "./engine/presets.ts";
import { clamp } from "./utils/math.ts";
import {
  initReducedMotion,
  motionScrollBehavior,
  reducedMotion,
} from "./utils/reduced-motion.ts";

export type LandingScrollState = {
  /** Continuous preset position, snapped to `activeIndex` for reduced motion. */
  morphValue: number;
  /** Preset/section nearest to the current scroll position. */
  activeIndex: number;
  scrollY: number;
};

/**
 * One scroll tracker shared by every landing-page client entry. Section stops
 * and morph values are measured once per animation frame, however many
 * hydrated islands read them.
 */
export const landingScroll = createLandingScroll();

const LANDING_SECTION_IDS = [
  "fully-stacked-web-framework",
  "everything-you-need",
  "smaller-mental-model",
  "re-rethinking-best-practices",
  "humans-and-agents",
  "test-drive",
] as const;

/**
 * Fraction of each *middle* scroll segment spent pinned at integer morph presets
 * (clearer hold at integer presets in the center of the page). The first and
 * last segments use a smaller hold so hero and footer transitions remain
 * responsive.
 */
const SCROLL_MORPH_PLATEAU = 0.46;
const SCROLL_MORPH_EDGE_PLATEAU = 0.2;

function createLandingScroll() {
  const state: LandingScrollState = {
    morphValue: 0,
    activeIndex: 0,
    scrollY: 0,
  };
  const listeners = new Set<() => void>();
  let sectionStops: number[] | null = null;
  let frame = 0;
  let tracking: AbortController | null = null;

  function getScrollRange() {
    return Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
  }

  function clampScrollY(scrollY: number) {
    return clamp(scrollY, 0, getScrollRange());
  }

  function getSectionScrollStop(index: number): number | undefined {
    if (index === 0) return 0;
    const id = LANDING_SECTION_IDS[index];
    if (!id) return undefined;
    const el = document.getElementById(id);
    if (!el) return undefined;
    if (el.offsetHeight > window.innerHeight) {
      return clampScrollY(el.offsetTop);
    }
    const sectionCenter = el.offsetTop + el.offsetHeight / 2;
    return clampScrollY(sectionCenter - window.innerHeight / 2);
  }

  function getSectionScrollStops(): number[] | undefined {
    if (sectionStops) return sectionStops;

    const stops: number[] = [];
    for (let index = 0; index < presets.length; index++) {
      const stop = getSectionScrollStop(index);
      if (stop === undefined) return undefined;
      stops.push(stop);
    }
    sectionStops = stops;
    return stops;
  }

  function getMorphValue(scrollY: number) {
    const maxValue = presets.length - 1;
    const stops = getSectionScrollStops();
    if (!stops) {
      const linearMorph = (clampScrollY(scrollY) / getScrollRange()) * maxValue;
      return morphPlateauAcrossIndices(linearMorph, maxValue);
    }

    const clampedScrollY = clampScrollY(scrollY);
    if (clampedScrollY <= stops[0]) return 0;

    for (let index = 0; index < maxValue; index++) {
      const from = stops[index];
      const to = stops[index + 1];
      if (clampedScrollY > to) continue;
      const span = to - from;
      if (span <= 1) return index + 1;
      const t = (clampedScrollY - from) / span;
      return (
        index +
        morphPlateauWithinUnitSpan(t, scrollMorphPlateauForSegment(index))
      );
    }

    return maxValue;
  }

  function refresh() {
    const rawMorphValue = getMorphValue(window.scrollY);
    const activeIndex = Math.round(clamp(rawMorphValue, 0, presets.length - 1));
    state.morphValue = reducedMotion.current ? activeIndex : rawMorphValue;
    state.activeIndex = activeIndex;
    state.scrollY = window.scrollY;
  }

  function measure() {
    refresh();
    for (const listener of listeners) listener();
  }

  function scheduleMeasure() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      measure();
    });
  }

  function startTracking() {
    tracking = new AbortController();
    const { signal } = tracking;
    initReducedMotion(signal, measure);
    window.addEventListener("scroll", scheduleMeasure, { signal });
    window.addEventListener(
      "resize",
      () => {
        sectionStops = null;
        scheduleMeasure();
      },
      { signal },
    );
    signal.addEventListener("abort", () => {
      cancelAnimationFrame(frame);
      frame = 0;
      sectionStops = null;
    });
  }

  return {
    state: state as Readonly<LandingScrollState>,

    /**
     * Calls `listener` with fresh state now and after every measured scroll,
     * resize, or reduced-motion change until `signal` aborts.
     */
    subscribe(listener: () => void, signal: AbortSignal) {
      if (signal.aborted) return;
      if (!tracking) startTracking();
      listeners.add(listener);
      signal.addEventListener(
        "abort",
        () => {
          listeners.delete(listener);
          if (listeners.size === 0) {
            tracking?.abort();
            tracking = null;
          }
        },
        { once: true },
      );
      refresh();
      listener();
    },

    jumpToPreset(index: number) {
      const top = getSectionScrollStop(index);
      if (top === undefined) return;
      window.scrollTo({ top, behavior: motionScrollBehavior() });
    },
  };
}

function morphPlateauWithinUnitSpan(t: number, plateau: number): number {
  if (plateau <= 1e-6) return t;
  const lo = plateau * 0.5;
  const hi = 1 - lo;
  if (t <= lo) return 0;
  if (t >= hi) return 1;
  return (t - lo) / (hi - lo);
}

/** `segmentIndex` is the morph integer at the start of the segment (0 for 0→1, …). */
function scrollMorphPlateauForSegment(segmentIndex: number): number {
  const maxMorph = presets.length - 1;
  return segmentIndex === 0 || segmentIndex === maxMorph - 1
    ? SCROLL_MORPH_EDGE_PLATEAU
    : SCROLL_MORPH_PLATEAU;
}

function morphPlateauAcrossIndices(linearMorph: number, maxValue: number) {
  const clamped = clamp(linearMorph, 0, maxValue);
  if (maxValue < 1) return clamped;
  const base = Math.floor(clamped);
  if (base >= maxValue) return maxValue;
  return (
    base +
    morphPlateauWithinUnitSpan(
      clamped - base,
      scrollMorphPlateauForSegment(base),
    )
  );
}
