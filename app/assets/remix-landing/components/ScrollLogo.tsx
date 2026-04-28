import { css, addEventListeners, on, type Handle } from "remix/component";

const SMALL_HEIGHT = 16;
const LARGE_TOP = 92;
const SMALL_TOP = 24;
const LEFT = 24;
const SCROLL_PX = 120;

const BRAND_COLORS = ["#2dacf9", "#7ce95a", "#ffdf5f", "#fa73da", "#ff3c32"];

const SVG_PATHS = [
  "M81.5098 0.0492554L81.5088 0.0502319V0.0512085C92.8976 0.0512085 100.766 5.13219 99.084 11.4008L97.9443 15.6459C96.2619 21.9146 85.6671 26.9964 74.2783 26.9965H73.1123L97.0352 42.5922H58.627L39.2881 27.7514C38.5139 27.2578 37.6147 26.9955 36.6963 26.9955H4.36816L7.41406 15.644H64.0391C66.1678 15.644 68.1501 14.6941 68.4648 13.5219H68.4658C68.7805 12.3497 67.3085 11.3989 65.1787 11.3989H8.55371L11.5996 0.0492554H81.5098ZM31.2402 30.9135C32.313 30.9136 33.0943 31.9304 32.8164 32.9653L30.2334 42.5912H0.183594L3.31738 30.9135H31.2402Z",
  "M307.883 42.8041L319.33 0.33374H349.554L338.037 42.8041H307.883Z",
  "M193.893 0.333862H291.753C304.875 0.333862 313.949 6.16313 311.995 13.3803L304.038 42.8042H273.884L278.002 27.6065L280.375 18.932L281.283 15.601C281.841 13.4497 279.119 11.6454 275.14 11.6454H266.555C266.485 12.2006 266.485 12.7558 266.276 13.3803L258.388 42.8042H228.165L232.283 27.6065L234.656 18.932L235.563 15.601C236.122 13.4497 233.4 11.6454 229.421 11.6454H221.045L212.599 42.8042H182.445L193.893 0.333862Z",
  "M394.464 7.36133L404.841 0.59082H439.896L408.101 21.335L428.752 42.499H393.696L386.682 35.3096L375.663 42.499H340.607L373.045 21.335L352.801 0.59082H387.856L394.464 7.36133Z",
  "M190.38 0.333679L187.379 11.6452H138.588C138.568 11.6452 138.548 11.6461 138.528 11.6462H131.452L130.339 15.8698H130.354L130.352 15.8786H186.193L183.191 27.2595H127.28L127.211 27.6061C126.583 29.7573 129.305 31.4927 133.283 31.4929H182.004L178.933 42.8044H116.671C103.549 42.8043 94.4745 36.9746 96.4289 29.8268L100.826 13.3806C100.924 13.0184 101.049 12.6599 101.197 12.3054V12.3063L104.353 0.333679H190.38Z",
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const shellStyles = css({
  position: "fixed",
  left: `${LEFT}px`,
  zIndex: "25",
  transformOrigin: "top left",
  willChange: "transform, top",
  pointerEvents: "none",
});

const svgBaseStyles = css({
  display: "block",
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

function svgPaths() {
  return SVG_PATHS.map((d, i) => <path key={i} d={d} fill="currentColor" />);
}

export function ScrollLogo(handle: Handle) {
  let largeWidth = window.innerWidth - LEFT * 2;
  let prevT = 0;
  let velocity = 0;
  let decayFrame = 0;

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
    resize: () => {
      largeWidth = window.innerWidth - LEFT * 2;
      handle.update();
    },
  });

  handle.signal.addEventListener("abort", () => {
    if (decayFrame) cancelAnimationFrame(decayFrame);
  });

  return (props: { scrollY: number }) => {
    const linear = Math.min(1, Math.max(0, props.scrollY / SCROLL_PX));
    const t =
      linear < 0.5
        ? 4 * linear * linear * linear
        : 1 - Math.pow(-2 * linear + 2, 3) / 2;

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

    const svgRatio = 440 / 43;
    const smallWidth = SMALL_HEIGHT * svgRatio;
    const width = lerp(largeWidth, smallWidth, t);
    const top = lerp(LARGE_TOP, SMALL_TOP, t);

    const absV = Math.abs(velocity);
    const ghostIntensity = Math.min(1, absV * 60);
    const paths = svgPaths();

    return (
      <div mix={[shellStyles]} style={{ top: `${top}px` }}>
        {ghostIntensity > 0.01 &&
          BRAND_COLORS.map((color, i) => {
            const delay = (i + 1) * 0.04;
            const ghostT = Math.min(
              1,
              Math.max(0, t - delay * Math.sign(velocity)),
            );
            const ghostWidth = lerp(largeWidth, smallWidth, ghostT);
            const ghostOpacity = ghostIntensity * (0.6 - i * 0.08);
            if (ghostOpacity <= 0) return null;
            return (
              <svg
                key={i}
                viewBox="0 0 440 43"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                mix={[ghostSvgStyles]}
                style={{
                  width: `${ghostWidth}px`,
                  height: "auto",
                  color: color,
                  opacity: `${ghostOpacity}`,
                }}
              >
                {paths}
              </svg>
            );
          })}
        <button
          type="button"
          aria-label="Scroll to top"
          mix={[
            logoButtonStyles,
            on("click", () => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }),
          ]}
          style={{ width: `${width}px` }}
        >
          <svg
            viewBox="0 0 440 43"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            mix={[mainSvgStyles]}
            style={{ width: `${width}px`, height: "auto" }}
          >
            {paths}
          </svg>
        </button>
      </div>
    );
  };
}
