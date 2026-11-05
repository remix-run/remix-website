import { css, type Handle } from "remix/component";
import { reducedMotion } from "../reduced-motion.ts";
import {
  layoutPackageLogos,
  PACKAGE_LOGOS,
  type PanelRect,
} from "./package-logos-layout.ts";

const PANEL_SELECTOR = "[data-package-logos-panel]";

export function PackageLogos(handle: Handle) {
  let scrollFrameId = 0;
  let panel = createPanelTracker(() => handle.update());

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
      if (panel.measure()) handle.update();
    },
    { signal: handle.signal },
  );

  handle.queueTask(() => {
    panel.locate();
    handle.update();
  });

  handle.signal.addEventListener("abort", () => {
    if (scrollFrameId) {
      cancelAnimationFrame(scrollFrameId);
      scrollFrameId = 0;
    }
    panel.dispose();
  });

  return () => {
    panel.locate();

    let rect = panel.rect;
    let layout = layoutPackageLogos({
      panel: rect,
      scrollY: window.scrollY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      reduceMotion: reducedMotion.current,
    });

    return (
      <div
        mix={[shellStyles]}
        style={{
          top: `${layout.top}px`,
          left: `${rect.left}px`,
          right: "auto",
          width: `${rect.width}px`,
          height: `${layout.height}px`,
        }}
      >
        {PACKAGE_LOGOS.map((logo, i) => {
          let { top, right, width, height, opacity } = layout.logos[i];
          return (
            <div
              key={logo.alt}
              mix={[logoStyles]}
              style={{
                top: `${top}px`,
                left: "auto",
                right: `${right}px`,
                width: `${width}px`,
                height: `${height}px`,
                aspectRatio: logo.ratio,
                maskImage: `url(${logo.src})`,
                WebkitMaskImage: `url(${logo.src})`,
                opacity: `${opacity}`,
              }}
            />
          );
        })}
      </div>
    );
  };
}

/**
 * Finds the package logos panel and tracks its document-relative rect.
 * `onResize` runs when a ResizeObserver reports a changed rect.
 */
function createPanelTracker(onResize: () => void) {
  let rect: PanelRect = { top: 0, left: 0, width: 0, height: 0 };
  let element: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  /** Re-reads the rect; returns whether it changed. */
  function measure(): boolean {
    if (!element) return false;
    let bounds = element.getBoundingClientRect();
    let next = {
      top: bounds.top + window.scrollY,
      left: bounds.left + window.scrollX,
      width: bounds.width,
      height: bounds.height,
    };
    if (
      next.top === rect.top &&
      next.left === rect.left &&
      next.width === rect.width &&
      next.height === rect.height
    ) {
      return false;
    }
    Object.assign(rect, next);
    return true;
  }

  function locate() {
    if (element && element.isConnected) return;
    element = document.querySelector<HTMLElement>(PANEL_SELECTOR);
    if (!element) return;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(() => {
        if (measure()) onResize();
      });
      resizeObserver.observe(element);
    }
    measure();
  }

  function dispose() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    element = null;
  }

  return { rect, measure, locate, dispose };
}

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
