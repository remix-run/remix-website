import clsx from "clsx";
import { clientEntry, type Handle } from "remix/component";
import type { RemixNode } from "remix/component/jsx-runtime";
import assets from "./jam-fade-in-badge.tsx?assets=client";

export let JamFadeInBadge = clientEntry(
  `${assets.entry}#JamFadeInBadge`,
  (handle: Handle) => {
    let isVisible = false;
    let initialized = false;

    return (props: {
      children: RemixNode;
      delay?: number;
      class?: string;
      "data-jam-event-badge"?: boolean;
    }) => {
      if (!initialized) {
        initialized = true;
        handle.queueTask(() => {
          let prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          if (prefersReducedMotion) {
            isVisible = true;
            handle.update();
            return;
          }

          let timeout = window.setTimeout(() => {
            isVisible = true;
            handle.update();
          }, props.delay ?? 0);

          handle.on(window, {
            pagehide() {
              window.clearTimeout(timeout);
            },
          });
        });
      }

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
