import { css, on, type Handle } from "remix/component";
import { routes } from "../../../../routes.ts";
import { Wordmark } from "../../../../ui/public/wordmark.tsx";
import { brandContextMenu } from "../../../../ui/public/brand-context-menu.ts";
import { theme } from "../../../../ui/public/styles/theme.ts";
import { clamp01, lerp } from "../math.ts";
import { reducedMotion } from "../reduced-motion.ts";

const SMALL_HEIGHT = 16;
const LARGE_TOP = 92;
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

/** Rendered size and vertical offset of a wordmark. */
export type LogoBox = { width: number; top: number };

export function ScrollLogo(handle: Handle) {
  let edgeInset = readEdgeInset();
  let largeWidth = window.innerWidth - edgeInset * 2;
  let scrollY = 0;

  // Navigation resets scroll after creating the next page's components, so
  // initialize for the top of the landing page instead of inheriting the
  // previous page's scroll position.
  let ghosts: LogoBox[] = GHOST_TAUS.map(() => ({
    width: largeWidth,
    top: LARGE_TOP,
  }));

  let rafId = 0;
  let lastTime = 0;
  let canAnimateScroll = false;

  function readTarget() {
    scrollY = window.scrollY;
    return getLogoBox(scrollY, largeWidth, edgeInset);
  }

  function tick(now: number) {
    let dt = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    let target = readTarget();
    let active = stepGhosts(ghosts, target, dt, reducedMotion.current);

    handle.update();

    if (active && !reducedMotion.current) {
      rafId = requestAnimationFrame(tick);
    } else {
      snapGhosts(ghosts, target);
      rafId = 0;
      lastTime = 0;
    }
  }

  function syncToScroll() {
    snapGhosts(ghosts, readTarget());
    handle.update();
  }

  function ensureLoop() {
    scrollY = window.scrollY;
    if (rafId) return;
    lastTime = 0;
    rafId = requestAnimationFrame(tick);
  }

  handle.queueTask(async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    if (handle.signal.aborted) return;
    syncToScroll();
    canAnimateScroll = true;
  });

  window.addEventListener(
    "scroll",
    () => {
      if (canAnimateScroll) ensureLoop();
      else syncToScroll();
    },
    { signal: handle.signal },
  );
  window.addEventListener(
    "resize",
    () => {
      edgeInset = readEdgeInset();
      largeWidth = window.innerWidth - edgeInset * 2;
      ensureLoop();
    },
    { signal: handle.signal },
  );

  handle.signal.addEventListener("abort", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });

  return () => {
    let main = getLogoBox(scrollY, largeWidth, edgeInset);
    let isCollapsed = getScrollProgress(scrollY) >= 1;

    return (
      <div mix={[shellStyles]}>
        {BRAND_COLORS.map((color, i) => (
          <Wordmark
            key={i}
            aria-hidden
            width={ghosts[i].width}
            height={ghosts[i].width / SVG_RATIO}
            mix={[ghostSvgStyles]}
            style={{
              color,
              opacity: ghostOpacity(i, ghosts[i].width, main.width).toFixed(3),
              transform: `translate3d(0, ${ghosts[i].top.toFixed(2)}px, 0)`,
            }}
          />
        ))}
        {isCollapsed ? (
          <HomeLogoLink width={main.width} top={main.top} />
        ) : (
          <Wordmark
            aria-hidden
            width={main.width}
            height={main.width / SVG_RATIO}
            mix={[mainSvgStyles]}
            style={{
              transform: `translate3d(0, ${main.top.toFixed(2)}px, 0)`,
            }}
          />
        )}
      </div>
    );
  };
}

/**
 * The collapsed corner logo links home. A plain click on the landing page
 * scrolls back to the top instead of reloading; right-click opens the brand
 * page.
 */
function HomeLogoLink(handle: Handle<LogoBox>) {
  let brandMenu = brandContextMenu(routes.brand.href());
  let scrollHomeToTop = on<HTMLAnchorElement>("click", (event) => {
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    void replaceCurrentUrl(routes.home.href());
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  return () => {
    let { width, top } = handle.props;
    return (
      <a
        href={routes.home.href()}
        aria-label="Remix home"
        mix={[logoLinkStyles, brandMenu, scrollHomeToTop]}
        style={{
          width: `${width}px`,
          transform: `translate3d(0, ${top.toFixed(2)}px, 0)`,
        }}
      >
        <Wordmark
          aria-hidden
          width={width}
          height={width / SVG_RATIO}
          mix={[innerSvgStyles]}
        />
      </a>
    );
  };
}

/** Eased 0…1 collapse progress over the first `SCROLL_PX` of scroll. */
export function getScrollProgress(scrollY: number) {
  let linear = clamp01(scrollY / SCROLL_PX);
  return linear < 0.5
    ? 4 * linear * linear * linear
    : 1 - Math.pow(-2 * linear + 2, 3) / 2;
}

/** Where the main wordmark sits: full-width hero → small corner logo. */
export function getLogoBox(
  scrollY: number,
  largeWidth: number,
  edgeInset: number,
): LogoBox {
  let t = getScrollProgress(scrollY);
  return {
    width: lerp(largeWidth, SMALL_WIDTH, t),
    top: lerp(LARGE_TOP, edgeInset, t),
  };
}

/**
 * Moves each ghost a frame-rate-independent step toward `target` (or straight
 * to it with reduced motion). Returns whether any ghost is still catching up.
 */
export function stepGhosts(
  ghosts: LogoBox[],
  target: LogoBox,
  dt: number,
  reduceMotion: boolean,
): boolean {
  let active = false;
  for (let i = 0; i < ghosts.length; i++) {
    let ghost = ghosts[i];
    let alpha = reduceMotion ? 1 : 1 - Math.exp(-dt / GHOST_TAUS[i]);
    ghost.width += (target.width - ghost.width) * alpha;
    ghost.top += (target.top - ghost.top) * alpha;
    if (
      Math.abs(target.width - ghost.width) > SETTLE_EPSILON ||
      Math.abs(target.top - ghost.top) > SETTLE_EPSILON
    ) {
      active = true;
    }
  }
  return active;
}

/**
 * Opacity tracks how far a ghost trails the main logo, so it fades in/out
 * smoothly without any hard threshold. Later ghosts are fainter.
 */
export function ghostOpacity(
  index: number,
  ghostWidth: number,
  mainWidth: number,
) {
  let intensity = clamp01(
    Math.abs(ghostWidth - mainWidth) / OPACITY_FALLOFF_PX,
  );
  return intensity * (0.55 - index * 0.075);
}

function snapGhosts(ghosts: LogoBox[], target: LogoBox) {
  for (let ghost of ghosts) {
    ghost.width = target.width;
    ghost.top = target.top;
  }
}

function isPlainLeftClick(event: Event) {
  return (
    event instanceof MouseEvent &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

// The collapsed logo sits in the corner at the shared page-chrome inset.
function readEdgeInset() {
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--site-edge-inset",
    ),
  );
}

async function replaceCurrentUrl(href: string) {
  let navigation = window.navigation;

  if (!navigation) {
    window.history.replaceState(window.history.state, "", href);
    return;
  }

  let state = navigation.currentEntry?.getState();
  let transition = navigation.navigate(href, { history: "replace" });
  await transition.committed;
  navigation.updateCurrentEntry({ state });
}

const shellStyles = css({
  position: "fixed",
  top: "0",
  left: theme.space.edge,
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
