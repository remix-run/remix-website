import { css, addEventListeners, on, type Handle } from "remix/ui";
import { routes } from "../../../routes";
import { Wordmark } from "../../../ui/wordmark";
import { brandContextMenu } from "../../brand-context-menu";
import { clamp01, lerp } from "../utils/math";
import { motionScrollBehavior, reducedMotion } from "../utils/reduced-motion";

const SMALL_HEIGHT = 16;
const LARGE_TOP = 92;
const SMALL_TOP = 24;
const LEFT = 24;
const SCROLL_PX = 120;
const SVG_RATIO = 440 / 43;
const SMALL_WIDTH = SMALL_HEIGHT * SVG_RATIO;

const BRAND_COLORS = ["#2dacf9", "#7ce95a", "#ffdf5f", "#fa73da", "#ff3c32"];
// Seconds-scale exponential time constants; each ghost settles toward the
// target independently, so the trail fans out naturally during fast scrolling
// and collapses smoothly when motion stops. Kept tight so ghosts catch up
// quickly after the scroll stops.
const GHOST_TAUS = [0.018, 0.03, 0.045, 0.06, 0.08];
// Width delta (px between ghost and main) that maps to full per-ghost
// opacity. Smaller taus produce smaller deltas, so the falloff tracks them.
const OPACITY_FALLOFF_PX = 18;
const SETTLE_EPSILON = 0.2;

function getScrollProgress(scrollY: number) {
  const linear = clamp01(scrollY / SCROLL_PX);
  return linear < 0.5
    ? 4 * linear * linear * linear
    : 1 - Math.pow(-2 * linear + 2, 3) / 2;
}

const shellStyles = css({
  position: "fixed",
  top: "0",
  left: `${LEFT}px`,
  zIndex: "25",
  pointerEvents: "none",
});

const mainSvgStyles = css({
  position: "absolute",
  top: "0",
  left: "0",
  display: "block",
  color: `var(--brand-cycle, #EBEFF2)`,
  willChange: "transform",
});

const logoLinkStyles = css({
  position: "absolute",
  top: "0",
  left: "0",
  display: "block",
  padding: "0",
  margin: "0",
  border: "none",
  background: "transparent",
  color: `var(--brand-cycle, #EBEFF2)`,
  cursor: "pointer",
  pointerEvents: "auto",
  WebkitTapHighlightColor: "transparent",
  appearance: "none",
  willChange: "transform",
  "&:focus-visible": {
    outline: "2px solid var(--brand-cycle, #EBEFF2)",
    outlineOffset: "4px",
  },
});

const innerSvgStyles = css({
  display: "block",
  color: "inherit",
});

const ghostSvgStyles = css({
  position: "absolute",
  top: "0",
  left: "0",
  display: "block",
  mixBlendMode: "screen",
  willChange: "transform, opacity",
  pointerEvents: "none",
});

async function replaceCurrentUrl(href: string) {
  const navigation = window.navigation;

  if (!navigation) {
    window.history.replaceState(window.history.state, "", href);
    return;
  }

  const state = navigation.currentEntry?.getState();
  const transition = navigation.navigate(href, { history: "replace" });
  await transition.committed;
  navigation.updateCurrentEntry({ state });
}

export function ScrollLogo(handle: Handle) {
  let largeWidth = window.innerWidth - LEFT * 2;
  let scrollY = window.scrollY;

  // Each ghost has its own lagging (width, top). Initialize flush with the
  // main logo so nothing's visible until real motion fans them out.
  const initialT = getScrollProgress(scrollY);
  const initialWidth = lerp(largeWidth, SMALL_WIDTH, initialT);
  const initialTop = lerp(LARGE_TOP, SMALL_TOP, initialT);
  const ghostState = GHOST_TAUS.map(() => ({
    width: initialWidth,
    top: initialTop,
  }));

  let rafId = 0;
  let lastTime = 0;

  const brandMenu = brandContextMenu(routes.brand.href());
  const scrollHomeToTop = on<HTMLAnchorElement>("click", (event) => {
    if (
      event instanceof MouseEvent &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      event.preventDefault();
      void replaceCurrentUrl(routes.home.href());
      window.scrollTo({ top: 0, behavior: motionScrollBehavior() });
    }
  });

  function tick(now: number) {
    const dt = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    scrollY = window.scrollY;
    const t = getScrollProgress(scrollY);
    const targetWidth = lerp(largeWidth, SMALL_WIDTH, t);
    const targetTop = lerp(LARGE_TOP, SMALL_TOP, t);

    let active = false;
    for (let i = 0; i < GHOST_TAUS.length; i++) {
      const gs = ghostState[i];
      // Framerate-independent exponential approach toward the target.
      const alpha = reducedMotion.current
        ? 1
        : 1 - Math.exp(-dt / GHOST_TAUS[i]);
      gs.width += (targetWidth - gs.width) * alpha;
      gs.top += (targetTop - gs.top) * alpha;
      if (
        Math.abs(targetWidth - gs.width) > SETTLE_EPSILON ||
        Math.abs(targetTop - gs.top) > SETTLE_EPSILON
      ) {
        active = true;
      }
    }

    handle.update();

    if (active && !reducedMotion.current) {
      rafId = requestAnimationFrame(tick);
    } else {
      for (const gs of ghostState) {
        gs.width = targetWidth;
        gs.top = targetTop;
      }
      rafId = 0;
      lastTime = 0;
    }
  }

  function ensureLoop() {
    scrollY = window.scrollY;
    if (rafId) {
      // Loop is already running; it will pick up the new scrollY on the next
      // frame. Nothing else to do.
      return;
    }
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }

  addEventListeners(window, handle.signal, {
    scroll: () => ensureLoop(),
    resize: () => {
      largeWidth = window.innerWidth - LEFT * 2;
      ensureLoop();
    },
  });

  handle.signal.addEventListener("abort", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });

  return () => {
    const t = getScrollProgress(scrollY);
    const mainWidth = lerp(largeWidth, SMALL_WIDTH, t);
    const mainTop = lerp(LARGE_TOP, SMALL_TOP, t);
    const isCollapsed = t >= 1;

    return (
      <div mix={[shellStyles]}>
        {BRAND_COLORS.map((color, i) => {
          const gs = ghostState[i];
          const deltaW = gs.width - mainWidth;
          // Opacity tracks how far this ghost trails the main logo, so it
          // fades in/out smoothly without any hard threshold.
          const intensity = clamp01(Math.abs(deltaW) / OPACITY_FALLOFF_PX);
          const opacity = intensity * (0.55 - i * 0.075);
          return (
            <Wordmark
              key={i}
              aria-hidden
              width={gs.width}
              height={gs.width / SVG_RATIO}
              mix={[ghostSvgStyles]}
              style={{
                color,
                opacity: opacity.toFixed(3),
                transform: `translate3d(0, ${gs.top.toFixed(2)}px, 0)`,
              }}
            />
          );
        })}
        {isCollapsed ? (
          <a
            href={routes.home.href()}
            aria-label="Remix home"
            mix={[logoLinkStyles, brandMenu, scrollHomeToTop]}
            style={{
              width: `${mainWidth}px`,
              transform: `translate3d(0, ${mainTop.toFixed(2)}px, 0)`,
            }}
          >
            <Wordmark
              aria-hidden
              width={mainWidth}
              height={mainWidth / SVG_RATIO}
              mix={[innerSvgStyles]}
            />
          </a>
        ) : (
          <Wordmark
            aria-hidden
            width={mainWidth}
            height={mainWidth / SVG_RATIO}
            mix={[mainSvgStyles]}
            style={{
              transform: `translate3d(0, ${mainTop.toFixed(2)}px, 0)`,
            }}
          />
        )}
      </div>
    );
  };
}
