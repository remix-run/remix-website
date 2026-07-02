import {
  addEventListeners,
  clientEntry,
  createMixin,
  navigate,
  type Handle,
  type RemixNode,
} from "remix/ui";
import {
  restoreGalleryFocus,
  storeGalleryFocus,
} from "./gallery-focus-restore.tsx";
import {
  focusTrap,
  getFocusableElementsWithin,
  isFocusable,
} from "../../../ui/focus-trap.ts";
import { lockScroll } from "../../../ui/scroll-lock.ts";

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
  class?: string;
  children: RemixNode;
  nav: JamGalleryModalNav;
};

/** Gallery modal shell with focus trap, keyboard nav, and backdrop close. */
export let JamGalleryModalHost = clientEntry(
  import.meta.url,
  function JamGalleryModalHost(handle: Handle<JamGalleryModalHostProps>) {
    let modalNavigation = createJamGalleryModalNavigation();
    return () => {
      return (
        <div
          role="dialog"
          aria-modal="true"
          tabindex={-1}
          class={handle.props.class}
          mix={[
            focusTrap(),
            modalNavigation(handle.props.nav, handle.props.photoCount),
          ]}
        >
          {handle.props.children}
        </div>
      );
    };
  },
);

function createJamGalleryModalNavigation() {
  return createMixin<
    HTMLElement,
    [nav: JamGalleryModalNav, photoCount: number]
  >((handle) => {
    let closeHref = "";
    let previousHref = "";
    let nextHref = "";
    let photoCount = 0;
    let galleryPathname = "";
    let modal: HTMLElement | null = null;
    let unlockScroll = () => {};
    let didInitialFocus = false;

    let getFocusableElements = () => {
      if (!modal) return [];
      return getFocusableElementsWithin(modal);
    };

    let focusBoundary = (direction: "start" | "end") => {
      let focusableElements = getFocusableElements();
      if (!modal) return;
      if (focusableElements.length === 0) {
        modal.focus();
        return;
      }

      if (direction === "start") {
        focusableElements[0].focus();
        return;
      }

      focusableElements[focusableElements.length - 1].focus();
    };

    let navigateGallery = (href: string) => {
      void navigate(href, { resetScroll: false });
    };

    let currentPhotoIndexFromLocation = () => {
      if (photoCount <= 0) return 0;
      try {
        let url = new URL(window.location.href);
        if (url.pathname !== galleryPathname) return 0;
        let parsed = Number.parseInt(url.searchParams.get("photo") ?? "", 10);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed >= photoCount) {
          return 0;
        }
        return parsed;
      } catch {
        return 0;
      }
    };

    let navigateGalleryByDelta = (delta: number) => {
      if (photoCount <= 0) return;
      let current = currentPhotoIndexFromLocation();
      let next = (current + delta + photoCount) % photoCount;
      stashKeyboardGalleryChevron(delta > 0 ? "next" : "previous");
      navigateGallery(`${closeHref}?photo=${next}`);
    };

    let closeGallery = async () => {
      clearKeyboardGalleryChevron();
      storeGalleryFocus(
        `${closeHref}?photo=${currentPhotoIndexFromLocation()}`,
      );
      await navigate(closeHref, { resetScroll: false });
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
      restoreGalleryFocus();
    };

    let focusPendingKeyboardChevron = (): boolean => {
      if (!modal) return false;

      let pendingChevron = peekKeyboardGalleryChevron();
      if (!pendingChevron) return false;

      let chevron = findLinkByHref(
        modal,
        pendingChevron === "previous" ? previousHref : nextHref,
      );
      if (!chevron || !isFocusable(chevron)) return false;

      chevron.focus();
      clearKeyboardGalleryChevron();
      return true;
    };

    let tryInitialFocus = (): boolean => {
      if (!modal) return false;
      if (didInitialFocus) return true;

      let focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return false;

      if (focusPendingKeyboardChevron()) {
        didInitialFocus = true;
        return true;
      }

      let active = document.activeElement;
      if (active instanceof HTMLElement && modal.contains(active)) {
        didInitialFocus = true;
        return true;
      }

      focusBoundary("start");
      didInitialFocus = true;
      return true;
    };

    handle.addEventListener("insert", (event) => {
      modal = event.node;
      didInitialFocus = false;
      unlockScroll = lockScroll();

      let onKeydown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        let host = modal;
        if (!host) return;

        let key = event.key;
        let isModified = event.metaKey || event.ctrlKey || event.altKey;

        switch (key) {
          case "Escape":
            event.preventDefault();
            void closeGallery();
            break;
          case "ArrowLeft":
            if (isModified) break;
            event.preventDefault();
            navigateGalleryByDelta(-1);
            break;
          case "ArrowRight":
            if (isModified) break;
            event.preventDefault();
            navigateGalleryByDelta(1);
            break;
          case "ArrowUp":
          case "ArrowDown":
            if (isModified) break;
            event.preventDefault();
            break;
          default:
            break;
        }
      };

      let onClick = (event: MouseEvent) => {
        let target = event.target;
        if (!(target instanceof Element)) return;
        let host = modal;
        if (!host) return;

        let closeTarget = target.closest<HTMLAnchorElement>("a[href]");
        if (!closeTarget || !host.contains(closeTarget)) return;
        if (closeTarget.getAttribute("href") !== closeHref) return;
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        event.preventDefault();
        void closeGallery();
      };

      addEventListeners(document, handle.signal, {
        keydown: onKeydown,
        click: onClick,
      });

      // `insert` can run before descendants are committed or before layout (see `isFocusable` +
      // getClientRects). Try once right away, then wait one paint before falling back to subtree
      // observation for late descendants.
      let focusWatchRaf = 0;
      let subtreeObserver: MutationObserver | null = null;

      handle.signal.addEventListener(
        "abort",
        () => {
          unlockScroll();
          unlockScroll = () => {};
          window.cancelAnimationFrame(focusWatchRaf);
          subtreeObserver?.disconnect();
        },
        { once: true },
      );

      if (tryInitialFocus()) return;

      focusWatchRaf = window.requestAnimationFrame(() => {
        if (handle.signal.aborted || !modal) return;
        if (tryInitialFocus()) return;

        subtreeObserver = new MutationObserver(() => {
          if (handle.signal.aborted || tryInitialFocus()) {
            subtreeObserver?.disconnect();
          }
        });
        subtreeObserver.observe(modal, { childList: true, subtree: true });
      });
    });

    handle.addEventListener("remove", () => {
      modal = null;
      didInitialFocus = false;
    });

    handle.addEventListener("commit", () => {
      focusPendingKeyboardChevron();
    });

    return (nextNav, nextPhotoCount) => {
      closeHref = nextNav.closeHref;
      previousHref = nextNav.previousHref;
      nextHref = nextNav.nextHref;
      photoCount = nextPhotoCount;
      galleryPathname = nextNav.closeHref.split("?")[0];
    };
  });
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
