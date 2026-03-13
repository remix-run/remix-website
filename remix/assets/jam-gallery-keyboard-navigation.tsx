import { addEventListeners, clientEntry, type Handle } from "remix/component";
import assets from "./jam-gallery-keyboard-navigation.tsx?assets=client";

let FOCUS_RESTORE_KEY = "jam-gallery-focus-index";
let FOCUSABLE_SELECTOR =
  'a[href]:not([data-gallery-backdrop]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isFocusable(element: HTMLElement) {
  if (element.matches("[disabled], [aria-hidden='true']")) return false;
  if (element.tabIndex < 0) return false;

  let style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return element.getClientRects().length > 0;
}

export let JamGalleryKeyboardNavigation = clientEntry(
  `${assets.entry}#JamGalleryKeyboardNavigation`,
  (handle: Handle) => {
    let closeHref = "";
    let previousHref = "";
    let nextHref = "";
    let focusPhotoIndex = 0;

    handle.queueTask(() => {
      let modal = document.querySelector<HTMLElement>("[data-gallery-modal]");
      if (!modal) return;

      modal.setAttribute("data-gallery-modal-ready", "true");

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
          window.sessionStorage.setItem(
            FOCUS_RESTORE_KEY,
            String(focusPhotoIndex),
          );
          window.location.assign(closeHref);
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          window.location.assign(previousHref);
          return;
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          window.location.assign(nextHref);
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

      addEventListeners(document, handle.signal, {
        keydown: onKeydown,
        focusin: onFocusin,
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
    }) => {
      closeHref = props.closeHref;
      previousHref = props.previousHref;
      nextHref = props.nextHref;
      focusPhotoIndex = props.focusPhotoIndex;

      return null;
    };
  },
);
