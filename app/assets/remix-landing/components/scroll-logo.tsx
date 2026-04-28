import { css, addEventListeners, on, type Handle } from "remix/component";
import { routes } from "../../../routes";
import { Wordmark } from "../../../ui/wordmark";
import { brandContextMenu } from "../../brand-context-menu";
import { clamp01, lerp } from "../utils/math";

const SMALL_HEIGHT = 16;
const LARGE_TOP = 92;
const SMALL_TOP = 24;
const LEFT = 24;
const SCROLL_PX = 120;
const SVG_RATIO = 440 / 43;
const SMALL_WIDTH = SMALL_HEIGHT * SVG_RATIO;

const BRAND_COLORS = ["#2dacf9", "#7ce95a", "#ffdf5f", "#fa73da", "#ff3c32"];

function getScrollProgress(scrollY: number) {
  const linear = clamp01(scrollY / SCROLL_PX);
  return linear < 0.5
    ? 4 * linear * linear * linear
    : 1 - Math.pow(-2 * linear + 2, 3) / 2;
}

const shellStyles = css({
  position: "fixed",
  left: `${LEFT}px`,
  zIndex: "25",
  transformOrigin: "top left",
  willChange: "transform, top",
  pointerEvents: "none",
});

const mainSvgStyles = css({
  display: "block",
  color: `var(--brand-cycle, #EBEFF2)`,
});

const logoButtonStyles = css({
  display: "block",
  padding: "0",
  margin: "0",
  border: "none",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  pointerEvents: "auto",
  WebkitTapHighlightColor: "transparent",
  appearance: "none",
  "&:focus-visible": {
    outline: "2px solid var(--brand-cycle, #EBEFF2)",
    outlineOffset: "4px",
  },
});

const ghostSvgStyles = css({
  position: "absolute",
  top: "0",
  left: "0",
  display: "block",
  mixBlendMode: "screen",
});

export function ScrollLogo(handle: Handle) {
  let largeWidth = window.innerWidth - LEFT * 2;
  let scrollY = window.scrollY;
  let prevT = getScrollProgress(scrollY);
  let velocity = 0;
  let scrollFrame = 0;
  let decayFrame = 0;
  const brandMenu = brandContextMenu(routes.brand.href());
  const scrollToTop = on<HTMLButtonElement>("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function scheduleScrollSync() {
    scrollY = window.scrollY;
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      handle.update();
    });
  }

  function scheduleDecay() {
    if (decayFrame) return;
    decayFrame = requestAnimationFrame(() => {
      decayFrame = 0;
      velocity *= 0.82;
      if (Math.abs(velocity) < 0.001) {
        velocity = 0;
      }
      handle.update();
      if (velocity !== 0) scheduleDecay();
    });
  }

  addEventListeners(window, handle.signal, {
    scroll: () => scheduleScrollSync(),
    resize: () => {
      largeWidth = window.innerWidth - LEFT * 2;
      scrollY = window.scrollY;
      handle.update();
    },
  });

  handle.signal.addEventListener("abort", () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    if (decayFrame) cancelAnimationFrame(decayFrame);
  });

  return () => {
    const t = getScrollProgress(scrollY);
    const rawVelocity = t - prevT;
    if (Math.abs(rawVelocity) > 0.0001) {
      velocity += (rawVelocity - velocity) * 0.15;
    }
    prevT = t;

    if (Math.abs(velocity) < 0.001) {
      velocity = 0;
    } else {
      scheduleDecay();
    }

    const width = lerp(largeWidth, SMALL_WIDTH, t);
    const top = lerp(LARGE_TOP, SMALL_TOP, t);

    const absV = Math.abs(velocity);
    const ghostIntensity = clamp01(absV * 60);
    const isCollapsed = t >= 1;

    return (
      <div mix={[shellStyles]} style={{ top: `${top}px` }}>
        {ghostIntensity > 0.01 &&
          BRAND_COLORS.map((color, i) => {
            const delay = (i + 1) * 0.04;
            const ghostT = clamp01(t - delay * Math.sign(velocity));
            const ghostWidth = lerp(largeWidth, SMALL_WIDTH, ghostT);
            const ghostHeight = ghostWidth / SVG_RATIO;
            const ghostOpacity = ghostIntensity * (0.6 - i * 0.08);
            if (ghostOpacity <= 0) return null;
            return (
              <Wordmark
                key={i}
                aria-hidden
                width={ghostWidth}
                height={ghostHeight}
                mix={[ghostSvgStyles]}
                style={{
                  color: color,
                  opacity: `${ghostOpacity}`,
                }}
              />
            );
          })}
        <button
          type="button"
          aria-label="Scroll to top"
          mix={[logoButtonStyles, isCollapsed ? brandMenu : null, scrollToTop]}
          style={{ width: `${width}px` }}
        >
          <Wordmark
            aria-hidden
            width={width}
            height={width / SVG_RATIO}
            mix={[mainSvgStyles]}
          />
        </button>
      </div>
    );
  };
}
