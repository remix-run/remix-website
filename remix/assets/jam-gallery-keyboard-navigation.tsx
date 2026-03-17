import {
  addEventListeners,
  clientEntry,
  navigate,
  type Handle,
} from "remix/component";
import assets from "./jam-gallery-keyboard-navigation.tsx?assets=client";
import {
  restoreGalleryFocus,
  storeGalleryFocus,
} from "./jam-gallery-focus-restore";

let FOCUSABLE_SELECTOR =
  'a[href]:not([data-gallery-backdrop]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isFocusable(element: HTMLElement) {
  if (element.matches("[disabled], [aria-hidden='true']")) return false;
  if (element.tabIndex < 0) return false;

  let style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return element.getClientRects().length > 0;
}

type GalleryFrameState = {
  aspectRatio: string;
  width: string;
  maxWidth: string;
  height: string;
  maxHeight: string;
  imageSrc: string;
};

export let JamGalleryKeyboardNavigation = clientEntry(
  `${assets.entry}#JamGalleryKeyboardNavigation`,
  (handle: Handle) => {
    let closeHref = "";
    let previousHref = "";
    let nextHref = "";
    let focusPhotoIndex = 0;
    let syncPendingQueued = false;
    let previousFrame: GalleryFrameState | null = null;
    let nextFrame: GalleryFrameState | null = null;

    let navigateGallery = (href: string, frame?: GalleryFrameState | null) => {
      setGalleryImagePending(true, frame);
      void navigate(href, { resetScroll: false });
    };

    let closeGallery = async () => {
      storeGalleryFocus(focusPhotoIndex);
      await navigate(closeHref, { resetScroll: false });
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
      restoreGalleryFocus();
    };

    let queueSyncPendingState = () => {
      if (syncPendingQueued) return;
      syncPendingQueued = true;
      handle.queueTask((signal) => {
        syncPendingQueued = false;
        if (signal.aborted) return;
        syncGalleryImagePendingState(signal);
      });
    };

    handle.queueTask(() => {
      let modal = document.querySelector<HTMLElement>("[data-gallery-modal]");
      if (!modal) return;

      modal.setAttribute("data-gallery-modal-ready", "true");
      queueSyncPendingState();

      let previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      let getFocusableElements = () =>
        Array.from(
          modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter(isFocusable);

      let focusBoundary = (direction: "start" | "end") => {
        let focusableElements = getFocusableElements();
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

      focusBoundary("start");

      let onKeydown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;

        if (event.key === "Tab") {
          let focusableElements = getFocusableElements();
          if (focusableElements.length === 0) {
            event.preventDefault();
            modal.focus();
            return;
          }

          let firstFocusable = focusableElements[0];
          let lastFocusable = focusableElements[focusableElements.length - 1];
          let activeElement = document.activeElement;
          let isActiveInsideModal =
            activeElement instanceof HTMLElement &&
            modal.contains(activeElement);

          if (!isActiveInsideModal) {
            event.preventDefault();
            focusBoundary(event.shiftKey ? "end" : "start");
            return;
          }

          if (!event.shiftKey && activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
            return;
          }

          if (event.shiftKey && activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
            return;
          }
        }

        if (event.key === "Escape") {
          event.preventDefault();
          void closeGallery();
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          navigateGallery(previousHref, previousFrame);
          return;
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          navigateGallery(nextHref, nextFrame);
          return;
        }

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
        }
      };

      let onFocusin = (event: FocusEvent) => {
        let target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (modal.contains(target)) return;

        focusBoundary("start");
      };

      let onClick = (event: MouseEvent) => {
        let target = event.target;
        if (!(target instanceof Element)) return;

        let closeTarget = target.closest(
          "[data-gallery-backdrop], [data-gallery-close-link]",
        );
        if (!closeTarget || !modal.contains(closeTarget)) return;
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

      let onPointerdown = (event: PointerEvent) => {
        let target = event.target;
        if (!(target instanceof Element)) return;

        let pendingTarget = target.closest(
          "[data-gallery-photo-link], [aria-label='Previous photo'], [aria-label='Next photo']",
        );
        if (!pendingTarget || !modal.contains(pendingTarget)) return;

        setGalleryImagePending(true, getGalleryFrameFromElement(pendingTarget));
      };

      addEventListeners(document, handle.signal, {
        keydown: onKeydown,
        focusin: onFocusin,
        click: onClick,
        pointerdown: onPointerdown,
      });
      handle.signal.addEventListener(
        "abort",
        () => {
          document.body.style.overflow = previousBodyOverflow;
        },
        { once: true },
      );
    });

    return (props: {
      closeHref: string;
      previousHref: string;
      nextHref: string;
      focusPhotoIndex: number;
      previousPhotoState: GalleryFrameState;
      nextPhotoState: GalleryFrameState;
    }) => {
      closeHref = props.closeHref;
      previousHref = props.previousHref;
      nextHref = props.nextHref;
      focusPhotoIndex = props.focusPhotoIndex;
      previousFrame = props.previousPhotoState;
      nextFrame = props.nextPhotoState;
      queueSyncPendingState();

      return null;
    };
  },
);

function setGalleryImagePending(
  isPending: boolean,
  frame?: GalleryFrameState | null,
) {
  let modal = document.querySelector<HTMLElement>("[data-gallery-modal]");
  if (!modal) return;

  if (isPending) {
    modal.setAttribute("data-gallery-image-state", "pending");
    modal.style.setProperty("--gallery-photo-visibility", "hidden");
    applyGalleryFrameState(modal, frame);
    if (frame?.imageSrc) {
      modal.setAttribute("data-gallery-pending-src", frame.imageSrc);
    } else {
      modal.removeAttribute("data-gallery-pending-src");
    }
    return;
  }

  modal.removeAttribute("data-gallery-image-state");
  modal.removeAttribute("data-gallery-pending-src");
  modal.style.removeProperty("--gallery-photo-visibility");
  clearGalleryFrameState(modal);
}

function syncGalleryImagePendingState(signal: AbortSignal) {
  let modal = document.querySelector<HTMLElement>("[data-gallery-modal]");
  let image = document.querySelector<HTMLImageElement>(
    "[data-gallery-modal-photo]",
  );
  if (!modal || !image) return;

  if (!modal.hasAttribute("data-gallery-image-state")) {
    modal.removeAttribute("data-gallery-pending-src");
    modal.style.removeProperty("--gallery-photo-visibility");
    clearGalleryFrameState(modal);
    return;
  }

  let pendingSrc = modal.getAttribute("data-gallery-pending-src");
  if (pendingSrc) {
    let resolvedPendingSrc = new URL(pendingSrc, window.location.href).href;
    let currentImageSrc = image.currentSrc || image.src;
    if (currentImageSrc !== resolvedPendingSrc) {
      window.requestAnimationFrame(() => {
        if (signal.aborted) return;
        syncGalleryImagePendingState(signal);
      });
      return;
    }
  }

  if (image.complete) {
    void image
      .decode()
      .catch(() => {})
      .then(() => {
        if (signal.aborted) return;
        setGalleryImagePending(false);
      });
    return;
  }

  let clearPending = () => {
    if (signal.aborted) return;
    setGalleryImagePending(false);
  };

  image.addEventListener("load", clearPending, { once: true, signal });
  image.addEventListener("error", clearPending, { once: true, signal });
}

function getGalleryFrameFromElement(element: Element) {
  let aspectRatio = element.getAttribute("data-gallery-aspect-ratio");
  let width = element.getAttribute("data-gallery-width");
  let maxWidth = element.getAttribute("data-gallery-max-width");
  let height = element.getAttribute("data-gallery-height");
  let maxHeight = element.getAttribute("data-gallery-max-height");
  let imageSrc = element.getAttribute("data-gallery-image-src");

  if (
    !aspectRatio ||
    !width ||
    !maxWidth ||
    !height ||
    !maxHeight ||
    !imageSrc
  ) {
    return null;
  }

  return { aspectRatio, width, maxWidth, height, maxHeight, imageSrc };
}

function applyGalleryFrameState(
  modal: HTMLElement,
  frame?: GalleryFrameState | null,
) {
  if (!frame) return;

  modal.style.setProperty("--gallery-modal-aspect-ratio", frame.aspectRatio);
  modal.style.setProperty("--gallery-modal-width", frame.width);
  modal.style.setProperty("--gallery-modal-max-width", frame.maxWidth);
  modal.style.setProperty("--gallery-modal-height", frame.height);
  modal.style.setProperty("--gallery-modal-max-height", frame.maxHeight);
}

function clearGalleryFrameState(modal: HTMLElement) {
  modal.style.removeProperty("--gallery-modal-aspect-ratio");
  modal.style.removeProperty("--gallery-modal-width");
  modal.style.removeProperty("--gallery-modal-max-width");
  modal.style.removeProperty("--gallery-modal-height");
  modal.style.removeProperty("--gallery-modal-max-height");
}
