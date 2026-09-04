import { css, type Handle } from "remix/ui";
import {
  RUNNER_AVIF_SRC,
  RUNNER_GIF_SRC,
  RUNNER_STATIC_SRC,
  RUNNER_WEBP_SRC,
} from "../runner-media.ts";

export const LOADING_SCREEN_FAILSAFE_MS = 8_000;

const overlayStyles = css({
  position: "fixed",
  inset: "0",
  display: "grid",
  placeItems: "center",
  zIndex: "50",
  background: "#000",
  pointerEvents: "none",
  // The page content is useful without JavaScript or WebGL. Never let a stale
  // deploy asset or an unexpected client error leave this overlay up forever.
  animation: `loading-screen-failsafe 1ms linear ${LOADING_SCREEN_FAILSAFE_MS}ms forwards`,
  "@keyframes loading-screen-failsafe": {
    to: {
      opacity: "0",
      visibility: "hidden",
    },
  },
  "@keyframes loading-screen-appear": {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
  "& picture": {
    opacity: "0",
    animation: "loading-screen-appear 200ms ease-out 250ms forwards",
  },
  "@keyframes loading-screen-dismiss": {
    from: { opacity: "1" },
    to: {
      opacity: "0",
      visibility: "hidden",
    },
  },
  "&.is-dismissed": {
    animation: "loading-screen-dismiss 600ms ease-out forwards",
  },
  "&.is-skipped": {
    display: "none",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&.is-dismissed": {
      visibility: "hidden",
      opacity: "0",
      animation: "none",
    },
  },
});

const runnerStyles = css({
  maxHeight: "128px",
  width: "auto",
});

export type LoadingScreenStatus = "visible" | "dismissed" | "skipped";

const loadingScreenStatusClassNames: Record<
  LoadingScreenStatus,
  string | null
> = {
  visible: null,
  dismissed: "is-dismissed",
  skipped: "is-skipped",
};

export function LoadingScreen(handle: Handle<{ status: LoadingScreenStatus }>) {
  return () => {
    const statusClassName = loadingScreenStatusClassNames[handle.props.status];

    return (
      <div
        mix={[overlayStyles]}
        class={`loading-screen-overlay${statusClassName ? ` ${statusClassName}` : ""}`}
      >
        <picture>
          <source
            media="(prefers-reduced-motion: reduce)"
            srcset={RUNNER_STATIC_SRC}
            type="image/png"
          />
          <source srcset={RUNNER_AVIF_SRC} type="image/avif" />
          <source srcset={RUNNER_WEBP_SRC} type="image/webp" />
          <img
            src={RUNNER_GIF_SRC}
            alt="Loading Remix homepage"
            width="384"
            height="384"
            loading="eager"
            fetchpriority="high"
            mix={[runnerStyles]}
          />
        </picture>
      </div>
    );
  };
}
