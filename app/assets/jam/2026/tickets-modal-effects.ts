import { addEventListeners, navigate, type Handle } from "remix/ui";
import { lockScroll } from "remix/ui/scroll-lock";

import { ticketModalConfig } from "../../../controllers/jam/2026/tickets-modal-contract.ts";
import { routes } from "../../../routes.ts";
import { getFocusableElementsWithin } from "../../../ui/focus-trap.ts";

type Jam2026TicketsModalHandle = Handle<{
  open?: boolean;
}>;

export function createJam2026TicketsModalEffects(
  handle: Jam2026TicketsModalHandle,
) {
  let modalEffectsOpen = false;
  let previousFocus: HTMLElement | null = null;
  let unlockScroll = () => {};
  let syncQueued = false;

  function isOpen() {
    return Boolean(handle.props.open);
  }

  function getModalRoot() {
    return document.querySelector<HTMLElement>(
      `[${ticketModalConfig.attributes.modal}]`,
    );
  }

  function setBackgroundInert(nextInert: boolean) {
    // The modal frame is hydrated separately from the page background, so this
    // document-level effect keeps the unhydrated page content inaccessible.
    let background = document.getElementById(
      ticketModalConfig.pageBackgroundId,
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

  function preserveScrollPosition(scrollX: number, scrollY: number) {
    window.scrollTo(scrollX, scrollY);
    window.requestAnimationFrame(() => {
      if (!handle.signal.aborted) window.scrollTo(scrollX, scrollY);
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
    let nextOpen = Boolean(modal);
    if (modalEffectsOpen === nextOpen) return;

    modalEffectsOpen = nextOpen;

    if (!modal) {
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
    preserveScrollPosition(scrollX, scrollY);

    window.requestAnimationFrame(() => {
      if (handle.signal.aborted) return;

      focusFirstModalControl(modal);
      preserveScrollPosition(scrollX, scrollY);
    });
  }

  function closeModal() {
    void navigate(routes.jam.y2026.index.href(), {
      target: ticketModalConfig.frameName,
      history: "replace",
      resetScroll: false,
    });
  }

  function keepFocusInModal(event: FocusEvent) {
    if (!isOpen()) return;

    let modal = getModalRoot();
    let target = event.target;
    if (!modal || !(target instanceof HTMLElement)) return;
    if (modal.contains(target)) return;

    focusFirstModalControl(modal);
  }

  function handleTab(event: KeyboardEvent) {
    if (!isOpen() || event.defaultPrevented || event.key !== "Tab") {
      return;
    }

    let modal = getModalRoot();
    if (!modal) return;

    let focusableElements = getFocusableElementsWithin(modal);
    if (focusableElements.length === 0) {
      event.preventDefault();
      modal.focus({ preventScroll: true });
      return;
    }

    let first = focusableElements[0];
    let last = focusableElements[focusableElements.length - 1];
    let active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
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

    addEventListeners(document, handle.signal, {
      keydown(event) {
        handleTab(event);
        if (!isOpen() || event.defaultPrevented || event.key !== "Escape") {
          return;
        }

        event.preventDefault();
        closeModal();
      },
      focusin: keepFocusInModal,
    });

    handle.signal.addEventListener(
      "abort",
      () => {
        restorePageState();
      },
      { once: true },
    );
  });

  return {
    isOpen,
    queueStateSync,
  };
}
