import { addEventListeners, css, ref, type Handle } from "remix/component";

const containerStyles = css({
  position: "fixed",
  bottom: "12px",
  right: "12px",
  zIndex: "9999",
  padding: "6px 10px",
  borderRadius: "6px",
  background: "rgba(0, 0, 0, 0.55)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  color: "rgba(255, 255, 255, 0.92)",
  fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: "12px",
  fontVariantNumeric: "tabular-nums",
  letterSpacing: "0.02em",
  pointerEvents: "none",
  userSelect: "none",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
});

export function FpsCounter(handle: Handle) {
  let visible = false;
  let el: HTMLDivElement | undefined;
  let frameId = 0;
  let frames = 0;
  let lastSampleMs = 0;
  let displayFps = 0;

  function tick() {
    frameId = 0;
    const now = performance.now();
    if (lastSampleMs === 0) lastSampleMs = now;
    frames += 1;

    const elapsed = now - lastSampleMs;
    if (elapsed >= 500) {
      const instantaneous = (frames * 1000) / elapsed;
      displayFps = displayFps === 0 ? instantaneous : displayFps * 0.6 + instantaneous * 0.4;
      frames = 0;
      lastSampleMs = now;
      if (el) el.textContent = `${displayFps.toFixed(1)} fps`;
    }

    frameId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (frameId || !el) return;
    // Reset the sampling window so the first reading after a toggle reflects
    // the current framerate and not the dormant gap while hidden.
    frames = 0;
    lastSampleMs = 0;
    displayFps = 0;
    if (el) el.textContent = "— fps";
    frameId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (!frameId) return;
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  addEventListeners(window, handle.signal, {
    keydown: (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key.toLowerCase() !== "f") return;

      visible = !visible;
      if (!visible) stopLoop();
      handle.update();
    },
  });

  handle.signal.addEventListener("abort", stopLoop);

  return () => {
    if (!visible) return null;
    return (
      <div
        mix={[
          containerStyles,
          ref((node) => {
            el = node;
            if (node) startLoop();
          }),
        ]}
      />
    );
  };
}
