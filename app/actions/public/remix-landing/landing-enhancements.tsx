import { clientEntry, css, type Handle } from "remix/ui";
import { PresetGlow } from "./components/preset-glow.tsx";
import { LandingNav } from "./components/landing-nav.tsx";
import {
  LoadingScreen,
  LOADING_SCREEN_FAILSAFE_MS,
  type LoadingScreenStatus,
} from "./components/loading-screen.tsx";
import { ScrollLogo } from "./components/scroll-logo.tsx";
import { SectionNav } from "./components/section-nav.tsx";
import { PackageLogos } from "./components/package-logos.tsx";
import { isEditableKeyTarget } from "../../../ui/public/keyboard.ts";
import { breakpointMedia } from "../../../ui/public/theme.ts";
import { loadModelPoints, type ModelData } from "./engine/model-loader.ts";
import { presets } from "./engine/presets.ts";
import { landingScroll } from "./landing-scroll.ts";
import { colors } from "./styles/tokens.ts";
import { initReducedMotion, reducedMotion } from "./utils/reduced-motion.ts";

const appStyles = css({
  display: "contents",
});

const topFadeGradientStyles = css({
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  height: "min(24vh, 180px)",
  zIndex: "21",
  pointerEvents: "none",
  background: `linear-gradient(to bottom, ${colors.bg} 0%, rgba(0, 0, 0, 0.48) 32%, rgba(0, 0, 0, 0.08) 68%, transparent 100%)`,
  [breakpointMedia.lg]: {
    height: "min(42vh, 360px)",
    background: `linear-gradient(to bottom, ${colors.bg} 0%, rgba(0, 0, 0, 0.65) 38%, rgba(0, 0, 0, 0.12) 72%, transparent 100%)`,
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
const BRAND_CYCLE_TICK_MS = 100;
const LOADING_SCREEN_MIN_VISIBLE_MS = 750;

type ParticleCanvasComponent =
  typeof import("./components/particle-canvas.tsx").ParticleCanvas;

function loadingScreenIsHidden(overlay: Element | null) {
  if (!overlay) return false;
  const style = getComputedStyle(overlay);
  return style.display === "none" || style.visibility === "hidden";
}

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
    let ParticleCanvas: ParticleCanvasComponent | null = null;
    let particleCanvasLoad: Promise<void> | null = null;
    let loadingScreenDismissal: Promise<void> | null = null;
    let loadingScreenFailsafeTimer: ReturnType<typeof setTimeout> | null = null;
    let loadingScreenStatus: LoadingScreenStatus =
      typeof document !== "undefined" &&
      (performance.now() >= LOADING_SCREEN_FAILSAFE_MS ||
        loadingScreenIsHidden(
          document.querySelector(".loading-screen-overlay"),
        ))
        ? "skipped"
        : "visible";
    const morphValueRef = { current: 0 };
    const scrollYRef = { current: 0 };
    const activeIndexRef = { current: 0 };
    const interactionPausedRef = { current: false };
    const eagerModelIndexes = presets
      .map((preset, index) => (preset.preloadEager ? index : -1))
      .filter((index) => index >= 0);

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
        if (Math.abs(landingScroll.state.morphValue - index) < 1.1) {
          void requestModel(index);
        }
      });
    }

    function syncToScroll() {
      const { activeIndex, morphValue, scrollY } = landingScroll.state;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      interactionPausedRef.current = Array.from(
        document.querySelectorAll<HTMLElement>("[data-home-card]"),
      ).some((card) => {
        const rect = card.getBoundingClientRect();
        return (
          rect.left <= viewportCenterX &&
          rect.right >= viewportCenterX &&
          rect.top <= viewportCenterY &&
          rect.bottom >= viewportCenterY
        );
      });
      morphValueRef.current = morphValue;
      scrollYRef.current = scrollY;
      activeIndexRef.current = activeIndex;
      requestNearbyModels();
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

    function clearLoadingScreenFailsafe() {
      if (loadingScreenFailsafeTimer !== null) {
        clearTimeout(loadingScreenFailsafeTimer);
        loadingScreenFailsafeTimer = null;
      }
    }

    function skipLoadingScreen() {
      loadingScreenStatus = "skipped";
      clearLoadingScreenFailsafe();
      return handle.update();
    }

    function dismissLoadingScreen() {
      return (loadingScreenDismissal ??= (async () => {
        const overlay = document.querySelector(".loading-screen-overlay");
        if (!overlay) return;

        if (loadingScreenIsHidden(overlay)) {
          await skipLoadingScreen();
          return;
        }

        const animation = overlay.querySelector("picture")?.getAnimations()[0];
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

        // The CSS or JS fail-safe may have elapsed while this task was waiting.
        if (
          loadingScreenStatus !== "visible" ||
          loadingScreenIsHidden(overlay)
        ) {
          await skipLoadingScreen();
          return;
        }

        loadingScreenStatus = "dismissed";
        clearLoadingScreenFailsafe();
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

    // Advance the paused CSS animation at 10Hz instead of display refresh.
    function startBrandCycle() {
      const start = performance.now();
      const interval = setInterval(() => {
        if (document.hidden || reducedMotion.current) return;
        const elapsedS = (performance.now() - start) / 1000;
        document.documentElement.style.animationDelay = `-${elapsedS.toFixed(2)}s`;
      }, BRAND_CYCLE_TICK_MS);
      handle.signal.addEventListener("abort", () => {
        clearInterval(interval);
        document.documentElement.style.animationDelay = "";
      });
    }

    function onKeydown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableKeyTarget(event)) return;

      onKonamiKeydown(event);
    }

    handle.queueTask((signal) => {
      if (signal.aborted || handle.signal.aborted) return;

      if (loadingScreenStatus === "visible") {
        loadingScreenFailsafeTimer = setTimeout(
          () => {
            loadingScreenFailsafeTimer = null;
            if (!handle.signal.aborted && loadingScreenStatus === "visible") {
              void skipLoadingScreen();
            }
          },
          Math.max(0, LOADING_SCREEN_FAILSAFE_MS - performance.now()),
        );
        handle.signal.addEventListener("abort", clearLoadingScreenFailsafe, {
          once: true,
        });
      }

      try {
        isHydrated = true;
        // Subscribe first so scroll state is fresh when the reduced-motion
        // re-render below runs.
        landingScroll.subscribe(syncToScroll, handle.signal);
        initReducedMotion(handle.signal, () => handle.update());
        startBrandCycle();
        void loadParticleCanvas().then(() => {
          if (!handle.signal.aborted) handle.update();
        });

        window.addEventListener("keydown", onKeydown, {
          signal: handle.signal,
        });

        handle.signal.addEventListener("abort", () => {
          clearKonamiIdleTimer();
          konami.index = 0;
        });

        handle.update();
      } catch (error) {
        isHydrated = false;
        console.error(error);
        void dismissLoadingScreen();
      }
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
                  interactionPausedRef={interactionPausedRef}
                  modelData={modelData}
                  onFirstFrame={dismissLoadingScreen}
                  onError={markParticleCanvasFailed}
                />
              ) : null}
              <PresetGlow
                morphValueRef={morphValueRef}
                brandGradientMode={konami.brandMode}
              />
              <ScrollLogo />
              <div mix={[topFadeGradientStyles]} />
              <LandingNav
                activeIndexRef={activeIndexRef}
                totalSections={presets.length}
                onJump={landingScroll.jumpToPreset}
                scrollYRef={scrollYRef}
                shouldBlockBlogShortcut={() => konami.index > 0}
              />
            </div>
          ) : null}
        </>
      );
    };
  },
);

// Rendered inside the hero (rather than with the other enhancements) so the
// section links follow the hero's controls in tab order.
export let RemixLandingSectionNav = clientEntry(
  import.meta.url,
  function RemixLandingSectionNav(handle: Handle) {
    let isHydrated = false;

    handle.queueTask(() => {
      isHydrated = true;
      landingScroll.subscribe(() => handle.update(), handle.signal);
    });

    return () =>
      isHydrated ? (
        <SectionNav
          activeIndex={landingScroll.state.activeIndex}
          morphValue={landingScroll.state.morphValue}
          onJump={landingScroll.jumpToPreset}
        />
      ) : null;
  },
);
