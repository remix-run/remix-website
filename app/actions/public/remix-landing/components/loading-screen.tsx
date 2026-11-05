import { css, type Handle } from "remix/component";
import {
  RUNNER_AVIF_SRC,
  RUNNER_GIF_SRC,
  RUNNER_STATIC_SRC,
  RUNNER_WEBP_SRC,
} from "../runner-media.ts";

const LOADING_SCREEN_FAILSAFE_MS = 8_000;
const LOADING_SCREEN_MIN_VISIBLE_MS = 750;

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
    let statusClassName = loadingScreenStatusClassNames[handle.props.status];

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

export interface LoadingScreenController {
  readonly status: LoadingScreenStatus;
  /** Skips the overlay if it is still visible when the CSS fail-safe would hide it. */
  startFailsafe(): void;
  /** Fades the overlay out once it has been visible long enough. Idempotent. */
  dismiss(): Promise<void>;
}

/**
 * Owns the loading overlay's lifecycle for its parent client entry. The
 * overlay is server-rendered, so the initial status reflects whether the CSS
 * fail-safe already hid it before hydration.
 */
export function createLoadingScreenController(
  handle: Pick<Handle, "signal" | "update">,
): LoadingScreenController {
  let dismissal: Promise<void> | null = null;
  let failsafeTimer: ReturnType<typeof setTimeout> | null = null;
  let status: LoadingScreenStatus =
    typeof document !== "undefined" &&
    (performance.now() >= LOADING_SCREEN_FAILSAFE_MS ||
      isHidden(document.querySelector(".loading-screen-overlay")))
      ? "skipped"
      : "visible";

  function clearFailsafe() {
    if (failsafeTimer !== null) {
      clearTimeout(failsafeTimer);
      failsafeTimer = null;
    }
  }

  function skip() {
    status = "skipped";
    clearFailsafe();
    return handle.update();
  }

  return {
    get status() {
      return status;
    },

    startFailsafe() {
      if (status !== "visible") return;
      failsafeTimer = setTimeout(
        () => {
          failsafeTimer = null;
          if (!handle.signal.aborted && status === "visible") void skip();
        },
        Math.max(0, LOADING_SCREEN_FAILSAFE_MS - performance.now()),
      );
      handle.signal.addEventListener("abort", clearFailsafe, { once: true });
    },

    dismiss() {
      return (dismissal ??= (async () => {
        let overlay = document.querySelector(".loading-screen-overlay");
        if (!overlay) return;

        if (isHidden(overlay)) {
          await skip();
          return;
        }

        let animation = overlay.querySelector("picture")?.getAnimations()[0];
        let visibleMs = LOADING_SCREEN_MIN_VISIBLE_MS;
        if (animation) {
          let now = Number(document.timeline.currentTime ?? 0);
          let start = Number(animation.startTime ?? now);
          let delay = Number(animation.effect?.getTiming().delay ?? 0);
          visibleMs = now - start - delay;
        }

        if (visibleMs < 0) {
          status = "skipped";
          await handle.update();
          return;
        }

        let remainingMs = LOADING_SCREEN_MIN_VISIBLE_MS - visibleMs;
        if (remainingMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingMs));
        }
        if (handle.signal.aborted) return;

        // The CSS or JS fail-safe may have elapsed while this task was waiting.
        if (status !== "visible" || isHidden(overlay)) {
          await skip();
          return;
        }

        status = "dismissed";
        clearFailsafe();
        let signal = await handle.update();
        if (signal.aborted) return;

        await overlay.getAnimations()[0]?.finished.catch(() => {});
      })());
    },
  };
}

function isHidden(overlay: Element | null) {
  if (!overlay) return false;
  let style = getComputedStyle(overlay);
  return style.display === "none" || style.visibility === "hidden";
}
