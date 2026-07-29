import { css } from "remix/ui";
import {
  RUNNER_AVIF_SRC,
  RUNNER_GIF_SRC,
  RUNNER_STATIC_SRC,
  RUNNER_WEBP_SRC,
} from "../runner-media.ts";

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

// Dismiss animation lives in `home.css` under `.loading-screen-overlay`.
export function LoadingScreen() {
  return () => (
    <div mix={[overlayStyles]} class="loading-screen-overlay">
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
}
