import {
  addEventListeners,
  clientEntry,
  css,
  type Handle,
} from "remix/component";
import { FpsCounter } from "./components/fps-counter";
import { PresetGlow } from "./components/preset-glow";
import { LandingNav } from "./components/landing-nav";
import { LabelOverlay } from "./components/label-overlay";
import { PackageLogos } from "./components/package-logos";
import { ParticleCanvas } from "./components/particle-canvas";
import { ScrollLogo } from "./components/scroll-logo";
import { SectionNav } from "./components/section-nav";
import type { ProjectedLabel } from "./engine/label-projection";
import { loadModelPoints, type ModelData } from "./engine/model-loader";
import { presets } from "./engine/presets";
import { DEFAULT_SETTINGS, type SystemSettings } from "./engine/types";
import { setKonamiNavProgress } from "./konami-nav";
import { colors } from "./styles/tokens";

const appStyles = css({
  position: "relative",
});

// The previous implementation stacked five `backdrop-filter: blur()` panes of
// increasing strength (2/4/8/16/32 px) to fake a progressive blur ramp. Each
// pane forced the browser to run a separate Gaussian blur pass against the
// scrolling content underneath on every frame — five stacked blurs over a
// mix-blend-mode WebGL canvas. That was the dominant cost during scroll. A
// single moderate blur with a linear mask gives visually similar "softest at
// top, clean at bottom" behaviour at ~1/5 the raster cost.
const blurShellStyles = css({
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  height: "20vh",
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
const LANDING_SECTION_IDS = [
  "the-framework",
  "full-stack",
  "ai-ready",
  "powerful-components",
  "use-cases",
  "start-building",
] as const;

function konamiKeyMatches(event: KeyboardEvent, expected: string): boolean {
  if (expected.startsWith("Arrow")) return event.key === expected;
  if (expected === "Enter") return event.key === "Enter";
  return event.key.length === 1 && event.key.toLowerCase() === expected;
}

export let RemixLandingEnhancements = clientEntry(
  import.meta.url,
  function RemixLandingEnhancements(handle: Handle) {
    let isHydrated = false;
    let settings: SystemSettings = { ...DEFAULT_SETTINGS };
    let konamiIndex = 0;
    let konamiIdleTimer: ReturnType<typeof setTimeout> | null = null;
    let konamiBrandMode = false;
    let modelData: (ModelData | undefined)[] = presets.map(() => undefined);
    let morphValue = 0;
    let currentScrollY = 0;
    let scrollFrame = 0;
    let sectionScrollStops: number[] | null = null;
    const projectedLabelsRef = { current: [] as ProjectedLabel[] };
    const labelOpacityRef = { current: 0 };
    const morphValueRef = { current: 0 };
    const pendingModelUrls = new Set<string>();
    const failedModelUrls = new Set<string>();
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
      return Math.max(0, Math.min(getScrollRange(), scrollY));
    }

    function getSectionScrollStop(index: number): number | undefined {
      if (index === 0) return 0;
      const id = LANDING_SECTION_IDS[index];
      if (!id) return undefined;
      const el = document.getElementById(id);
      if (!el) return undefined;
      const sectionCenter = el.offsetTop + el.offsetHeight / 2;
      return clampScrollY(sectionCenter - window.innerHeight / 2);
    }

    function getSectionScrollStops(): number[] | undefined {
      if (sectionScrollStops) return sectionScrollStops;

      const stops: number[] = [];
      for (let index = 0; index < presets.length; index++) {
        const stop = getSectionScrollStop(index);
        if (stop === undefined) return undefined;
        stops.push(stop);
      }
      sectionScrollStops = stops;
      return stops;
    }

    function getMorphValueForScroll(scrollY: number) {
      const maxValue = presets.length - 1;
      const stops = getSectionScrollStops();
      if (!stops) {
        return (clampScrollY(scrollY) / getScrollRange()) * maxValue;
      }

      const clampedScrollY = clampScrollY(scrollY);
      if (clampedScrollY <= stops[0]) return 0;

      for (let index = 0; index < maxValue; index++) {
        const from = stops[index];
        const to = stops[index + 1];
        if (clampedScrollY > to) continue;
        const span = to - from;
        if (span <= 1) return index + 1;
        return index + (clampedScrollY - from) / span;
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
        pendingModelUrls.has(url) ||
        failedModelUrls.has(url)
      ) {
        return;
      }

      pendingModelUrls.add(url);

      try {
        const data = await loadModelPoints(url);
        if (handle.signal.aborted) return;
        assignModelData(url, data);
      } catch (error) {
        failedModelUrls.add(url);
        console.error(error);
      } finally {
        pendingModelUrls.delete(url);
        if (handle.signal.aborted) return;
        handle.update();
      }
    }

    function requestNearbyModels() {
      for (const index of eagerModelIndexes) {
        void requestModel(index);
      }

      presets.forEach((preset, index) => {
        if (!preset.modelUrl) return;
        if (Math.abs(morphValue - index) < 1.1) {
          void requestModel(index);
        }
      });
    }

    function syncMorphToScroll() {
      morphValue = getMorphValueForScroll(window.scrollY);
      morphValueRef.current = morphValue;
      currentScrollY = window.scrollY;
      requestNearbyModels();
      handle.update();
    }

    function jumpToPreset(index: number) {
      if (index === 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const targetY = getSectionScrollStop(index);
      if (targetY === undefined) return;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }

    function scheduleMorphSync() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        syncMorphToScroll();
      });
    }

    function clearKonamiIdleTimer() {
      if (konamiIdleTimer) {
        clearTimeout(konamiIdleTimer);
        konamiIdleTimer = null;
      }
    }

    function armKonamiIdle() {
      clearKonamiIdleTimer();
      konamiIdleTimer = setTimeout(() => {
        konamiIdleTimer = null;
        konamiIndex = 0;
        setKonamiNavProgress(0);
      }, KONAMI_IDLE_MS);
    }

    function onKonamiKeydown(event: KeyboardEvent) {
      const el = event.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      const expected = KONAMI_KEYS[konamiIndex];
      if (konamiKeyMatches(event, expected)) {
        konamiIndex += 1;
        if (konamiIndex >= KONAMI_KEYS.length) {
          event.preventDefault();
          clearKonamiIdleTimer();
          konamiBrandMode = !konamiBrandMode;
          settings = {
            ...DEFAULT_SETTINGS,
            colorMode: konamiBrandMode ? 2 : 0,
          };
          konamiIndex = 0;
          setKonamiNavProgress(0);
          handle.update();
        } else {
          setKonamiNavProgress(konamiIndex);
          armKonamiIdle();
        }
      } else {
        konamiIndex = konamiKeyMatches(event, KONAMI_KEYS[0]) ? 1 : 0;
        setKonamiNavProgress(konamiIndex);
        if (konamiIndex > 0) armKonamiIdle();
        else clearKonamiIdleTimer();
      }
    }

    // Body styles (margin/background/color/font-family) live in `home.css`;
    // don't re-apply them here.
    handle.queueTask((signal) => {
      if (signal.aborted || handle.signal.aborted) return;

      isHydrated = true;

      syncMorphToScroll();
      requestNearbyModels();

      addEventListeners(window, handle.signal, {
        scroll: () => scheduleMorphSync(),
        resize: () => {
          sectionScrollStops = null;
          scheduleMorphSync();
        },
        keydown: onKonamiKeydown,
      });

      handle.signal.addEventListener("abort", () => {
        window.cancelAnimationFrame(scrollFrame);
        clearKonamiIdleTimer();
        konamiIndex = 0;
        setKonamiNavProgress(0);
      });

      handle.update();
    });

    return () => {
      if (!isHydrated) return null;

      const nearestIndex = Math.round(
        Math.max(0, Math.min(presets.length - 1, morphValue)),
      );
      return (
        <div mix={[appStyles]}>
          <PackageLogos morphValue={morphValue} />
          <ParticleCanvas
            settings={settings}
            presets={presets}
            morphValue={morphValue}
            modelData={modelData}
            labelsRef={projectedLabelsRef}
            labelOpacityRef={labelOpacityRef}
          />
          <LabelOverlay
            labelsRef={projectedLabelsRef}
            opacityRef={labelOpacityRef}
          />
          <PresetGlow
            morphValueRef={morphValueRef}
            brandGradientMode={konamiBrandMode}
          />
          <ScrollLogo scrollY={currentScrollY} />
          <div mix={[blurShellStyles]} />
          <div mix={[topFadeGradientStyles]} />
          <LandingNav
            activeIndex={nearestIndex}
            totalSections={presets.length}
            onJump={jumpToPreset}
            scrollY={currentScrollY}
          />
          <SectionNav
            activeIndex={nearestIndex}
            morphValue={morphValue}
            totalSections={presets.length}
            onJump={jumpToPreset}
          />

          <FpsCounter />
        </div>
      );
    };
  },
);
