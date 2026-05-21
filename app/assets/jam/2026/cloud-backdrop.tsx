import { clientEntry, css, ref, type Handle } from "remix/ui";

import { ticketModalConfig } from "../../../controllers/jam/2026/tickets-modal-contract.ts";
import { jamTheme } from "../../../controllers/jam/2026/theme.ts";

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

export let Jam2026CloudBackdrop = clientEntry(
  import.meta.url,
  function Jam2026CloudBackdrop(_handle: Handle) {
    return () => (
      <div
        aria-hidden="true"
        data-jam-2026-cloud-backdrop=""
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

  if (!canUseWebGl2()) return;

  let clouds: CloudRendererModule;
  try {
    clouds = await import("./clouds/volumetric-cloud-renderer.ts");
  } catch {
    return;
  }

  if (signal.aborted) return;

  let reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let renderer: CloudRenderer;

  try {
    renderer = new clouds.VolumetricCloudRenderer({
      host,
      seed: 60,
      reducedMotion,
      settings: createCloudSettings(DEFAULT_CLOUD_SETTINGS),
    });
  } catch {
    host.dataset.cloudState = "fallback";
    return;
  }

  let animationFrame = 0;
  let settingsFrame = 0;
  let lastRenderAt = 0;
  let lastElapsed = 0;
  let start = performance.now();

  let resize = () => {
    let rect = host.getBoundingClientRect();
    renderer.resize(rect.width, rect.height);
  };

  let renderFrame = (now: number) => {
    let elapsed = reducedMotion ? 0 : (now - start) / 1000;
    let deltaSeconds = Math.max(0, elapsed - lastElapsed);
    lastElapsed = elapsed;
    renderer.render(deltaSeconds);
    host.dataset.cloudState = "ready";
  };

  let stopLoop = () => {
    if (animationFrame === 0) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  let loop = (now: number) => {
    if (!isCloudPaused() && now - lastRenderAt >= renderer.targetFrameMs) {
      renderFrame(now);
      lastRenderAt = now;
    }

    animationFrame = requestAnimationFrame(loop);
  };

  let startLoop = () => {
    if (reducedMotion || animationFrame !== 0 || isCloudPaused()) return;
    lastRenderAt = 0;
    animationFrame = requestAnimationFrame(loop);
  };

  let syncPausedState = () => {
    if (isCloudPaused()) {
      stopLoop();
      return;
    }

    startLoop();
  };

  let syncSettings = () => {
    settingsFrame = 0;
    renderer.setSettings(createCloudSettings(DEFAULT_CLOUD_SETTINGS));

    if (reducedMotion) {
      renderFrame(performance.now());
    }
  };

  let requestSettingsSync = () => {
    if (settingsFrame !== 0) return;
    settingsFrame = requestAnimationFrame(syncSettings);
  };

  let resizeObserver = new ResizeObserver(() => {
    resize();
    requestSettingsSync();
  });
  resizeObserver.observe(host);
  resize();
  renderFrame(performance.now());
  syncPausedState();

  let pageBackground = document.getElementById(
    ticketModalConfig.pageBackgroundId,
  );
  let pageBackgroundObserver = pageBackground
    ? new MutationObserver(syncPausedState)
    : undefined;
  if (pageBackground) {
    pageBackgroundObserver?.observe(pageBackground, {
      attributeFilter: ["aria-hidden", "inert"],
    });
  }

  let rootObserver = new MutationObserver(requestSettingsSync);
  rootObserver.observe(document.documentElement, {
    attributeFilter: ["class", "data-theme"],
  });

  window.addEventListener("resize", requestSettingsSync, { signal });
  document.addEventListener("visibilitychange", syncPausedState, { signal });
  if (!reducedMotion) {
    window.addEventListener("scroll", requestSettingsSync, {
      passive: true,
      signal,
    });
  }

  signal.addEventListener(
    "abort",
    () => {
      stopLoop();
      if (settingsFrame !== 0) cancelAnimationFrame(settingsFrame);
      resizeObserver.disconnect();
      pageBackgroundObserver?.disconnect();
      rootObserver.disconnect();
      renderer.dispose();
    },
    { once: true },
  );
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
  let dark = getResolvedTheme() === "dark";

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
    ...(dark
      ? {
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
        }
      : null),
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
