import { type Handle } from "remix/component";

import { ticketModalConfig } from "./tickets-modal-contract.ts";
import { getFocusableElementsWithin } from "../../../../ui/public/focus-trap.ts";
import { lockScroll } from "../../../../ui/public/scroll-lock.ts";

type Jam2026TicketsModalHandle = Handle<{
  open?: boolean;
}>;

type Jam2026TicketsModalEffectsOptions = {
  isActive: () => boolean;
  requestClose: () => void;
};

/**
 * Document-level modal behavior for the tickets dialog: scroll lock, inert
 * page background, initial focus, focus trapping, Escape to close, and focus
 * restoration when the dialog closes or unmounts.
 */
export function createJam2026TicketsModalEffects(
  handle: Jam2026TicketsModalHandle,
  options: Jam2026TicketsModalEffectsOptions,
) {
  let { isActive } = options;
  let modalEffectsOpen = false;
  let previousFocus: HTMLElement | null = null;
  let unlockScroll = () => {};
  let syncQueued = false;

  function applyPageState(modal: HTMLElement) {
    if (!previousFocus) {
      let active = document.activeElement;
      previousFocus = active instanceof HTMLElement ? active : null;
    }

    let scrollX = window.scrollX;
    let scrollY = window.scrollY;
    unlockScroll();
    unlockScroll = lockScroll();
    setBackgroundInert(true);
    preserveScrollPosition(scrollX, scrollY, handle.signal);

    window.requestAnimationFrame(() => {
      if (handle.signal.aborted) return;

      focusFirstModalControl(modal);
      preserveScrollPosition(scrollX, scrollY, handle.signal);
    });
  }

  function restorePageState() {
    unlockScroll();
    unlockScroll = () => {};
    setBackgroundInert(false);

    let toFocus = previousFocus;
    previousFocus = null;
    if (!toFocus || !document.contains(toFocus)) return;

    window.requestAnimationFrame(() => {
      if (document.contains(toFocus)) toFocus.focus({ preventScroll: true });
    });
  }

  function syncModalState() {
    let modal = getModalRoot();
    let nextOpen = isActive() && Boolean(modal);
    if (modalEffectsOpen === nextOpen) return;

    modalEffectsOpen = nextOpen;
    if (nextOpen && modal) applyPageState(modal);
    else restorePageState();
  }

  function keepFocusInModal(event: FocusEvent) {
    if (!isActive()) return;

    let modal = getModalRoot();
    let target = event.target;
    if (!modal || !(target instanceof HTMLElement)) return;
    if (modal.contains(target)) return;

    focusFirstModalControl(modal);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isActive() || event.defaultPrevented) return;

    if (event.key === "Tab") {
      let modal = getModalRoot();
      if (modal) trapTabFocus(event, modal);
      return;
    }

    if (event.key !== "Escape") return;
    event.preventDefault();
    options.requestClose();
  }

  function queueStateSync() {
    if (syncQueued) return;
    syncQueued = true;
    handle.queueTask(() => {
      syncQueued = false;
      syncModalState();
    });
  }

  handle.queueTask(() => {
    syncModalState();

    document.addEventListener("keydown", handleKeydown, {
      signal: handle.signal,
    });
    document.addEventListener("focusin", keepFocusInModal, {
      signal: handle.signal,
    });
    handle.signal.addEventListener("abort", restorePageState, { once: true });
  });

  return {
    queueStateSync,
  };
}

function getModalRoot() {
  return document.querySelector<HTMLElement>(
    "[role='dialog'][aria-labelledby='tickets-modal-title']",
  );
}

function setBackgroundInert(nextInert: boolean) {
  // The modal frame is hydrated separately from the page background, so this
  // document-level effect keeps the unhydrated page content inaccessible.
  let background = document.getElementById(ticketModalConfig.pageBackgroundId);
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
  let target = focusableElements[0] ?? root;
  target.focus({ preventScroll: true });
}

function preserveScrollPosition(
  scrollX: number,
  scrollY: number,
  signal: AbortSignal,
) {
  window.scrollTo(scrollX, scrollY);
  window.requestAnimationFrame(() => {
    if (!signal.aborted) window.scrollTo(scrollX, scrollY);
  });
}

/** Wraps Tab / Shift+Tab focus around the first and last modal controls. */
function trapTabFocus(event: KeyboardEvent, modal: HTMLElement) {
  let focusableElements = getFocusableElementsWithin(modal);
  if (focusableElements.length === 0) {
    event.preventDefault();
    modal.focus({ preventScroll: true });
    return;
  }

  let first = focusableElements[0];
  let last = focusableElements[focusableElements.length - 1];
  let active = document.activeElement;
  let wrapFrom = event.shiftKey ? first : last;
  let wrapTo = event.shiftKey ? last : first;
  if (active !== wrapFrom) return;

  event.preventDefault();
  wrapTo.focus({ preventScroll: true });
}
