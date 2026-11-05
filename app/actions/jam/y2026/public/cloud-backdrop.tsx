import { clientEntry, css, ref, type Handle } from "remix/component";

import { ticketModalConfig } from "./tickets-modal-contract.ts";
import { jamTheme } from "./theme.ts";

import {
  DEFAULT_CLOUD_SETTINGS,
  type CloudBackdropSettings,
} from "./clouds/settings.ts";

type CloudRendererModule =
  typeof import("./clouds/volumetric-cloud-renderer.ts");
type CloudRenderer = InstanceType<
  CloudRendererModule["VolumetricCloudRenderer"]
>;

const scrollCloudClearing = {
  distanceRatio: 0.9,
  minCoverage: 0.25,
  minDensity: 0.2,
  maxCameraZ: -10,
  maxErosion: 1,
};

const darkCloudSettings: Partial<CloudBackdropSettings> = {
  anisotropy: 0.72,
  lightAbsorption: 2.85,
  lightSteps: 3,
  multiScattering: 0.18,
  phaseMix: 0.68,
  sunBrightness: 1,
  lighting: {
    lightDirection: [0.42, 0.12, -0.9],
    sunColor: "#9bb8c4",
    ambientColor: "#071522",
    skyBounceColor: "#1d3541",
    cloudWhite: "#9ab8c2",
    cloudShadow: "#07111b",
  },
};

export let Jam2026CloudBackdrop = clientEntry(
  import.meta.url,
  function Jam2026CloudBackdrop(_handle: Handle) {
    return () => (
      <div
        aria-hidden="true"
        mix={[
          cloudBackdropStyle,
          ref((host, signal) => {
            void mountCloudBackdrop(host, signal);
          }),
        ]}
      />
    );
  },
);

async function mountCloudBackdrop(host: HTMLElement, signal: AbortSignal) {
  host.dataset.cloudState = "fallback";

  let reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let renderer = await createCloudRenderer(host, reducedMotion, signal);
  if (!renderer) return;

  let loop = createCloudRenderLoop(host, renderer, reducedMotion);
  let settingsSync = createCloudSettingsSync(renderer, () => {
    if (reducedMotion) loop.renderNow();
  });

  let resizeObserver = new ResizeObserver(() => {
    resizeCloudRenderer(host, renderer);
    settingsSync.request();
  });
  resizeObserver.observe(host);
  resizeCloudRenderer(host, renderer);
  loop.renderNow();
  loop.syncPausedState();

  let pageBackground = document.getElementById(
    ticketModalConfig.pageBackgroundId,
  );
  let pageBackgroundObserver = pageBackground
    ? new MutationObserver(loop.syncPausedState)
    : undefined;
  if (pageBackground) {
    pageBackgroundObserver?.observe(pageBackground, {
      attributeFilter: ["aria-hidden", "inert"],
    });
  }

  let rootObserver = new MutationObserver(settingsSync.request);
  rootObserver.observe(document.documentElement, {
    attributeFilter: ["class", "data-theme"],
  });

  window.addEventListener("resize", settingsSync.request, { signal });
  document.addEventListener("visibilitychange", loop.syncPausedState, {
    signal,
  });
  if (!reducedMotion) {
    window.addEventListener("scroll", settingsSync.request, {
      passive: true,
      signal,
    });
  }

  signal.addEventListener(
    "abort",
    () => {
      loop.stop();
      settingsSync.cancel();
      resizeObserver.disconnect();
      pageBackgroundObserver?.disconnect();
      rootObserver.disconnect();
      renderer.dispose();
    },
    { once: true },
  );
}

/**
 * Loads the WebGL renderer on demand. Resolves to `undefined` when WebGL2 is
 * unavailable, the module fails to load, the mount was aborted meanwhile, or
 * the renderer cannot be constructed; the CSS fallback stays visible then.
 */
async function createCloudRenderer(
  host: HTMLElement,
  reducedMotion: boolean,
  signal: AbortSignal,
): Promise<CloudRenderer | undefined> {
  if (!canUseWebGl2()) return undefined;

  let clouds: CloudRendererModule;
  try {
    clouds = await import("./clouds/volumetric-cloud-renderer.ts");
  } catch {
    return undefined;
  }

  if (signal.aborted) return undefined;

  try {
    return new clouds.VolumetricCloudRenderer({
      host,
      seed: 60,
      reducedMotion,
      settings: createCloudSettings(DEFAULT_CLOUD_SETTINGS),
    });
  } catch {
    host.dataset.cloudState = "fallback";
    return undefined;
  }
}

function resizeCloudRenderer(host: HTMLElement, renderer: CloudRenderer) {
  let rect = host.getBoundingClientRect();
  renderer.resize(rect.width, rect.height);
}

/**
 * Owns the requestAnimationFrame loop: renders at the renderer's target frame
 * rate while the page is visible and the background isn't covered by a modal.
 * Reduced motion renders single frames on demand and never starts the loop.
 */
function createCloudRenderLoop(
  host: HTMLElement,
  renderer: CloudRenderer,
  reducedMotion: boolean,
) {
  let animationFrame = 0;
  let lastRenderAt = 0;
  let lastElapsed = 0;
  let start = performance.now();

  let renderNow = (now = performance.now()) => {
    let elapsed = reducedMotion ? 0 : (now - start) / 1000;
    let deltaSeconds = Math.max(0, elapsed - lastElapsed);
    lastElapsed = elapsed;
    renderer.render(deltaSeconds);
    host.dataset.cloudState = "ready";
  };

  let tick = (now: number) => {
    if (!isCloudPaused() && now - lastRenderAt >= renderer.targetFrameMs) {
      renderNow(now);
      lastRenderAt = now;
    }

    animationFrame = requestAnimationFrame(tick);
  };

  let stop = () => {
    if (animationFrame === 0) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  let syncPausedState = () => {
    if (isCloudPaused()) {
      stop();
      return;
    }

    if (reducedMotion || animationFrame !== 0) return;
    lastRenderAt = 0;
    animationFrame = requestAnimationFrame(tick);
  };

  return { renderNow, stop, syncPausedState };
}

/**
 * Coalesces scroll/resize/theme changes into at most one settings update per
 * animation frame.
 */
function createCloudSettingsSync(
  renderer: CloudRenderer,
  onSynced: () => void,
) {
  let settingsFrame = 0;

  let sync = () => {
    settingsFrame = 0;
    renderer.setSettings(createCloudSettings(DEFAULT_CLOUD_SETTINGS));
    onSynced();
  };

  return {
    request() {
      if (settingsFrame !== 0) return;
      settingsFrame = requestAnimationFrame(sync);
    },
    cancel() {
      if (settingsFrame !== 0) cancelAnimationFrame(settingsFrame);
    },
  };
}

function canUseWebGl2() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

function isCloudPaused() {
  let pageBackground = document.getElementById(
    ticketModalConfig.pageBackgroundId,
  );

  return (
    document.hidden ||
    pageBackground?.hasAttribute("inert") === true ||
    pageBackground?.getAttribute("aria-hidden") === "true"
  );
}

function createCloudSettings(
  defaults: CloudBackdropSettings,
): Partial<CloudBackdropSettings> {
  let scrollProgress = getCloudScrollProgress();
  let positionZ =
    defaults.camera.position[2] +
    (scrollCloudClearing.maxCameraZ - defaults.camera.position[2]) *
      scrollProgress;

  return {
    ...defaults,
    coverage:
      defaults.coverage *
      (1 - scrollProgress * (1 - scrollCloudClearing.minCoverage)),
    density:
      defaults.density *
      (1 - scrollProgress * (1 - scrollCloudClearing.minDensity)),
    erosion:
      defaults.erosion +
      (scrollCloudClearing.maxErosion - defaults.erosion) * scrollProgress,
    camera: {
      ...defaults.camera,
      position: [
        defaults.camera.position[0],
        defaults.camera.position[1],
        positionZ,
      ],
    },
    ...(getResolvedTheme() === "dark" ? darkCloudSettings : null),
  };
}

function getCloudScrollProgress() {
  let clearDistance = window.innerHeight * scrollCloudClearing.distanceRatio;
  if (clearDistance <= 0) return 0;
  return Math.min(Math.max(window.scrollY / clearDistance, 0), 1);
}

function getResolvedTheme() {
  let root = document.documentElement;
  if (root.dataset.theme === "dark" || root.dataset.theme === "light") {
    return root.dataset.theme;
  }

  return root.classList.contains("dark") ? "dark" : "light";
}

let cloudBackdropStyle = css({
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  overflow: "hidden",
  contain: "layout paint style",
  opacity: jamTheme.cloudOpacity,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "-10% -14% -18%",
    background:
      "radial-gradient(ellipse at 20% 82%, light-dark(rgb(255 255 255 / 0.72), rgb(154 184 194 / 0.18)) 0, transparent 30rem), radial-gradient(ellipse at 62% 79%, light-dark(rgb(236 246 250 / 0.62), rgb(85 116 132 / 0.16)) 0, transparent 34rem), radial-gradient(ellipse at 92% 88%, light-dark(rgb(255 255 255 / 0.58), rgb(155 184 196 / 0.12)) 0, transparent 28rem)",
    filter: "blur(8px) saturate(115%)",
    opacity: 0.85,
    transition: "opacity 1600ms ease",
  },
  "& > canvas": {
    display: "block",
    width: "100%",
    height: "100%",
    opacity: 0,
    filter: jamTheme.cloudFilter,
    transition: "opacity 1600ms ease",
  },
  '&[data-cloud-state="ready"]::before': {
    opacity: 0,
  },
  '&[data-cloud-state="ready"] > canvas': {
    opacity: 1,
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&::before, & > canvas": {
      transition: "none",
    },
  },
});
