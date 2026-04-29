import { css } from "remix/component";

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
      <img
        src="/landing/remix-runner.gif"
        alt="Loading Remix homepage"
        width="384"
        height="384"
        loading="eager"
        fetchpriority="high"
        mix={[runnerStyles]}
      />
    </div>
  );
}
