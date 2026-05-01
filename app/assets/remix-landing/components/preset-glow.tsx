import { css, ref, type Handle } from "remix/ui";
import { presets } from "../engine/presets.ts";
import { clamp, lerp } from "../utils/math.ts";

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

  const maxIdx = presets.length - 1;
  const clamped = clamp(morphValue, 0, maxIdx);
  const fromIndex = Math.floor(clamped);
  const toIndex = Math.min(fromIndex + 1, maxIdx);
  const blend = clamped - fromIndex;
  const fallback: [number, number, number] = [0.3, 0.3, 0.3];
  const a = presets[fromIndex]?.glowColor ?? fallback;
  const b = presets[toIndex]?.glowColor ?? fallback;
  const r = Math.round(lerp(a[0], b[0], blend) * 255);
  const g = Math.round(lerp(a[1], b[1], blend) * 255);
  const bl = Math.round(lerp(a[2], b[2], blend) * 255);

  return `radial-gradient(ellipse at 50% 50%, rgba(${r},${g},${bl},0.40) 0%, rgba(${r},${g},${bl},0.12) 40%, transparent 70%)`;
}

// Previously implemented inline in App as a full-viewport <div> whose
// `background` (a radial-gradient string) was recomputed and re-assigned via
// an inline `style` prop on every scroll frame. That forced the browser to
// re-rasterize the entire viewport-sized layer 60x/s during scroll —
// competing with the particle canvas for main-thread budget.
//
// Instead we own an internal rAF, read morphValue from a mutable ref set by
// the parent (so App.handle.update() doesn't have to walk through us),
// quantize the value to avoid writing unchanged backgrounds, and write
// directly to the DOM.
export function PresetGlow(handle: Handle) {
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
    const quantized = Math.round(morphValueRef.current * 100) / 100;
    const background = buildGradient(quantized, brandGradientMode);
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

  return (props: {
    morphValueRef: { current: number };
    brandGradientMode: boolean;
  }) => {
    morphValueRef = props.morphValueRef;
    // Force an immediate re-evaluation next frame when brand mode flips so
    // we don't wait on a morphValue change to pick it up.
    if (brandGradientMode !== props.brandGradientMode) {
      brandGradientMode = props.brandGradientMode;
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
