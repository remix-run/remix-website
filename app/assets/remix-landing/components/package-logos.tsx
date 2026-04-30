import { addEventListeners, css, type Handle } from "remix/ui";
import { clamp01 } from "../utils/math";

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

/**
 * Vertical rhythm for the logo stack, expressed as fractions of the stack's total
 * height. The stack is anchored to the full-stack section's text panel at runtime,
 * so "0" = top of the panel, "1" = bottom of the panel. Heights are fractions of
 * panel height too, which keeps the stack's proportions when the panel grows or
 * shrinks with the copy.
 */
const ROWS: { topFraction: number; heightFraction: number }[] = [
  { topFraction: 0.0, heightFraction: 0.1786 }, // Auth
  { topFraction: 0.2656, heightFraction: 0.1786 }, // Routing
  { topFraction: 0.5, heightFraction: 0.1607 }, // Data (row 3, left of Session)
  { topFraction: 0.5, heightFraction: 0.1607 }, // Session (row 3, right-aligned)
  { topFraction: 0.75, heightFraction: 0.25 }, // Component
];

const VIEWPORT_GUTTER_PX = 24;
const DATA_SESSION_GAP_PX = 30;
const STACKED_LOGO_BREAKPOINT_PX = 880;
const STACKED_LOGO_GAP_PX = 24;

const shellStyles = css({
  position: "absolute",
  left: "0",
  right: "0",
  zIndex: "7",
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

const ARRIVE = 0.48;
const STAGGER = 0.035;
const FADE_IN = 0.07;
const FADE_OUT_START = 1.82;
const FADE_OUT_END = 2.12;

/** morph range where package logos are relevant (Full Stack section). */
const MORPH_SECTION_MIN = 0.4;
const MORPH_SECTION_MAX = 2.25;

const LOGO_DELAY_MS = 1000;
/** Order: Auth → Routing → Data → Session → Component (top-to-bottom, then row L→R). */
const SEQUENCE_STAGGER_MS = 140;
const PER_LOGO_FADE_MS = 420;
const SEQUENCE_TOTAL_MS =
  (LOGOS.length - 1) * SEQUENCE_STAGGER_MS + PER_LOGO_FADE_MS;

function logoOpacity(morph: number, index: number): number {
  const inStart = ARRIVE + index * STAGGER;
  const fadeIn = clamp01((morph - inStart) / FADE_IN);
  const fadeOut = clamp01(
    (FADE_OUT_END - morph) / (FADE_OUT_END - FADE_OUT_START),
  );
  return fadeIn * fadeOut;
}

function morphInLogoSection(morph: number): boolean {
  return morph >= MORPH_SECTION_MIN && morph <= MORPH_SECTION_MAX;
}

function sequenceFade(
  index: number,
  sequenceStartMs: number | null,
  now: number,
): number {
  if (sequenceStartMs === null) return 0;
  const elapsed = now - sequenceStartMs;
  const start = index * SEQUENCE_STAGGER_MS;
  if (elapsed < start) return 0;
  return clamp01((elapsed - start) / PER_LOGO_FADE_MS);
}

export function PackageLogos(handle: Handle) {
  let wasInSection = false;
  let sequenceStartMs: number | null = null;
  let delayTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId = 0;

  let panelTop = 0;
  let panelLeft = 0;
  let panelWidth = 0;
  let panelHeight = 0;
  let viewportWidth = 0;
  let panelElement: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function measurePanel(): boolean {
    if (!panelElement) return false;
    const rect = panelElement.getBoundingClientRect();
    const nextTop = rect.top + window.scrollY;
    const nextLeft = rect.left + window.scrollX;
    const nextWidth = rect.width;
    const nextHeight = rect.height;
    const nextViewportWidth = window.innerWidth;
    if (
      nextTop === panelTop &&
      nextLeft === panelLeft &&
      nextWidth === panelWidth &&
      nextHeight === panelHeight &&
      nextViewportWidth === viewportWidth
    ) {
      return false;
    }
    panelTop = nextTop;
    panelLeft = nextLeft;
    panelWidth = nextWidth;
    panelHeight = nextHeight;
    viewportWidth = nextViewportWidth;
    return true;
  }

  function locatePanel() {
    if (panelElement && panelElement.isConnected) return;
    panelElement = document.getElementById(
      "full-stack-panel",
    ) as HTMLElement | null;
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

  function stopSequenceLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function runSequenceLoop() {
    if (sequenceStartMs === null) return;
    handle.update();
    const elapsed = performance.now() - sequenceStartMs;
    if (elapsed < SEQUENCE_TOTAL_MS) {
      rafId = requestAnimationFrame(runSequenceLoop);
    }
  }

  addEventListeners(window, handle.signal, {
    resize: () => {
      if (measurePanel()) handle.update();
    },
  });

  handle.queueTask(() => {
    locatePanel();
    handle.update();
  });

  handle.signal.addEventListener("abort", () => {
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    stopSequenceLoop();
    resizeObserver?.disconnect();
    resizeObserver = null;
    panelElement = null;
  });

  return (props: { morphValue: number }) => {
    if (!panelElement || !panelElement.isConnected) locatePanel();

    const inSection = morphInLogoSection(props.morphValue);
    const now = performance.now();

    if (inSection) {
      if (!wasInSection) {
        sequenceStartMs = null;
        stopSequenceLoop();
        if (delayTimer) clearTimeout(delayTimer);
        delayTimer = setTimeout(() => {
          delayTimer = null;
          sequenceStartMs = performance.now();
          handle.update();
          rafId = requestAnimationFrame(runSequenceLoop);
        }, LOGO_DELAY_MS);
      }
    } else if (wasInSection) {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
      stopSequenceLoop();
      sequenceStartMs = null;
    }
    wasInSection = inSection;

    const stackBelowPanel = viewportWidth <= STACKED_LOGO_BREAKPOINT_PX;

    // Session width derives from its row height, which is a fraction of the panel
    // height. Data sits to its left, so its right offset grows with Session's width.
    const sessionHeightPx = panelHeight * ROWS[3].heightFraction;
    const sessionWidthPx = sessionHeightPx * (797 / 288);
    const dataRightPx =
      VIEWPORT_GUTTER_PX + DATA_SESSION_GAP_PX + sessionWidthPx;

    return (
      <div
        mix={[shellStyles]}
        style={{
          top: `${stackBelowPanel ? panelTop + panelHeight + STACKED_LOGO_GAP_PX : panelTop}px`,
          left: stackBelowPanel ? `${panelLeft}px` : "0",
          right: stackBelowPanel ? "auto" : "0",
          width: stackBelowPanel ? `${panelWidth}px` : "auto",
          height: `${panelHeight}px`,
        }}
      >
        {LOGOS.map((logo, i) => {
          const row = ROWS[i];
          const seq = sequenceFade(i, sequenceStartMs, now);
          const right =
            i === 2 ? `${dataRightPx}px` : `${VIEWPORT_GUTTER_PX}px`;
          return (
            <div
              key={logo.alt}
              mix={[logoStyles]}
              style={{
                top: `${row.topFraction * 100}%`,
                left: "auto",
                right,
                height: `${row.heightFraction * 100}%`,
                aspectRatio: logo.ratio,
                maskImage: `url(${logo.src})`,
                WebkitMaskImage: `url(${logo.src})`,
                opacity: `${logoOpacity(props.morphValue, i) * seq}`,
              }}
            />
          );
        })}
      </div>
    );
  };
}
