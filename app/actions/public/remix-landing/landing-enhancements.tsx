import { clientEntry, css, type Handle } from "remix/ui";
import { PresetGlow } from "./components/preset-glow.tsx";
import { LandingNav } from "./components/landing-nav.tsx";
import { LabelOverlay } from "./components/label-overlay.tsx";
import {
  LoadingScreen,
  type LoadingScreenStatus,
} from "./components/loading-screen.tsx";
import { PackageLogos } from "./components/package-logos.tsx";
import { ScrollLogo } from "./components/scroll-logo.tsx";
import { SectionNav } from "./components/section-nav.tsx";
import { isEditableKeyTarget } from "../../../ui/public/keyboard.ts";
import type { ProjectedLabel } from "./engine/label-projection.ts";
import { loadModelPoints, type ModelData } from "./engine/model-loader.ts";
import { presets } from "./engine/presets.ts";
import { colors } from "./styles/tokens.ts";
import { clamp } from "./utils/math.ts";
import {
  initReducedMotion,
  motionScrollBehavior,
  reducedMotion,
} from "./utils/reduced-motion.ts";

/**
 * Fraction of each *middle* scroll segment spent pinned at integer morph presets
 * (clearer hold at integer presets in the center of the page). First and last segments stay linear so
 * hero and footer transitions remain responsive.
 */
const SCROLL_MORPH_PLATEAU = 0.34;

function morphPlateauWithinUnitSpan(t: number, plateau: number): number {
  if (plateau <= 1e-6) return t;
  const lo = plateau * 0.5;
  const hi = 1 - lo;
  if (t <= lo) return 0;
  if (t >= hi) return 1;
  return (t - lo) / (hi - lo);
}

/** `segmentIndex` is the morph integer at the start of the segment (0 for 0→1, …). */
function scrollMorphPlateauForSegment(
  segmentIndex: number,
  maxMorph: number,
  plateau: number,
): number {
  if (plateau <= 1e-6 || segmentIndex === 0 || segmentIndex === maxMorph - 1) {
    return 0;
  }
  return plateau;
}

function morphPlateauAcrossIndices(
  linearMorph: number,
  maxValue: number,
  plateau: number,
): number {
  const clamped = clamp(linearMorph, 0, maxValue);
  if (maxValue < 1) return clamped;
  const base = Math.floor(clamped);
  if (base >= maxValue) return maxValue;
  const frac = clamped - base;
  const p = scrollMorphPlateauForSegment(base, maxValue, plateau);
  return base + morphPlateauWithinUnitSpan(frac, p);
}

const appStyles = css({
  display: "contents",
});

// The previous implementation stacked five `backdrop-filter: blur()` panes of
// increasing strength (2/4/8/16/32 px) to fake a progressive blur ramp. Each
// pane forced the browser to run a separate Gaussian blur pass against the
// scrolling content underneath on every frame — five stacked blurs over a
// mix-blend-mode WebGL canvas. That was the dominant cost during scroll. A
// single moderate blur with a shorter dynamic viewport height gives visually
// similar "softest at top, clean at bottom" behavior with less content covered.
const blurShellStyles = css({
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  height: "15dvh",
  zIndex: "20",
  pointerEvents: "none",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  maskImage:
    "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, black 25%, transparent 100%)",
});

const topFadeGradientStyles = css({
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  height: "min(42vh, 360px)",
  zIndex: "21",
  pointerEvents: "none",
  background: `linear-gradient(to bottom, ${colors.bg} 0%, rgba(0, 0, 0, 0.65) 38%, rgba(0, 0, 0, 0.12) 72%, transparent 100%)`,
  "@media (max-width: 880px)": {
    height: "min(24vh, 180px)",
    background: `linear-gradient(to bottom, ${colors.bg} 0%, rgba(0, 0, 0, 0.48) 32%, rgba(0, 0, 0, 0.08) 68%, transparent 100%)`,
  },
});

/** Konami (↑↑↓↓←→←→BA Enter): toggles particle `colorMode` 2 (shader brand gradient on all presets). */
const KONAMI_KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "Enter",
] as const;

const KONAMI_IDLE_MS = 4000;
const LOADING_SCREEN_MIN_VISIBLE_MS = 750;
const LANDING_SECTION_IDS = [
  "the-framework",
  "full-stack",
  "ai-ready",
  "powerful-components",
  "use-cases",
  "start-building",
] as const;

type ParticleCanvasComponent =
  typeof import("./components/particle-canvas.tsx").ParticleCanvas;

function konamiKeyMatches(event: KeyboardEvent, expected: string): boolean {
  if (expected.startsWith("Arrow")) return event.key === expected;
  if (expected === "Enter") return event.key === "Enter";
  return event.key.length === 1 && event.key.toLowerCase() === expected;
}

export let RemixLandingEnhancements = clientEntry(
  import.meta.url,
  function RemixLandingEnhancements(handle: Handle) {
    let isHydrated = false;
    const konami = {
      index: 0,
      idleTimer: null as ReturnType<typeof setTimeout> | null,
      brandMode: false,
    };
    const modelData: (ModelData | undefined)[] = presets.map(() => undefined);
    const modelLoads = {
      pendingUrls: new Set<string>(),
      failedUrls: new Set<string>(),
    };
    const scroll = {
      morphValue: 0,
      currentY: 0,
      frame: 0,
      sectionStops: null as number[] | null,
    };
    let ParticleCanvas: ParticleCanvasComponent | null = null;
    let particleCanvasLoad: Promise<void> | null = null;
    let loadingScreenDismissal: Promise<void> | null = null;
    let loadingScreenStatus: LoadingScreenStatus = "visible";
    const projectedLabelsRef = { current: [] as ProjectedLabel[] };
    const labelOpacityRef = { current: 0 };
    const morphValueRef = { current: 0 };
    const scrollYRef = { current: 0 };
    const activeIndexRef = { current: 0 };
    const eagerModelIndexes = presets
      .map((preset, index) => (preset.preloadEager ? index : -1))
      .filter((index) => index >= 0);

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
      if (scroll.sectionStops) return scroll.sectionStops;

      const stops: number[] = [];
      for (let index = 0; index < presets.length; index++) {
        const stop = getSectionScrollStop(index);
        if (stop === undefined) return undefined;
        stops.push(stop);
      }
      scroll.sectionStops = stops;
      return stops;
    }

    function getMorphValueForScroll(scrollY: number) {
      const maxValue = presets.length - 1;
      const stops = getSectionScrollStops();
      if (!stops) {
        const linearMorph =
          (clampScrollY(scrollY) / getScrollRange()) * maxValue;
        return morphPlateauAcrossIndices(
          linearMorph,
          maxValue,
          SCROLL_MORPH_PLATEAU,
        );
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
        const plateau = scrollMorphPlateauForSegment(
          index,
          maxValue,
          SCROLL_MORPH_PLATEAU,
        );
        return index + morphPlateauWithinUnitSpan(t, plateau);
      }

      return maxValue;
    }

    function assignModelData(url: string, data: ModelData) {
      presets.forEach((preset, index) => {
        if (preset.modelUrl === url) {
          modelData[index] = data;
        }
      });
    }

    async function requestModel(index: number) {
      const preset = presets[index];
      const url = preset?.modelUrl;

      if (
        !url ||
        modelData[index] !== undefined ||
        modelLoads.pendingUrls.has(url) ||
        modelLoads.failedUrls.has(url)
      ) {
        return;
      }

      modelLoads.pendingUrls.add(url);

      try {
        const data = await loadModelPoints(url);
        if (handle.signal.aborted) return;
        assignModelData(url, data);
      } catch (error) {
        modelLoads.failedUrls.add(url);
        console.error(error);
      } finally {
        modelLoads.pendingUrls.delete(url);
        if (!handle.signal.aborted) handle.update();
      }
    }

    function requestNearbyModels() {
      for (const index of eagerModelIndexes) {
        void requestModel(index);
      }

      presets.forEach((preset, index) => {
        if (!preset.modelUrl) return;
        if (Math.abs(scroll.morphValue - index) < 1.1) {
          void requestModel(index);
        }
      });
    }

    function syncMorphToScroll() {
      const rawMorphValue = getMorphValueForScroll(window.scrollY);
      const activeIndex = Math.round(
        clamp(rawMorphValue, 0, presets.length - 1),
      );
      scroll.morphValue = reducedMotion.current ? activeIndex : rawMorphValue;
      morphValueRef.current = scroll.morphValue;
      scroll.currentY = window.scrollY;
      scrollYRef.current = scroll.currentY;
      activeIndexRef.current = activeIndex;
      requestNearbyModels();
    }

    function jumpToPreset(index: number) {
      if (index === 0) {
        window.scrollTo({ top: 0, behavior: motionScrollBehavior() });
        return;
      }
      const targetY = getSectionScrollStop(index);
      if (targetY === undefined) return;
      window.scrollTo({ top: targetY, behavior: motionScrollBehavior() });
    }

    function scheduleMorphSync() {
      if (scroll.frame) return;
      scroll.frame = window.requestAnimationFrame(() => {
        scroll.frame = 0;
        syncMorphToScroll();
      });
    }

    function clearKonamiIdleTimer() {
      if (konami.idleTimer) {
        clearTimeout(konami.idleTimer);
        konami.idleTimer = null;
      }
    }

    function armKonamiIdle() {
      clearKonamiIdleTimer();
      konami.idleTimer = setTimeout(() => {
        konami.idleTimer = null;
        konami.index = 0;
      }, KONAMI_IDLE_MS);
    }

    function dismissLoadingScreen() {
      return (loadingScreenDismissal ??= (async () => {
        const overlay = document.querySelector(".loading-screen-overlay");
        if (!overlay) return;

        const animation = overlay.getAnimations({ subtree: true })[0];
        let visibleMs = LOADING_SCREEN_MIN_VISIBLE_MS;
        if (animation) {
          const now = Number(document.timeline.currentTime ?? 0);
          const start = Number(animation.startTime ?? now);
          const delay = Number(animation.effect?.getTiming().delay ?? 0);
          visibleMs = now - start - delay;
        }

        if (visibleMs < 0) {
          loadingScreenStatus = "skipped";
          await handle.update();
          return;
        }

        const remainingMs = LOADING_SCREEN_MIN_VISIBLE_MS - visibleMs;
        if (remainingMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingMs));
        }
        if (handle.signal.aborted) return;

        loadingScreenStatus = "dismissed";
        const signal = await handle.update();
        if (signal.aborted) return;

        await overlay.getAnimations()[0]?.finished.catch(() => {});
      })());
    }

    function loadParticleCanvas() {
      particleCanvasLoad ??= import("./components/particle-canvas.tsx")
        .then((module) => {
          if (!handle.signal.aborted) ParticleCanvas = module.ParticleCanvas;
        })
        .catch((error: unknown) => {
          console.error(error);
          void dismissLoadingScreen();
        });
      return particleCanvasLoad;
    }

    function markParticleCanvasFailed(error: unknown) {
      console.error(error);
      void dismissLoadingScreen();
    }

    function onKonamiKeydown(event: KeyboardEvent) {
      const expected = KONAMI_KEYS[konami.index];
      if (konamiKeyMatches(event, expected)) {
        konami.index += 1;
        if (konami.index >= KONAMI_KEYS.length) {
          event.preventDefault();
          clearKonamiIdleTimer();
          konami.brandMode = !konami.brandMode;
          konami.index = 0;
          handle.update();
        } else {
          armKonamiIdle();
        }
      } else {
        konami.index = konamiKeyMatches(event, KONAMI_KEYS[0]) ? 1 : 0;
        if (konami.index > 0) armKonamiIdle();
        else clearKonamiIdleTimer();
      }
    }

    function onKeydown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableKeyTarget(event)) return;

      onKonamiKeydown(event);
    }

    handle.queueTask((signal) => {
      if (signal.aborted || handle.signal.aborted) return;

      isHydrated = true;
      initReducedMotion(handle.signal, () => {
        syncMorphToScroll();
        handle.update();
      });
      syncMorphToScroll();
      void loadParticleCanvas().then(() => {
        if (!handle.signal.aborted) handle.update();
      });

      window.addEventListener("scroll", scheduleMorphSync, {
        signal: handle.signal,
      });
      window.addEventListener(
        "resize",
        () => {
          scroll.sectionStops = null;
          scheduleMorphSync();
        },
        { signal: handle.signal },
      );
      window.addEventListener("keydown", onKeydown, {
        signal: handle.signal,
      });

      handle.signal.addEventListener("abort", () => {
        window.cancelAnimationFrame(scroll.frame);
        clearKonamiIdleTimer();
        konami.index = 0;
      });

      handle.update();
    });

    return () => {
      return (
        <>
          <LoadingScreen status={loadingScreenStatus} />
          {isHydrated ? (
            <div mix={[appStyles]}>
              <PackageLogos morphValueRef={morphValueRef} />
              {ParticleCanvas ? (
                <ParticleCanvas
                  brandGradientMode={konami.brandMode}
                  morphValueRef={morphValueRef}
                  modelData={modelData}
                  labelsRef={projectedLabelsRef}
                  labelOpacityRef={labelOpacityRef}
                  onFirstFrame={dismissLoadingScreen}
                  onError={markParticleCanvasFailed}
                />
              ) : null}
              <LabelOverlay
                labelsRef={projectedLabelsRef}
                opacityRef={labelOpacityRef}
              />
              <PresetGlow
                morphValueRef={morphValueRef}
                brandGradientMode={konami.brandMode}
              />
              <ScrollLogo />
              <div mix={[blurShellStyles]} />
              <div mix={[topFadeGradientStyles]} />
              <LandingNav
                activeIndexRef={activeIndexRef}
                totalSections={presets.length}
                onJump={jumpToPreset}
                scrollYRef={scrollYRef}
                shouldBlockBlogShortcut={() => konami.index > 0}
              />
              <SectionNav
                activeIndexRef={activeIndexRef}
                morphValueRef={morphValueRef}
                onJump={jumpToPreset}
              />
            </div>
          ) : null}
        </>
      );
    };
  },
);
