import {
  addEventListeners,
  clientEntry,
  createMixin,
  navigate,
  type Handle,
} from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import {
  restoreGalleryFocus,
  storeGalleryFocus,
} from "./jam-gallery-focus-restore";
import assets from "./jam-gallery-modal-host.tsx?assets=client";

let FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Which chevron to focus after keyboard prev/next (URL updates before the new modal paints). */
let PENDING_KEYBOARD_CHEVRON_KEY = "jam-gallery-pending-chevron-focus";

/** Keyboard / programmatic navigation targets for the gallery modal (anchors use the same values). */
export type JamGalleryModalNav = {
  closeHref: string;
  previousHref: string;
  nextHref: string;
};

/** Gallery modal shell with focus trap, keyboard nav, and backdrop close. */
export let JamGalleryModalHost = clientEntry(
  `${assets.entry}#JamGalleryModalHost`,
  (_handle: Handle, setup: { photoCount: number }) => {
    let galleryPhotoCount = setup.photoCount;
    let modalNavigation = createJamGalleryModalNavigation();
    return (props: {
      class?: string;
      children: RemixNode;
      nav: JamGalleryModalNav;
    }) => (
      <div
        role="dialog"
        aria-modal="true"
        tabindex={-1}
        class={props.class}
        mix={[modalNavigation(props.nav, galleryPhotoCount)]}
      >
        {props.children}
      </div>
    );
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
    let previousBodyOverflow = "";
    let didInitialFocus = false;

    let getFocusableElements = () => {
      if (!modal) return [];
      return Array.from(
        modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(isFocusable);
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

    let tryInitialFocus = () => {
      if (!modal || didInitialFocus) return;
      let focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      let active = document.activeElement;
      if (active instanceof HTMLElement && modal.contains(active)) {
        didInitialFocus = true;
        return;
      }

      let pendingChevron = peekKeyboardGalleryChevron();
      if (pendingChevron) {
        let chevron = findLinkByHref(
          modal,
          pendingChevron === "previous" ? previousHref : nextHref,
        );
        if (!chevron || !isFocusable(chevron)) {
          return;
        }
        chevron.focus();
        clearKeyboardGalleryChevron();
        didInitialFocus = true;
        return;
      }

      focusBoundary("start");
      didInitialFocus = true;
    };

    handle.addEventListener("insert", (event) => {
      modal = event.node;
      didInitialFocus = false;
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      let onKeydown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        let host = modal;
        if (!host) return;

        let key = event.key;
        let isModified = event.metaKey || event.ctrlKey || event.altKey;

        switch (key) {
          case "Tab": {
            let focusableElements = getFocusableElements();
            if (focusableElements.length === 0) {
              event.preventDefault();
              host.focus();
              break;
            }

            let firstFocusable = focusableElements[0];
            let lastFocusable = focusableElements[focusableElements.length - 1];
            let activeElement = document.activeElement;
            let isActiveInsideModal =
              activeElement instanceof HTMLElement &&
              host.contains(activeElement);

            if (!isActiveInsideModal) {
              event.preventDefault();
              focusBoundary(event.shiftKey ? "end" : "start");
              break;
            }

            if (!event.shiftKey && activeElement === lastFocusable) {
              event.preventDefault();
              firstFocusable.focus();
              break;
            }

            if (event.shiftKey && activeElement === firstFocusable) {
              event.preventDefault();
              lastFocusable.focus();
            }
            break;
          }
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

      let onFocusin = (event: FocusEvent) => {
        let target = event.target;
        if (!(target instanceof HTMLElement)) return;
        let host = modal;
        if (!host || host.contains(target)) return;

        focusBoundary("start");
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
        focusin: onFocusin,
        click: onClick,
      });

      let focusWatchRaf = 0;
      let subtreeObserver: MutationObserver | null = null;

      let stopWatchingForFocusables = () => {
        subtreeObserver?.disconnect();
        subtreeObserver = null;
        window.cancelAnimationFrame(focusWatchRaf);
      };

      let attemptInitialFocus = () => {
        if (!modal || didInitialFocus) {
          stopWatchingForFocusables();
          return;
        }
        tryInitialFocus();
        if (didInitialFocus) stopWatchingForFocusables();
      };

      handle.signal.addEventListener(
        "abort",
        () => {
          document.body.style.overflow = previousBodyOverflow;
          stopWatchingForFocusables();
        },
        { once: true },
      );

      // `insert` can run before descendants are committed or before layout (see `isFocusable` +
      // getClientRects). Prefer post-commit work + one paint, then watch subtree mutations instead
      // of polling many animation frames.
      handle.queueTask(() => {
        if (handle.signal.aborted) return;
        attemptInitialFocus();
        focusWatchRaf = window.requestAnimationFrame(() => {
          if (handle.signal.aborted) return;
          attemptInitialFocus();
          if (didInitialFocus || !modal) return;

          subtreeObserver = new MutationObserver(() => {
            if (handle.signal.aborted) return;
            attemptInitialFocus();
          });
          subtreeObserver.observe(modal, { childList: true, subtree: true });
        });
      });
    });

    handle.addEventListener("remove", () => {
      modal = null;
      didInitialFocus = false;
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

function isFocusable(element: HTMLElement) {
  if (element.matches("[disabled], [aria-hidden='true']")) return false;
  if (element.tabIndex < 0) return false;

  let style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return element.getClientRects().length > 0;
}

function findLinkByHref(root: ParentNode, href: string) {
  return Array.from(root.querySelectorAll<HTMLAnchorElement>("a[href]")).find(
    (element) => element.getAttribute("href") === href,
  );
}
