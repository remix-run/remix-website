import type { Preset } from "./types.ts";

const websiteMockups: Preset = {
  name: "Website Mockups",
  shaderId: "remixLogo",
  modelUrl: "/landing/models/mockup-websites.pts",
  modelSlot: 0,
  glowColor: [0.3, 0.35, 0.55],
  separation: 0,
  controls: [
    { id: "scale", initial: 55 },
    { id: "rotX", initial: 18 },
    { id: "rotY", initial: 0 },
    { id: "rotZ", initial: -14.4 },
    { id: "spin", initial: 0.08 },
  ],
};

const racecar: Preset = {
  name: "Racecar",
  shaderId: "racecar",
  preloadEager: true,
  modelUrl: "/landing/models/racecar.pts",
  modelSlot: 1,
  glowColor: [0.3, 0.35, 0.55],
  separation: 0,
  controls: [
    { id: "scale", initial: 48 },
    { id: "spin", initial: 0.08 },
    { id: "shimmer", initial: 0.6 },
    { id: "rotZ", initial: 15 },
  ],
};

const racetrack: Preset = {
  name: "Racetrack",
  shaderId: "racetrack",
  cameraPosition: [-0.8, -18.6, 81.4],
  cameraTarget: [0, -4.2, -30],
  glowColor: [0.15, 0.25, 0.08],
  separation: 0,
  controls: [
    { id: "speed", initial: 0.1 },
    { id: "trackW", initial: 40 },
    { id: "curveAmp", initial: 10 },
    { id: "hillH", initial: 7.8 },
    { id: "_fogMode", initial: 1 },
    { id: "starDensity", initial: 0.005 },
    { id: "curveSway", initial: 0 },
  ],
};

const runner: Preset = {
  name: "Model Kit Runner",
  shaderId: "runner",
  modelUrl: "/landing/models/model-kit-runner.pts",
  modelSlot: 2,
  cameraPosition: [-5, 30, 80],
  cameraTarget: [0, 0, 0],
  glowColor: [0.3, 0.35, 0.55],
  separation: 0,
  controls: [
    { id: "scale", initial: 58 },
    { id: "spin", initial: 0.23 },
    { id: "shimmer", initial: 0.5 },
    { id: "rotZ", initial: 15 },
  ],
};

const underTheHood: Preset = {
  name: "Under The Hood",
  shaderId: "racecar",
  modelUrl: "/landing/models/racecar.pts",
  modelSlot: 1,
  cameraPosition: [0, 12, -55],
  cameraTarget: [0, -2, 0],
  cameraTransition: "orbit-left",
  glowColor: [0.3, 0.35, 0.55],
  separation: 0,
  controls: [
    { id: "scale", initial: 90 },
    { id: "spin", initial: 0.08 },
    { id: "shimmer", initial: 0.6 },
    { id: "rotZ", initial: 15 },
  ],
};

const drive: Preset = {
  name: "Drive",
  shaderId: "racetrackCar",
  modelUrl: "/landing/models/racecar-drive.pts",
  modelSlot: 3,
  cameraPosition: [-0.8, -18.6, 81.4],
  cameraTarget: [0, -4.2, -30],
  glowColor: [0.15, 0.25, 0.08],
  separation: 0,
  controls: [
    { id: "speed", initial: 2.3 },
    { id: "trackW", initial: 40 },
    { id: "curveAmp", initial: 0 },
    { id: "wheelThick", initial: 0.18 },
    { id: "wheelbase", initial: 1.14 },
    { id: "wheelTrack", initial: 0.68 },
    { id: "wheelY", initial: -0.13 },
    { id: "wheelZ", initial: -0.11 },
    { id: "_carPosY", initial: -3.15 },
  ],
  systemOverrides: { trailIntensity: 0.5, cursorRepulsion: 0 },
};

export const presets: Preset[] = [
  racetrack,
  runner,
  racecar,
  underTheHood,
  websiteMockups,
  drive,
];
