const QUERY = "(prefers-reduced-motion: reduce)";

export const reducedMotion = { current: false };

export function initReducedMotion(signal: AbortSignal, onChange: () => void) {
  const media = window.matchMedia(QUERY);
  // Track the last value per subscriber: comparing against the shared
  // `reducedMotion.current` would let only the first subscriber see a change.
  let matches = media.matches;

  function sync() {
    reducedMotion.current = media.matches;
    if (matches === media.matches) return;
    matches = media.matches;
    onChange();
  }

  reducedMotion.current = matches;

  media.addEventListener("change", sync, { signal });
}

export function motionScrollBehavior(): ScrollBehavior {
  return reducedMotion.current ? "auto" : "smooth";
}
