import { css, ref, type Handle } from "remix/component";
import { presets } from "../engine/presets.ts";
import { clamp, lerp } from "../math.ts";

const glowStyles = css({
  position: "fixed",
  inset: "0",
  zIndex: "6",
  pointerEvents: "none",
  willChange: "background",
});

const BRAND_GRADIENT =
  "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--brand-cycle) 42%, transparent) 0%, color-mix(in srgb, var(--brand-cycle) 14%, transparent) 42%, transparent 72%)";

function buildGradient(morphValue: number, brandGradientMode: boolean): string {
  if (brandGradientMode) return BRAND_GRADIENT;

  let maxIdx = presets.length - 1;
  let clamped = clamp(morphValue, 0, maxIdx);
  let fromIndex = Math.floor(clamped);
  let toIndex = Math.min(fromIndex + 1, maxIdx);
  let blend = clamped - fromIndex;
  let fallback: [number, number, number] = [0.3, 0.3, 0.3];
  let a = presets[fromIndex]?.glowColor ?? fallback;
  let b = presets[toIndex]?.glowColor ?? fallback;
  let r = Math.round(lerp(a[0], b[0], blend) * 255);
  let g = Math.round(lerp(a[1], b[1], blend) * 255);
  let bl = Math.round(lerp(a[2], b[2], blend) * 255);

  return `radial-gradient(ellipse at 50% 50%, rgba(${r},${g},${bl},0.40) 0%, rgba(${r},${g},${bl},0.12) 40%, transparent 70%)`;
}

// Owns its own rAF loop and writes `background` straight to the DOM. The
// parent passes morphValue through a mutable ref, so scroll frames don't
// re-render App, and the quantized morph value means unchanged gradients are
// never re-assigned, avoiding a re-raster of this viewport-sized layer.
export function PresetGlow(
  handle: Handle<{
    morphValueRef: { current: number };
    brandGradientMode: boolean;
  }>,
) {
  let glowEl: HTMLDivElement | undefined;
  let frameId = 0;
  let lastBackground = "";
  let morphValueRef: { current: number } = { current: 0 };
  let brandGradientMode = false;

  function tick() {
    frameId = 0;
    if (!glowEl) return;

    // Quantize to 0.01 steps so tiny scroll-jitter floats don't retrigger
    // background reassignment. 100 discrete gradients per preset transition
    // is well beyond what's visually distinguishable.
    let quantized = Math.round(morphValueRef.current * 100) / 100;
    let background = buildGradient(quantized, brandGradientMode);
    if (background !== lastBackground) {
      glowEl.style.background = background;
      lastBackground = background;
    }

    frameId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (frameId || !glowEl) return;
    frameId = requestAnimationFrame(tick);
  }

  handle.signal.addEventListener("abort", () => {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  });

  return () => {
    morphValueRef = handle.props.morphValueRef;
    // Force an immediate re-evaluation next frame when brand mode flips so
    // we don't wait on a morphValue change to pick it up.
    if (brandGradientMode !== handle.props.brandGradientMode) {
      brandGradientMode = handle.props.brandGradientMode;
      lastBackground = "";
    }

    return (
      <div
        mix={[
          glowStyles,
          ref((node) => {
            glowEl = node;
            if (node) startLoop();
          }),
        ]}
      />
    );
  };
}
