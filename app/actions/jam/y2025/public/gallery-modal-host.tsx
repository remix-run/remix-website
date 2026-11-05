import {
  clientEntry,
  css,
  createMixin,
  navigate,
  type Handle,
  type RemixNode,
} from "remix/component";
import {
  restoreGalleryFocus,
  storeGalleryFocus,
} from "./gallery-focus-restore.tsx";
import {
  getFocusableElementsWithin,
  isFocusable,
} from "../../../../ui/public/focus-trap.ts";
import { lockScroll } from "../../../../ui/public/scroll-lock.ts";
import {
  getGalleryKeyAction,
  getGalleryPhotoIndex,
  getTabTrapTarget,
  isPlainPrimaryClick,
  wrapPhotoIndex,
  type GalleryKeyAction,
} from "./gallery-modal-navigation.ts";
import { blackAlpha } from "./theme.ts";

/** Which chevron to focus after keyboard prev/next (URL updates before the new modal paints). */
let PENDING_KEYBOARD_CHEVRON_KEY = "jam-gallery-pending-chevron-focus";

/** Keyboard / programmatic navigation targets for the gallery modal (anchors use the same values). */
export type JamGalleryModalNav = {
  closeHref: string;
  previousHref: string;
  nextHref: string;
};

type JamGalleryModalHostProps = {
  photoCount: number;
  children: RemixNode;
  nav: JamGalleryModalNav;
};

/** Gallery modal shell with focus trap, keyboard nav, and backdrop close. */
export function JamGalleryModalHost(handle: Handle<JamGalleryModalHostProps>) {
  return () => (
    <div
      role="dialog"
      aria-modal="true"
      tabindex={-1}
      mix={css({
        position: "fixed",
        inset: 0,
        zIndex: 50,
        width: "100%",
        height: "100%",
        userSelect: "none",
        backgroundColor: blackAlpha(0.7),
        backdropFilter: "blur(8px)",
      })}
    >
      <JamGalleryModalBehavior
        photoCount={handle.props.photoCount}
        nav={handle.props.nav}
      />
      {handle.props.children}
    </div>
  );
}

// Keep styled modal children outside client-entry props: CSS mix descriptors are
// runtime values and cannot survive client-entry serialization.
export let JamGalleryModalBehavior = clientEntry(
  import.meta.url,
  function JamGalleryModalBehavior(
    handle: Handle<Pick<JamGalleryModalHostProps, "photoCount" | "nav">>,
  ) {
    let modalNavigation = createJamGalleryModalNavigation();
    return () => (
      <span
        hidden
        aria-hidden="true"
        mix={modalNavigation(handle.props.nav, handle.props.photoCount)}
      />
    );
  },
);

function createJamGalleryModalNavigation() {
  return createMixin<
    HTMLElement,
    [nav: JamGalleryModalNav, photoCount: number]
  >((handle) => {
    let nav: JamGalleryModalNav = {
      closeHref: "",
      previousHref: "",
      nextHref: "",
    };
    let photoCount = 0;
    let modal: HTMLElement | null = null;
    let didInitialFocus = false;

    let getFocusableElements = () =>
      modal ? getFocusableElementsWithin(modal) : [];

    let focusFirstElement = () => {
      if (!modal) return;
      let [first] = getFocusableElements();
      (first ?? modal).focus();
    };

    let currentPhotoIndex = () =>
      getGalleryPhotoIndex(window.location.href, nav.closeHref, photoCount);

    let navigateGalleryByDelta = (delta: number) => {
      if (photoCount <= 0) return;
      let next = wrapPhotoIndex(currentPhotoIndex(), delta, photoCount);
      stashKeyboardGalleryChevron(delta > 0 ? "next" : "previous");
      void navigate(`${nav.closeHref}?photo=${next}`, {
        resetScroll: "manual",
      });
    };

    let closeGallery = async () => {
      clearKeyboardGalleryChevron();
      storeGalleryFocus(`${nav.closeHref}?photo=${currentPhotoIndex()}`);
      await navigate(nav.closeHref, { resetScroll: "manual" });
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
      restoreGalleryFocus();
    };

    let tryInitialFocus = (): boolean => {
      if (!modal) return false;
      if (!didInitialFocus) didInitialFocus = focusInitialElement(modal, nav);
      return didInitialFocus;
    };

    let keyActions: Record<
      GalleryKeyAction,
      (event: KeyboardEvent, host: HTMLElement) => void
    > = {
      "trap-focus": (event, host) => {
        let active = document.activeElement;
        let target = getTabTrapTarget({
          host,
          focusableElements: getFocusableElements(),
          activeElement: active,
          hostContainsActive: host.contains(active),
          shiftKey: event.shiftKey,
        });
        if (!target) return;
        event.preventDefault();
        target.focus();
      },
      close: (event) => {
        event.preventDefault();
        void closeGallery();
      },
      previous: (event) => {
        event.preventDefault();
        navigateGalleryByDelta(-1);
      },
      next: (event) => {
        event.preventDefault();
        navigateGalleryByDelta(1);
      },
      "block-scroll": (event) => {
        event.preventDefault();
      },
    };

    let onKeydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !modal) return;
      let action = getGalleryKeyAction(event);
      if (action) keyActions[action](event, modal);
    };

    let onClick = (event: MouseEvent) => {
      let target = event.target;
      if (!(target instanceof Element) || !modal) return;

      let closeTarget = target.closest<HTMLAnchorElement>("a[href]");
      if (!closeTarget || !modal.contains(closeTarget)) return;
      if (closeTarget.getAttribute("href") !== nav.closeHref) return;
      if (!isPlainPrimaryClick(event)) return;

      event.preventDefault();
      void closeGallery();
    };

    let onFocusin = (event: FocusEvent) => {
      let target = event.target;
      if (!modal || (target instanceof Node && modal.contains(target))) return;
      focusFirstElement();
    };

    handle.addEventListener("insert", (event) => {
      modal = event.node.parentElement;
      if (!modal) return;

      didInitialFocus = false;
      let unlockScroll = lockScroll();
      handle.signal.addEventListener("abort", unlockScroll, { once: true });

      let { signal } = handle;
      document.addEventListener("keydown", onKeydown, { signal });
      document.addEventListener("focusin", onFocusin, { signal });
      document.addEventListener("click", onClick, { signal });

      focusWhenReady(() => modal, signal, tryInitialFocus);
    });

    handle.addEventListener("remove", () => {
      modal = null;
      didInitialFocus = false;
    });

    handle.addEventListener("commit", () => {
      if (modal) focusPendingKeyboardChevron(modal, nav);
    });

    return (nextNav, nextPhotoCount) => {
      nav = nextNav;
      photoCount = nextPhotoCount;
    };
  });
}

/**
 * `insert` can run before descendants are committed or before layout (see `isFocusable` +
 * getClientRects). Try once right away, then wait one paint before falling back to subtree
 * observation for late descendants.
 */
function focusWhenReady(
  getModal: () => HTMLElement | null,
  signal: AbortSignal,
  tryFocus: () => boolean,
) {
  let raf = 0;
  let subtreeObserver: MutationObserver | null = null;
  signal.addEventListener(
    "abort",
    () => {
      window.cancelAnimationFrame(raf);
      subtreeObserver?.disconnect();
    },
    { once: true },
  );

  if (tryFocus()) return;

  raf = window.requestAnimationFrame(() => {
    let modal = getModal();
    if (signal.aborted || !modal) return;
    if (tryFocus()) return;

    subtreeObserver = new MutationObserver(() => {
      if (signal.aborted || tryFocus()) subtreeObserver?.disconnect();
    });
    subtreeObserver.observe(modal, { childList: true, subtree: true });
  });
}

/**
 * Moves focus into a freshly opened modal: the chevron used for keyboard prev/next,
 * else whatever inside already has focus, else the first focusable element.
 * Returns false while the modal has no focusable content yet.
 */
function focusInitialElement(modal: HTMLElement, nav: JamGalleryModalNav) {
  let focusableElements = getFocusableElementsWithin(modal);
  if (focusableElements.length === 0) return false;
  if (focusPendingKeyboardChevron(modal, nav)) return true;

  let active = document.activeElement;
  if (active instanceof HTMLElement && modal.contains(active)) return true;

  focusableElements[0].focus();
  return true;
}

function focusPendingKeyboardChevron(
  modal: HTMLElement,
  nav: JamGalleryModalNav,
): boolean {
  let pendingChevron = peekKeyboardGalleryChevron();
  if (!pendingChevron) return false;

  let chevron = findLinkByHref(
    modal,
    pendingChevron === "previous" ? nav.previousHref : nav.nextHref,
  );
  if (!chevron || !isFocusable(chevron)) return false;

  chevron.focus();
  clearKeyboardGalleryChevron();
  return true;
}

function stashKeyboardGalleryChevron(direction: "previous" | "next") {
  window.sessionStorage.setItem(PENDING_KEYBOARD_CHEVRON_KEY, direction);
}

function peekKeyboardGalleryChevron(): "previous" | "next" | null {
  let raw = window.sessionStorage.getItem(PENDING_KEYBOARD_CHEVRON_KEY);
  if (raw === "previous" || raw === "next") return raw;
  if (raw != null)
    window.sessionStorage.removeItem(PENDING_KEYBOARD_CHEVRON_KEY);
  return null;
}

function clearKeyboardGalleryChevron() {
  window.sessionStorage.removeItem(PENDING_KEYBOARD_CHEVRON_KEY);
}

function findLinkByHref(root: ParentNode, href: string) {
  return Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]")).find(
    (element) => element.getAttribute("href") === href,
  );
}
