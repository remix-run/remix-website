import cx from "clsx";
import {
  addEventListeners,
  clientEntry,
  type Handle,
  type RemixNode,
} from "remix/ui";

type JamFadeInBadgeProps = {
  setup?: number;
  children: RemixNode;
  class?: string;
};

export let JamFadeInBadge = clientEntry(
  import.meta.url,
  function JamFadeInBadge(handle: Handle<JamFadeInBadgeProps>) {
    let isVisible = false;
    let delay = handle.props.setup ?? 0;

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

    return () => {
      return (
        <span
          class={cx(
            "rounded-full px-4 py-3 text-xl leading-none md:px-8 md:py-5 md:text-4xl",
            "transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0",
            handle.props.class,
          )}
        >
          {handle.props.children}
        </span>
      );
    };
  },
);
