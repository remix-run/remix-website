import { css, type Handle } from "remix/component";
import {
  LOADING_SCREEN_FADE_MS,
  LOADING_SCREEN_MIN_DISPLAY_MS,
} from "../loading-timing";

const DISMISS_KEYFRAMES = "loading-screen-dismiss";

const overlayStyles = css({
  position: "fixed",
  inset: "0",
  display: "grid",
  placeItems: "center",
  zIndex: "50",
  background: "#000",
  pointerEvents: "none",
});

const runnerStyles = css({
  maxHeight: "128px",
  width: "auto",
});

export function LoadingScreen(_handle: Handle) {
  return () => (
    <>
      <style>
        {`@keyframes ${DISMISS_KEYFRAMES} { from { opacity: 1; } to { opacity: 0; visibility: hidden; } }`}
      </style>
      <div
        mix={[overlayStyles]}
        style={{
          animation: `${DISMISS_KEYFRAMES} ${LOADING_SCREEN_FADE_MS}ms ease-out ${LOADING_SCREEN_MIN_DISPLAY_MS}ms forwards`,
        }}
      >
        <img
          src="/landing/remix-runner.gif"
          alt="Loading Remix homepage"
          mix={[runnerStyles]}
        />
      </div>
    </>
  );
}
