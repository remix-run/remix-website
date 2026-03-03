import { clientEntry, type Handle } from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import assets from "./jam-gallery-modal-controls.tsx?assets=client";

export let JamGalleryModalControls = clientEntry(
  `${assets.entry}#JamGalleryModalControls`,
  (handle: Handle) => {
    let closeHref = "";
    let previousHref = "";
    let nextHref = "";

    handle.queueTask(() => {
      let FOCUSABLE =
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

      let getFocusable = () => {
        let modal = document.querySelector<HTMLElement>("[data-gallery-modal]");
        if (!modal) return [];
        return Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE));
      };

      let lockScroll = () => {
        let y = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${y}px`;
        document.body.style.width = "100%";
      };

      let unlockScroll = () => {
        let top = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        if (top) {
          window.scrollTo(0, -parseInt(top, 10) || 0);
        }
      };

      let navigate = (href: string) => {
        if (!href) return;
        unlockScroll();
        window.location.assign(href);
      };

      lockScroll();
      getFocusable()[0]?.focus();

      handle.on(window, {
        keydown(event) {
          if (event.key === "Escape") {
            event.preventDefault();
            navigate(closeHref);
            return;
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(previousHref);
            return;
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            navigate(nextHref);
            return;
          }
          if (event.key === "Tab") {
            let focusable = getFocusable();
            if (focusable.length === 0) return;
            let first = focusable[0];
            let last = focusable[focusable.length - 1];
            let modal = document.querySelector("[data-gallery-modal]");
            let outsideModal =
              !modal || !modal.contains(document.activeElement);
            if (event.shiftKey) {
              if (outsideModal || document.activeElement === first) {
                event.preventDefault();
                last.focus();
              }
            } else {
              if (outsideModal || document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }
          }
        },
      });
    });

    return (props: {
      closeHref: string;
      previousHref: string;
      nextHref: string;
      class?: string;
      children: RemixNode;
    }) => {
      closeHref = props.closeHref;
      previousHref = props.previousHref;
      nextHref = props.nextHref;

      return (
        <div data-gallery-modal class={props.class}>
          {props.children}
        </div>
      );
    };
  },
);
