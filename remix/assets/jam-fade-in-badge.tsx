import clsx from "clsx";
import { addEventListeners, clientEntry, type Handle } from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import assets from "./jam-fade-in-badge.tsx?assets=client";

export let JamFadeInBadge = clientEntry(
  `${assets.entry}#JamFadeInBadge`,
  (handle: Handle, setup?: number) => {
    let isVisible = false;
    let delay = setup ?? 0;

    handle.queueTask((signal) => {
      if (signal.aborted) return;
      let prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        isVisible = true;
        handle.update();
        return;
      }

      let timeout = window.setTimeout(() => {
        if (signal.aborted) return;
        isVisible = true;
        handle.update();
      }, delay);

      let clearTimeoutOnPageHide = () => {
        window.clearTimeout(timeout);
      };
      addEventListeners(window, handle.signal, {
        pagehide: clearTimeoutOnPageHide,
      });
      handle.signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(timeout);
        },
        { once: true },
      );
    });

    return (props: {
      children: RemixNode;
      class?: string;
      "data-jam-event-badge"?: boolean;
    }) => {
      return (
        <span
          data-jam-event-badge={
            props["data-jam-event-badge"] ? "true" : undefined
          }
          class={clsx(
            "rounded-full px-4 py-3 text-xl leading-none md:px-8 md:py-5 md:text-4xl",
            "transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0",
            props.class,
          )}
        >
          {props.children}
        </span>
      );
    };
  },
);
