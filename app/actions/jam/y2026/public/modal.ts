import { css, type Handle } from "remix/component";
import { spring } from "@remix-run/ui/animation";

import { jam2026ModalConfig } from "./modal-contract.ts";
import { jamTheme } from "./theme.ts";
import { getFocusableElementsWithin } from "../../../../ui/public/focus-trap.ts";
import { lockScroll } from "../../../../ui/public/scroll-lock.ts";
import { theme } from "../../../../ui/public/theme.ts";
import { routes } from "../../../../routes.ts";

type Jam2026ModalEffectsOptions = {
  getModalRoot: () => HTMLElement | null;
  isActive: () => boolean;
  requestClose: () => void;
  /** Where focus goes when the modal closes; defaults to the opener. */
  getReturnFocus?: () => HTMLElement | null;
};

/**
 * Page-level effects for a Jam 2026 modal: scroll lock, an inert page
 * background, initial focus, Escape to close, focus restoration, and a history
 * entry owned by the modal frame. The dialog itself traps focus with the
 * `focusTrap` mixin.
 */
export function createJam2026ModalEffects(
  handle: Pick<Handle, "frame" | "frames" | "queueTask" | "signal">,
  options: Jam2026ModalEffectsOptions,
) {
  let modalEffectsOpen = false;
  let previousFocus: HTMLElement | null = null;
  let unlockScroll = () => {};
  let syncQueued = false;

  function setBackgroundInert(nextInert: boolean) {
    // Modals are hydrated separately from the page background, so this
    // document-level effect keeps the unhydrated page content inaccessible.
    let background = document.getElementById(
      jam2026ModalConfig.pageBackgroundId,
    );
    if (!background) return;

    if (nextInert) {
      background.setAttribute("inert", "");
      background.setAttribute("aria-hidden", "true");
    } else {
      background.removeAttribute("inert");
      background.removeAttribute("aria-hidden");
    }
  }

  function focusFirstModalControl(root: HTMLElement) {
    let focusableElements = getFocusableElementsWithin(root);
    if (focusableElements.length > 0) {
      focusableElements[0].focus({ preventScroll: true });
      return;
    }

    root.focus({ preventScroll: true });
  }

  function restorePageState() {
    unlockScroll();
    unlockScroll = () => {};
    setBackgroundInert(false);

    let toFocus = options.getReturnFocus?.() ?? previousFocus;
    previousFocus = null;
    if (!toFocus) return;

    window.requestAnimationFrame(() => {
      if (document.contains(toFocus)) toFocus.focus({ preventScroll: true });
    });
  }

  function syncModalState() {
    let modal = options.getModalRoot();
    let nextOpen = options.isActive() && Boolean(modal);
    if (modalEffectsOpen === nextOpen) return;

    modalEffectsOpen = nextOpen;

    if (!nextOpen || !modal) {
      restorePageState();
      return;
    }

    if (!previousFocus) {
      let active = document.activeElement;
      previousFocus = active instanceof HTMLElement ? active : null;
    }

    let scrollX = window.scrollX;
    let scrollY = window.scrollY;
    unlockScroll();
    unlockScroll = lockScroll();
    setBackgroundInert(true);
    restoreScrollPosition(scrollX, scrollY, handle.signal);

    window.requestAnimationFrame(() => {
      if (handle.signal.aborted) return;

      focusFirstModalControl(modal);
      restoreScrollPosition(scrollX, scrollY, handle.signal);
    });
  }

  function queueStateSync() {
    if (syncQueued) return;
    syncQueued = true;
    handle.queueTask(() => {
      syncQueued = false;
      syncModalState();
      if (handle.frame !== handle.frames.top) syncModalNavigationEntry();
    });
  }

  handle.queueTask(() => {
    syncModalState();

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          !options.isActive() ||
          event.defaultPrevented ||
          event.key !== "Escape"
        ) {
          return;
        }

        event.preventDefault();
        options.requestClose();
      },
      { signal: handle.signal },
    );

    handle.signal.addEventListener(
      "abort",
      () => {
        restorePageState();
      },
      { once: true },
    );
  });

  return {
    queueStateSync,
  };
}

export function restoreScrollPosition(
  scrollX: number,
  scrollY: number,
  signal?: AbortSignal,
) {
  if (typeof window === "undefined" || signal?.aborted) return;

  window.scrollTo(scrollX, scrollY);
  window.requestAnimationFrame(() => {
    if (!signal?.aborted) window.scrollTo(scrollX, scrollY);
  });
}

/**
 * Direct document loads start with top-frame history state. Once the modal
 * frame hydrates, mark the Jam page's entry as owned by that frame, so browser
 * Back and Forward reload just the modal instead of remounting the animated
 * page.
 */
function syncModalNavigationEntry() {
  let navigation = window.navigation;
  if (!navigation?.currentEntry) return;

  let { pathname, search } = window.location;
  let homeHref = routes.jam.y2026.index.href();
  let isModalPage =
    pathname === homeHref ||
    pathname === routes.jam.y2026.ticket.index.href() ||
    pathname.startsWith(`${homeHref}/photos/`);
  if (!isModalPage) return;

  let state = {
    $rmx: true,
    resetScroll: "manual",
    resetFocus: "after-transition",
    src: new URL(pathname + search, window.location.href).href,
    target: jam2026ModalConfig.frameName,
  };
  let currentState = navigation.currentEntry.getState();

  if (
    isRecord(currentState) &&
    currentState.$rmx === state.$rmx &&
    currentState.resetScroll === state.resetScroll &&
    currentState.resetFocus === state.resetFocus &&
    currentState.src === state.src &&
    currentState.target === state.target
  ) {
    return;
  }

  navigation.updateCurrentEntry({ state });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export let jam2026ModalScrimStyle = css({
  alignItems: "center",
  background: "rgb(0 0 0 / 0.85)",
  display: "flex",
  inset: 0,
  justifyContent: "center",
  padding: "16px",
  position: "fixed",
  transition: "background 120ms ease-out",
  zIndex: 60,
  "&[data-state='closing']": {
    background: "rgb(0 0 0 / 0)",
    pointerEvents: "none",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

// A modal's window, rolling up as it closes. Each modal sizes its own.
export let jam2026ModalWindowStyle = css({
  background: "light-dark(rgb(255 255 255 / 0.82), rgb(10 29 39 / 0.82))",
  borderRadius: "8px",
  boxShadow:
    "0 1px 2px light-dark(rgb(8 40 69 / 0.06), rgb(0 0 0 / 0.2)), 0 6px 16px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.28)), 0 24px 60px light-dark(rgb(8 40 69 / 0.18), rgb(0 0 0 / 0.36)), 0 60px 120px light-dark(rgb(8 40 69 / 0.22), rgb(0 0 0 / 0.44))",
  clipPath: "inset(0 0 0 0 round 8px)",
  color: jamTheme.ink,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: `clip-path ${spring("snappy", { duration: 180 })}`,
  // The photo viewer can shrink into a card instead, its own animation.
  "&[data-state='closing']:not([data-exit='shrink'])": {
    clipPath: "inset(0 0 100% 0 round 8px)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

export let jam2026ModalBackdropStyle = css({
  background: "transparent",
  display: "block",
  inset: 0,
  position: "absolute",
});

export let jam2026ModalTitlebarStyle = css({
  alignItems: "center",
  display: "flex",
  flexShrink: 0,
  gap: "6px",
  padding: "8px",
  width: "100%",
});

// Close, download, and step controls in a modal's title bar.
export let jam2026ModalTitlebarButtonStyle = css({
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: "50%",
  color: jamTheme.ink,
  cursor: "pointer",
  display: "inline-flex",
  flexShrink: 0,
  height: "16px",
  justifyContent: "center",
  padding: 0,
  textDecoration: "none",
  width: "16px",
  "&:hover, &:focus-visible": {
    opacity: 0.7,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
});

export let jam2026ModalTitlebarIconStyle = css({
  display: "block",
  height: "14px",
  width: "14px",
});

export let jam2026ModalTitleStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "10px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.02em",
  lineHeight: 1.2,
  margin: 0,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});
