import { css, ref, type Handle } from "remix/component";
import type { ModelData } from "../engine/model-loader.ts";
import {
  ParticleRenderer,
  type PointerPosition,
} from "../engine/particle-renderer.ts";

type ParticleCanvasProps = {
  brandGradientMode: boolean;
  morphValueRef: { current: number };
  interactionPausedRef: { current: boolean };
  modelData: (ModelData | undefined)[];
  onFirstFrame: () => Promise<void>;
  onError: (error: unknown) => void;
};

export function ParticleCanvas(handle: Handle<ParticleCanvasProps>) {
  let containerEl: HTMLDivElement | undefined;
  let canvasEl: HTMLCanvasElement | undefined;
  let renderer: ParticleRenderer | null = null;
  let initFailed = false;
  let frameId = 0;
  let reveal: Promise<void> | null = null;

  let pointer = trackMousePointer(handle.signal, {
    viewport: () => containerEl ?? canvasEl,
    // The foreground card owns attention while the model is paused; pointer
    // movement must not wake rendering, parallax, or particle displacement.
    isPaused: () => handle.props.interactionPausedRef.current,
    onMove: markActivity,
  });
  window.addEventListener("scroll", markActivity, {
    passive: true,
    signal: handle.signal,
  });
  handle.signal.addEventListener("abort", disposeRenderer);

  function markActivity() {
    renderer?.markActivity(performance.now());
  }

  function disposeRenderer() {
    cancelAnimationFrame(frameId);
    renderer?.dispose();
    renderer = null;
  }

  function fail(error: unknown) {
    initFailed = true;
    disposeRenderer();
    handle.props.onError(error);
  }

  function maybeInit() {
    if (initFailed || renderer || !containerEl || !canvasEl) return;

    try {
      renderer = new ParticleRenderer({
        canvas: canvasEl,
        container: containerEl,
        input: handle.props,
        modelData: handle.props.modelData,
      });
    } catch (error) {
      fail(error);
      return;
    }
    frameId = requestAnimationFrame(animate);
  }

  function animate() {
    if (!renderer) return;
    try {
      if (renderer.frame(performance.now(), handle.props, pointer)) {
        reveal ??= handle.props.onFirstFrame().then(() => {
          if (!handle.signal.aborted) renderer?.startIntro();
        });
      }
      frameId = requestAnimationFrame(animate);
    } catch (error) {
      fail(error);
    }
  }

  return () => {
    renderer?.syncModelTextures(handle.props.modelData);

    if (!renderer && !initFailed) {
      handle.queueTask(() => {
        maybeInit();
      });
    }

    return (
      <div
        aria-hidden="true"
        mix={[
          shellStyles,
          ref((node) => {
            containerEl = node;
          }),
        ]}
      >
        <canvas
          mix={[
            canvasStyles,
            ref((node) => {
              canvasEl = node;
            }),
          ]}
        />
      </div>
    );
  };
}

/**
 * Tracks a fine mouse pointer as viewport NDC (−1…1); touch and pen input is
 * ignored. `onMove` fires for every accepted move while not paused.
 */
function trackMousePointer(
  signal: AbortSignal,
  options: {
    viewport: () => Element | undefined;
    isPaused: () => boolean;
    onMove: () => void;
  },
): PointerPosition {
  let pointer: PointerPosition = { x: 0, y: 0 };

  function setPosition(clientX: number, clientY: number) {
    if (options.isPaused()) return;
    options.onMove();
    let vp = options.viewport();
    if (vp) {
      let rect = vp.getBoundingClientRect();
      let rw = rect.width > 1e-4 ? rect.width : window.innerWidth;
      let rh = rect.height > 1e-4 ? rect.height : window.innerHeight;
      pointer.x = ((clientX - rect.left) / rw) * 2 - 1;
      pointer.y = ((clientY - rect.top) / rh) * 2 - 1;
    } else {
      pointer.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.y = (clientY / window.innerHeight) * 2 - 1;
    }
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "mouse") {
        setPosition(event.clientX, event.clientY);
      }
    },
    { signal },
  );
  // Fallback for browsers without Pointer Events.
  window.addEventListener(
    "mousemove",
    (event) => {
      if (window.PointerEvent) return;
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        setPosition(event.clientX, event.clientY);
      }
    },
    { signal },
  );

  return pointer;
}

const shellStyles = css({
  position: "fixed",
  inset: "0",
  zIndex: "5",
  pointerEvents: "none",
});

const canvasStyles = css({
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
});
