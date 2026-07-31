type CloudLightingSettings = {
  lightDirection: [number, number, number];
  sunColor: string;
  ambientColor: string;
  skyBounceColor: string;
  cloudWhite: string;
  cloudShadow: string;
};

type CloudCameraSettings = {
  position: [number, number, number];
  lookAt: [number, number, number];
};

export type CloudBackdropSettings = {
  detail: number;
  shape: number;
  speed: number;
  verticalDistribution: number;
  horizontalDistribution: number;
  depthDistribution: number;
  coverage: number;
  density: number;
  erosion: number;
  sunBrightness: number;
  lightAbsorption: number;
  multiScattering: number;
  anisotropy: number;
  phaseMix: number;
  cloudBlur: number;
  // Width in physical pixels of each pixelation cell applied in the final
  // composite. `1` is a no-op (one cell per screen pixel = effect off);
  // higher values snap the cloud to a coarser grid for a chunky 16-bit
  // sprite look. Costs nothing extra at runtime.
  pixelSize: number;
  // Discrete steps per RGB channel applied after pixel-snapping. `64`
  // (or higher) is visually indistinguishable from off; lower values
  // collapse the cloud onto a limited palette; drop to ~8 for an EGA
  // feel, ~16-32 for hi-color 16-bit, 2 for a punch-card silhouette.
  colorLevels: number;
  renderScale: number;
  primarySteps: number;
  lightSteps: number;
  lighting: CloudLightingSettings;
  camera: CloudCameraSettings;
};

export const DEFAULT_CLOUD_SETTINGS: CloudBackdropSettings = {
  detail: 0.04,
  shape: 0.8,
  speed: 0.8,
  verticalDistribution: 2.05,
  horizontalDistribution: 1.02,
  depthDistribution: 2.07,
  coverage: 0.37,
  // Wispier base to match the lighter cloud cover in the painterly
  // hero photo; runtime scroll multiplier still scales from here.
  density: 1.85,
  erosion: 0.15,
  sunBrightness: 3,
  lightAbsorption: 1.32,
  multiScattering: 0.76,
  anisotropy: 0.34,
  phaseMix: 0.3,
  cloudBlur: 2.5,
  pixelSize: 0,
  colorLevels: 32,
  renderScale: 0.85,
  primarySteps: 25,
  lightSteps: 1,
  lighting: {
    // Tuned for a saturated cerulean sky with soft, sunlit undersides.
    // `cloudShadow` is pulled toward a pale icy sky tint so the cloud
    // base reads as haze rather than heavy atmospheric grey.
    lightDirection: [-0.28, 0.64, 0.92],
    sunColor: "#dbe3f0",
    ambientColor: "#a7c9dc",
    skyBounceColor: "#3a83cc",
    cloudWhite: "#eaeff2",
    cloudShadow: "#e5f9ff",
  },
  camera: {
    position: [-18.0, 21.4, 8.9],
    lookAt: [2.9, 12.5, -12.7],
  },
};

export function normalizeCloudSettings(
  settings?: Partial<CloudBackdropSettings>,
): CloudBackdropSettings {
  return {
    ...DEFAULT_CLOUD_SETTINGS,
    ...settings,
    lighting: {
      ...DEFAULT_CLOUD_SETTINGS.lighting,
      ...settings?.lighting,
    },
    camera: {
      ...DEFAULT_CLOUD_SETTINGS.camera,
      ...settings?.camera,
    },
  };
}
