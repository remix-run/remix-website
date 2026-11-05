import { clientEntry, css, type Handle } from "remix/component";
import { PresetGlow } from "./components/preset-glow.tsx";
import { LandingNav } from "./components/landing-nav.tsx";
import {
  createLoadingScreenController,
  LoadingScreen,
} from "./components/loading-screen.tsx";
import { ScrollLogo } from "./components/scroll-logo.tsx";
import { SectionNav } from "./components/section-nav.tsx";
import { PackageLogos } from "./components/package-logos.tsx";
import { listenForKonamiCode } from "./konami-code.ts";
import { breakpointMedia } from "../../../ui/public/styles/theme.ts";
import { presets } from "./engine/presets.ts";
import { landingScroll } from "./landing-scroll.ts";
import { createModelPreloader } from "./model-preloader.ts";
import { colors } from "./tokens.ts";
import { initReducedMotion, reducedMotion } from "./reduced-motion.ts";

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
  background: `linear-gradient(to bottom, ${colors.bg} 0%, rgba(0, 0, 0, 0.48) 32%, rgba(0, 0, 0, 0.08) 68%, transparent 92%, transparent 100%)`,
  [breakpointMedia.lg]: {
    height: "min(42vh, 360px)",
    background: `linear-gradient(to bottom, ${colors.bg} 0%, rgba(0, 0, 0, 0.65) 38%, rgba(0, 0, 0, 0.12) 72%, transparent 92%, transparent 100%)`,
  },
});

const BRAND_CYCLE_TICK_MS = 100;

type ParticleCanvasComponent =
  typeof import("./components/particle-canvas.tsx").ParticleCanvas;

export let RemixLandingEnhancements = clientEntry(
  import.meta.url,
  function RemixLandingEnhancements(handle: Handle) {
    let isHydrated = false;
    let brandMode = false;
    let loadingScreen = createLoadingScreenController(handle);
    let models = createModelPreloader(handle);
    let ParticleCanvas: ParticleCanvasComponent | null = null;
    let particleCanvasLoad: Promise<void> | null = null;
    let morphValueRef = { current: 0 };
    let scrollYRef = { current: 0 };
    let activeIndexRef = { current: 0 };
    let interactionPausedRef = { current: false };

    function syncToScroll() {
      let { activeIndex, morphValue, scrollY } = landingScroll.state;
      interactionPausedRef.current = isHomeCardAtViewportCenter();
      morphValueRef.current = morphValue;
      scrollYRef.current = scrollY;
      activeIndexRef.current = activeIndex;
      models.requestNearbyModels(morphValue);
    }

    // The page content works without the particle scene, so any client
    // failure just reveals it.
    function revealWithoutParticles(error: unknown) {
      console.error(error);
      void loadingScreen.dismiss();
    }

    function loadParticleCanvas() {
      particleCanvasLoad ??= import("./components/particle-canvas.tsx")
        .then((module) => {
          if (!handle.signal.aborted) ParticleCanvas = module.ParticleCanvas;
        })
        .catch(revealWithoutParticles);
      return particleCanvasLoad;
    }

    function toggleBrandMode() {
      brandMode = !brandMode;
      handle.update();
    }

    handle.queueTask((signal) => {
      if (signal.aborted || handle.signal.aborted) return;

      loadingScreen.startFailsafe();

      try {
        isHydrated = true;
        // Subscribe first so scroll state is fresh when the reduced-motion
        // re-render below runs.
        landingScroll.subscribe(syncToScroll, handle.signal);
        initReducedMotion(handle.signal, () => handle.update());
        startBrandCycle(handle.signal);
        void loadParticleCanvas().then(() => {
          if (!handle.signal.aborted) handle.update();
        });

        listenForKonamiCode(toggleBrandMode, handle.signal);

        handle.update();
      } catch (error) {
        isHydrated = false;
        revealWithoutParticles(error);
      }
    });

    return () => {
      return (
        <>
          <LoadingScreen status={loadingScreen.status} />
          {isHydrated ? (
            <div mix={[appStyles]}>
              <PackageLogos />
              {ParticleCanvas ? (
                <ParticleCanvas
                  brandGradientMode={brandMode}
                  morphValueRef={morphValueRef}
                  interactionPausedRef={interactionPausedRef}
                  modelData={models.modelData}
                  onFirstFrame={loadingScreen.dismiss}
                  onError={revealWithoutParticles}
                />
              ) : null}
              <PresetGlow
                morphValueRef={morphValueRef}
                brandGradientMode={brandMode}
              />
              <ScrollLogo />
              <div mix={[topFadeGradientStyles]} />
              <LandingNav
                activeIndexRef={activeIndexRef}
                totalSections={presets.length}
                onJump={landingScroll.jumpToPreset}
                scrollYRef={scrollYRef}
              />
            </div>
          ) : null}
        </>
      );
    };
  },
);

/**
 * Home cards own attention when they cover the viewport center; the particle
 * model pauses interaction underneath them.
 */
function isHomeCardAtViewportCenter() {
  let viewportCenterX = window.innerWidth / 2;
  let viewportCenterY = window.innerHeight / 2;
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-home-card]"),
  ).some((card) => {
    let rect = card.getBoundingClientRect();
    return (
      rect.left <= viewportCenterX &&
      rect.right >= viewportCenterX &&
      rect.top <= viewportCenterY &&
      rect.bottom >= viewportCenterY
    );
  });
}

// Advance the paused CSS animation at 10Hz instead of display refresh.
function startBrandCycle(signal: AbortSignal) {
  let start = performance.now();
  let interval = setInterval(() => {
    if (document.hidden || reducedMotion.current) return;
    let elapsedS = (performance.now() - start) / 1000;
    document.documentElement.style.animationDelay = `-${elapsedS.toFixed(2)}s`;
  }, BRAND_CYCLE_TICK_MS);
  signal.addEventListener("abort", () => {
    clearInterval(interval);
    document.documentElement.style.animationDelay = "";
  });
}

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
