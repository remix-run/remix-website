import { isEditableKeyTarget } from "../../../ui/public/keyboard.ts";

/** ↑↑↓↓←→←→BA Enter. Reserve keys after ↑↑, not ordinary single-arrow navigation. */
const KONAMI_KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "Enter",
] as const;
const KONAMI_IDLE_MS = 4000;

export function listenForKonamiCode(
  onComplete: () => void,
  signal: AbortSignal,
) {
  let index = 0;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  function reset() {
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = null;
    index = 0;
  }

  window.addEventListener(
    "keydown",
    (event) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableKeyTarget(event) ||
        (event.target instanceof Element &&
          event.target.closest(
            "select, [aria-haspopup], [role='listbox'], [role='menu']",
          ))
      ) {
        reset();
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      // Capture before navigation and focused controls, including the final
      // Enter and a cancelling key. Held arrows must not initiate the code.
      if (index >= 2 || (index === 1 && key === "ArrowUp" && !event.repeat)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      if (event.repeat) return;

      if (key === KONAMI_KEYS[index]) {
        index += 1;
        if (index === KONAMI_KEYS.length) {
          reset();
          onComplete();
          return;
        }
      } else {
        reset();
        if (key === KONAMI_KEYS[0]) index = 1;
      }

      if (index > 0) {
        if (idleTimer !== null) clearTimeout(idleTimer);
        idleTimer = setTimeout(reset, KONAMI_IDLE_MS);
      }
    },
    { capture: true, signal },
  );
  signal.addEventListener("abort", reset, { once: true });
}
