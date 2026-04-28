import { addEventListeners, css, type Handle } from "remix/component";
import { FpsCounter } from "./components/fps-counter";
import { PresetGlow } from "./components/preset-glow";
import { LandingHero } from "./components/landing-hero";
import { LandingNav } from "./components/landing-nav";
import { FeatureSection } from "./components/feature-section";
import { LabelOverlay } from "./components/label-overlay";
import { LandingFooter } from "./components/landing-footer";
import { LoadingScreen } from "./components/loading-screen";
import { PackageLogos } from "./components/package-logos";
import { ScrollLogo } from "./components/scroll-logo";
import { SectionNav } from "./components/section-nav";
import type { ProjectedLabel } from "./engine/label-projection";
import { loadModelPoints, type ModelData } from "./engine/model-loader";
import { presets } from "./engine/presets";
import { DEFAULT_SETTINGS, type SystemSettings } from "./engine/types";
import { setKonamiNavProgress } from "./konami-nav";
import { colors } from "./styles/tokens";

type ParticleCanvasFactory =
  typeof import("./components/particle-canvas").ParticleCanvas;

const appStyles = css({
  position: "relative",
  minHeight: "100vh",
  background: colors.bg,
  color: colors.fg,
  overflowX: "clip",
});

const contentStyles = css({
  position: "relative",
  zIndex: "10",
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

function konamiKeyMatches(event: KeyboardEvent, expected: string): boolean {
  if (expected.startsWith("Arrow")) return event.key === expected;
  if (expected === "Enter") return event.key === "Enter";
  return event.key.length === 1 && event.key.toLowerCase() === expected;
}

const storySections = [
  {
    id: "full-stack",
    kicker: "Cohesive frontend and backend",
    title: "Closing the gap between the initial spark and shipping",
    body: "Remix is the world's first truly full-stack JavaScript framework. It includes a server, router, data layer, UI components, testing, and much more. Everything you need to go from idea to launch in a single dependency.",
    align: "left" as const,
  },
  {
    id: "ai-ready",
    kicker: "Ready to build right out of the box",
    title: "Built for humans and models",
    body: "Remix ships with skills that help your AI agent learn the API and follow best practices. Whether you let the agent write all the code, or you tweak it by hand, Remix just works. It's one unified stack that speaks Remix end to end, not a patchwork of tools. When you want to change something, explain it in plain language. The framework stays out of your way.",
    align: "left" as const,
  },
  {
    id: "powerful-components",
    kicker: "The next generation of UI",
    title: "High-performance components in plain, beautiful JavaScript",
    body: "Remix components build on web primitives like EventTarget and avoid the runtime semantics of React hooks, giving you back normal JavaScript control flow and execution. This works seamlessly with the web, including web components and third-party libraries. Remix also provides native mixins for the DOM that make it easier than ever to compose and apply complex behavior on native platform elements.",
    align: "left" as const,
    codeSnippet: `import { type Handle, on } from 'remix/component'
import { ui, Glyph } from 'remix/ui'
import { tooltip } from 'remix/ui/tooltip'

function CopyToClipboard(handle: Handle) {
  let state: 'idle' | 'copied' | 'error' = 'idle'

  return (props: { url: string }) => {
    let label = state === 'idle' ? 'Copy to clipboard' : state === 'copied' ? 'Copied' : 'Error'

    return (
      <button
        aria-label={label}
        aria-live="polite"
        mix={[
          ui.button,
          tooltip(label),
          on('click', async (event) => {
            try {
              await navigator.clipboard.writeText(props.url)
              if (handle.signal.aborted) return
            } catch (error) {
              state = 'error'
              handle.update()
              return
            }

            state = 'copied'
            handle.update()
            setTimeout(() => {
              if (handle.signal.aborted) return
              state = 'idle'
              handle.update()
            }, 2000)
          }),
        ]}
      >
        {state === 'copied' ? <Glyph name="check" /> : <Glyph name="clipboard" />}
      </button>
    )
  }
}`,
  },
  {
    id: "use-cases",
    kicker: "One framework for any kind of project",
    title:
      "A store overnight.\nA business in a weekend. The app you always wanted to ship.",
    body: "Whatever you want to build, Remix can meet the project where it is. Start something new, grow it into a business, or bring Remix into an app that already exists. One technology, used in whatever way the project needs.",
    align: "right" as const,
  },
  {
    id: "start-building",
    kicker: "Describe the destination",
    title: "Building with Remix can take you there",
    body: "Remix 3 is currently available as a beta release.",
    align: "left" as const,
    ctaLabel: "Watch the repo",
    ctaHref: "https://github.com/remix-run/remix",
    ctaIcon: "eye" as const,
    secondary: {
      kicker: "Subscribe to our newsletter",
      title: "Stay in the loop",
      body: "Once a month, we write about everything in the world of Remix. Sign up to be notified about progress on Remix 3. No spam. Unsubscribe anytime.",
      newsletterAction: "https://remix.run/_actions/newsletter",
      newsletterPlaceholder: "name@example.com",
      newsletterButtonLabel: "Subscribe",
    },
  },
];

export function App(handle: Handle) {
  let settings: SystemSettings = { ...DEFAULT_SETTINGS };
  let konamiIndex = 0;
  let konamiIdleTimer: ReturnType<typeof setTimeout> | null = null;
  let konamiBrandMode = false;
  let modelData: (ModelData | undefined)[] = presets.map(() => undefined);
  let ParticleCanvasComponent: ParticleCanvasFactory | null = null;
  let canvasModuleReady = false;
  let morphValue = 0;
  let currentScrollY = 0;
  let scrollFrame = 0;
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
    const maxValue = presets.length - 1;
    const scrollRange = getScrollRange();
    const progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
    morphValue = progress * maxValue;
    morphValueRef.current = morphValue;
    currentScrollY = window.scrollY;
    requestNearbyModels();
    handle.update();
  }

  const sectionIds = ["the-framework", ...storySections.map((s) => s.id)];

  function jumpToPreset(index: number) {
    if (index === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const id = sectionIds[index];
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const elCenter = el.offsetTop + el.offsetHeight / 2;
    const targetY = elCenter - window.innerHeight / 2;
    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
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

  addEventListeners(window, handle.signal, {
    scroll: () => scheduleMorphSync(),
    resize: () => scheduleMorphSync(),
    keydown: onKonamiKeydown,
  });

  handle.signal.addEventListener("abort", () => {
    window.cancelAnimationFrame(scrollFrame);
    clearKonamiIdleTimer();
    konamiIndex = 0;
    setKonamiNavProgress(0);
  });

  handle.queueTask((signal) => {
    const previous = {
      margin: document.body.style.margin,
      background: document.body.style.background,
      color: document.body.style.color,
      fontFamily: document.body.style.fontFamily,
    };

    document.body.style.margin = "0";
    document.body.style.background = colors.bg;
    document.body.style.color = colors.fg;
    document.body.style.fontFamily =
      'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

    syncMorphToScroll();
    requestNearbyModels();

    signal.addEventListener("abort", () => {
      document.body.style.margin = previous.margin;
      document.body.style.background = previous.background;
      document.body.style.color = previous.color;
      document.body.style.fontFamily = previous.fontFamily;
    });
  });

  void import("./components/particle-canvas")
    .then((module) => {
      if (handle.signal.aborted) return;
      ParticleCanvasComponent = module.ParticleCanvas;
      canvasModuleReady = true;
      handle.update();
    })
    .catch((error) => {
      console.error("Failed to load ParticleCanvas module.", error);
      if (handle.signal.aborted) return;
      // Fail open so the shell still renders if the canvas bundle has an issue.
      canvasModuleReady = true;
      handle.update();
    });

  return () => {
    const nearestIndex = Math.round(
      Math.max(0, Math.min(presets.length - 1, morphValue)),
    );
    const LoadedParticleCanvas = ParticleCanvasComponent;
    return (
      <div mix={[appStyles]}>
        <PackageLogos morphValue={morphValue} />
        {LoadedParticleCanvas ? (
          <LoadedParticleCanvas
            settings={settings}
            presets={presets}
            morphValue={morphValue}
            modelData={modelData}
            canInit={canvasModuleReady}
            labelsRef={projectedLabelsRef}
            labelOpacityRef={labelOpacityRef}
          />
        ) : null}
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

        <main id="main-content" tabIndex={-1} mix={[contentStyles]}>
          <LandingHero />
          {storySections.map((section) => (
            <FeatureSection
              key={section.id}
              id={section.id}
              kicker={section.kicker}
              title={section.title}
              body={section.body}
              align={section.align}
              ctaLabel={section.ctaLabel}
              ctaHref={section.ctaHref}
              ctaIcon={section.ctaIcon}
              codeSnippet={section.codeSnippet}
              secondary={section.secondary}
            />
          ))}
          <LandingFooter />
        </main>
        <LoadingScreen />
        <FpsCounter />
      </div>
    );
  };
}
