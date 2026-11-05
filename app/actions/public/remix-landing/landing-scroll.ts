import { presets } from "./engine/presets.ts";
import { clamp } from "./math.ts";
import {
  initReducedMotion,
  motionScrollBehavior,
  reducedMotion,
} from "./reduced-motion.ts";

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
  "single-package",
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
  let state: LandingScrollState = {
    morphValue: 0,
    activeIndex: 0,
    scrollY: 0,
  };
  let listeners = new Set<() => void>();
  let sectionStops: number[] | null = null;
  let frame = 0;
  let tracking: AbortController | null = null;

  function refresh() {
    sectionStops ??= measureSectionScrollStops();
    let rawMorphValue = getMorphValue(
      window.scrollY,
      getScrollRange(),
      sectionStops,
    );
    let activeIndex = Math.round(clamp(rawMorphValue, 0, presets.length - 1));
    state.morphValue = reducedMotion.current ? activeIndex : rawMorphValue;
    state.activeIndex = activeIndex;
    state.scrollY = window.scrollY;
  }

  function measure() {
    refresh();
    for (let listener of listeners) listener();
  }

  function onFrame() {
    frame = 0;
    measure();
  }

  function scheduleMeasure() {
    if (frame) return;
    frame = requestAnimationFrame(onFrame);
  }

  function onResize() {
    sectionStops = null;
    scheduleMeasure();
  }

  function stopTracking() {
    cancelAnimationFrame(frame);
    frame = 0;
    sectionStops = null;
  }

  function startTracking() {
    tracking = new AbortController();
    let { signal } = tracking;
    initReducedMotion(signal, measure);
    window.addEventListener("scroll", scheduleMeasure, { signal });
    window.addEventListener("resize", onResize, { signal });
    signal.addEventListener("abort", stopTracking);
  }

  function unsubscribe(listener: () => void) {
    listeners.delete(listener);
    if (listeners.size === 0) {
      tracking?.abort();
      tracking = null;
    }
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
      signal.addEventListener("abort", () => unsubscribe(listener), {
        once: true,
      });
      refresh();
      listener();
    },

    jumpToPreset(index: number) {
      let top = getSectionScrollStop(index);
      if (top === undefined) return;
      window.scrollTo({ top, behavior: motionScrollBehavior() });
    },
  };
}

/**
 * Maps a scroll position to a continuous preset position. Each section's
 * scroll stop lands exactly on its preset, with a plateau around it; without
 * measured stops the page height is split evenly.
 */
export function getMorphValue(
  scrollY: number,
  scrollRange: number,
  stops: number[] | null,
): number {
  let maxValue = presets.length - 1;
  let clampedScrollY = clamp(scrollY, 0, scrollRange);
  if (!stops) {
    let linearMorph = (clampedScrollY / scrollRange) * maxValue;
    return morphPlateauAcrossIndices(linearMorph, maxValue);
  }

  if (clampedScrollY <= stops[0]) return 0;

  for (let index = 0; index < maxValue; index++) {
    let from = stops[index];
    let to = stops[index + 1];
    if (clampedScrollY > to) continue;
    let span = to - from;
    if (span <= 1) return index + 1;
    let t = (clampedScrollY - from) / span;
    return (
      index + morphPlateauWithinUnitSpan(t, scrollMorphPlateauForSegment(index))
    );
  }

  return maxValue;
}

function getScrollRange() {
  return Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    1,
  );
}

/** Scroll position that centers a section (or tops a tall one) in the viewport. */
function getSectionScrollStop(index: number): number | undefined {
  if (index === 0) return 0;
  let id = LANDING_SECTION_IDS[index];
  if (!id) return undefined;
  let el = document.getElementById(id);
  if (!el) return undefined;
  let top =
    el.offsetHeight > window.innerHeight
      ? el.offsetTop
      : el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2;
  return clamp(top, 0, getScrollRange());
}

/** Null until every preset's section is in the document. */
function measureSectionScrollStops(): number[] | null {
  let stops: number[] = [];
  for (let index = 0; index < presets.length; index++) {
    let stop = getSectionScrollStop(index);
    if (stop === undefined) return null;
    stops.push(stop);
  }
  return stops;
}

function morphPlateauWithinUnitSpan(t: number, plateau: number): number {
  if (plateau <= 1e-6) return t;
  let lo = plateau * 0.5;
  let hi = 1 - lo;
  if (t <= lo) return 0;
  if (t >= hi) return 1;
  return (t - lo) / (hi - lo);
}

/** `segmentIndex` is the morph integer at the start of the segment (0 for 0→1, …). */
function scrollMorphPlateauForSegment(segmentIndex: number): number {
  let maxMorph = presets.length - 1;
  return segmentIndex === 0 || segmentIndex === maxMorph - 1
    ? SCROLL_MORPH_EDGE_PLATEAU
    : SCROLL_MORPH_PLATEAU;
}

function morphPlateauAcrossIndices(linearMorph: number, maxValue: number) {
  let clamped = clamp(linearMorph, 0, maxValue);
  if (maxValue < 1) return clamped;
  let base = Math.floor(clamped);
  if (base >= maxValue) return maxValue;
  return (
    base +
    morphPlateauWithinUnitSpan(
      clamped - base,
      scrollMorphPlateauForSegment(base),
    )
  );
}
