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

  function onKeyDown(event: KeyboardEvent) {
    if (isIgnoredKeyEvent(event)) {
      reset();
      return;
    }

    let key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    // Capture before navigation and focused controls, including the final
    // Enter and a cancelling key. Held arrows must not initiate the code.
    if (shouldCaptureKonamiKey(index, key, event.repeat)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (event.repeat) return;

    index = nextKonamiIndex(index, key);
    if (index === KONAMI_KEYS.length) {
      reset();
      onComplete();
      return;
    }
    if (index === 0) {
      reset();
      return;
    }

    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(reset, KONAMI_IDLE_MS);
  }

  window.addEventListener("keydown", onKeyDown, { capture: true, signal });
  signal.addEventListener("abort", reset, { once: true });
}

/** Progress after `key`: a wrong key restarts, counting it if it begins the code. */
export function nextKonamiIndex(index: number, key: string): number {
  if (key === KONAMI_KEYS[index]) return index + 1;
  return key === KONAMI_KEYS[0] ? 1 : 0;
}

/** Whether to keep `key` from the page: only once the code is clearly underway. */
export function shouldCaptureKonamiKey(
  index: number,
  key: string,
  repeat: boolean,
): boolean {
  return index >= 2 || (index === 1 && key === "ArrowUp" && !repeat);
}

/** Handled or modified keys, typing, and keys inside selects/menus cancel the sequence. */
function isIgnoredKeyEvent(event: KeyboardEvent): boolean {
  return (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    isEditableKeyTarget(event) ||
    (event.target instanceof Element &&
      event.target.closest(
        "select, [aria-haspopup], [role='listbox'], [role='menu']",
      ) !== null)
  );
}
