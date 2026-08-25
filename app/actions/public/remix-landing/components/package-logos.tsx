import { css, type Handle } from "remix/ui";
import { clamp01 } from "../utils/math.ts";
import { reducedMotion } from "../utils/reduced-motion.ts";

const LOGOS = [
  { src: "/landing/remix-package-auth.svg", alt: "Auth", ratio: "904 / 245" },
  {
    src: "/landing/remix-package-routing.svg",
    alt: "Routing",
    ratio: "1440 / 288",
  },
  { src: "/landing/remix-package-data.svg", alt: "Data", ratio: "577 / 290" },
  {
    src: "/landing/remix-package-session.svg",
    alt: "Session",
    ratio: "797 / 288",
  },
  {
    src: "/landing/remix-package-component.svg",
    alt: "Component",
    ratio: "1438 / 414",
  },
];

const LOGO_MAX_WIDTHS = [440, 460, 310, 360, 440] as const;
const LOGO_STAGE_WIDTHS = [0.85, 0.86, 0.65, 0.72, 0.85] as const;

const PANEL_SELECTOR = "[data-package-logos-panel]";

const shellStyles = css({
  position: "absolute",
  left: "0",
  right: "0",
  zIndex: "11",
  pointerEvents: "none",
  transition: "opacity 300ms ease",
});

const logoStyles = css({
  position: "absolute",
  background: "var(--brand-cycle, #2dacf9)",
  maskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
});

const STAGGER = 0.18;
const FADE_IN = 0.16;
const FADE_OUT_START = 1.9;
const FADE_OUT_END = 2.12;

/** morph range where package logos are relevant (Full Stack section). */
const MORPH_SECTION_MIN = 0.4;
const MORPH_SECTION_MAX = 2.25;

function logoOpacity(revealProgress: number, morph: number, index: number) {
  const inStart = index * STAGGER;
  const fadeIn = clamp01((revealProgress - inStart) / FADE_IN);
  const fadeOut = clamp01(
    (FADE_OUT_END - morph) / (FADE_OUT_END - FADE_OUT_START),
  );
  return fadeIn * fadeOut;
}

function morphInLogoSection(morph: number): boolean {
  return morph >= MORPH_SECTION_MIN && morph <= MORPH_SECTION_MAX;
}

export function PackageLogos(
  handle: Handle<{ morphValueRef: { current: number } }>,
) {
  let scrollFrameId = 0;

  let panelTop = 0;
  let panelLeft = 0;
  let panelWidth = 0;
  let panelHeight = 0;
  let panelElement: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function measurePanel(): boolean {
    if (!panelElement) return false;
    const rect = panelElement.getBoundingClientRect();
    const nextTop = rect.top + window.scrollY;
    const nextLeft = rect.left + window.scrollX;
    const nextWidth = rect.width;
    const nextHeight = rect.height;
    if (
      nextTop === panelTop &&
      nextLeft === panelLeft &&
      nextWidth === panelWidth &&
      nextHeight === panelHeight
    ) {
      return false;
    }
    panelTop = nextTop;
    panelLeft = nextLeft;
    panelWidth = nextWidth;
    panelHeight = nextHeight;
    return true;
  }

  function locatePanel() {
    if (panelElement && panelElement.isConnected) return;
    panelElement = document.querySelector<HTMLElement>(PANEL_SELECTOR);
    if (!panelElement) return;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(() => {
        if (measurePanel()) handle.update();
      });
      resizeObserver.observe(panelElement);
    }
    measurePanel();
  }

  function scheduleScrollUpdate() {
    if (scrollFrameId) return;
    scrollFrameId = requestAnimationFrame(() => {
      scrollFrameId = 0;
      handle.update();
    });
  }

  window.addEventListener("scroll", scheduleScrollUpdate, {
    signal: handle.signal,
  });
  window.addEventListener(
    "resize",
    () => {
      if (measurePanel()) handle.update();
    },
    { signal: handle.signal },
  );

  handle.queueTask(() => {
    locatePanel();
    handle.update();
  });

  handle.signal.addEventListener("abort", () => {
    if (scrollFrameId) {
      cancelAnimationFrame(scrollFrameId);
      scrollFrameId = 0;
    }
    resizeObserver?.disconnect();
    resizeObserver = null;
    panelElement = null;
  });

  return () => {
    if (!panelElement || !panelElement.isConnected) locatePanel();

    const morphValue = handle.props.morphValueRef.current;
    const inSection = morphInLogoSection(morphValue);
    const reduceMotion = reducedMotion.current;
    const revealDistance = Math.min(900, Math.max(650, window.innerHeight));
    const revealProgress = clamp01(
      (window.scrollY + window.innerHeight * 0.68 - panelTop) / revealDistance,
    );
    const stackedHeight = panelHeight * 0.94;
    const logoScale = window.innerWidth <= 760 ? 0.8 : 1;
    const logoLayouts = LOGOS.map((logo, index) => {
      const [intrinsicWidth, intrinsicHeight] = logo.ratio
        .split("/")
        .map((value) => parseFloat(value.trim()));
      const width =
        Math.min(
          LOGO_MAX_WIDTHS[index],
          panelWidth * LOGO_STAGE_WIDTHS[index],
        ) * logoScale;
      return { width, height: width * (intrinsicHeight / intrinsicWidth) };
    });
    const logoHeight = logoLayouts.reduce(
      (total, layout) => total + layout.height,
      0,
    );
    const rowGap = (stackedHeight - logoHeight) / (LOGOS.length - 1);

    return (
      <div
        mix={[shellStyles]}
        style={{
          top: `${panelTop + (panelHeight - stackedHeight) / 2}px`,
          left: `${panelLeft}px`,
          right: "auto",
          width: `${panelWidth}px`,
          height: `${stackedHeight}px`,
        }}
      >
        {LOGOS.map((logo, i) => {
          const layout = logoLayouts[i];
          const top = logoLayouts
            .slice(0, i)
            .reduce((offset, row) => offset + row.height + rowGap, 0);
          return (
            <div
              key={logo.alt}
              mix={[logoStyles]}
              style={{
                top: `${top}px`,
                left: "auto",
                right: `${(panelWidth - layout.width) / 2}px`,
                width: `${layout.width}px`,
                height: `${layout.height}px`,
                aspectRatio: logo.ratio,
                maskImage: `url(${logo.src})`,
                WebkitMaskImage: `url(${logo.src})`,
                opacity: `${reduceMotion && inSection ? 1 : logoOpacity(revealProgress, morphValue, i)}`,
              }}
            />
          );
        })}
      </div>
    );
  };
}
