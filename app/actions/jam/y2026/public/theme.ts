import { css } from "remix/component";

export type Jam2026ThemeMode = "light" | "dark";

const jamThemeVars = {
  ink: "--jam-2026-ink",
  inkMuted: "--jam-2026-ink-muted",
  inkWash: "--jam-2026-ink-wash",
  accent: "--jam-2026-accent",
  accentHover: "--jam-2026-accent-hover",
  accentActive: "--jam-2026-accent-active",
  highlight: "--jam-2026-highlight",
  brandRed: "--jam-2026-brand-red",
  onAccent: "--jam-2026-on-accent",
  borderSubtle: "--jam-2026-border-subtle",
  borderDefault: "--jam-2026-border-default",
  ruleColor: "--jam-2026-rule-color",
  textMuted: "--jam-2026-text-muted",
  surface: "--jam-2026-surface",
  surfaceRaised: "--jam-2026-surface-raised",
  surfaceRaisedHover: "--jam-2026-surface-raised-hover",
  headerSurface: "--jam-2026-header-surface",
  navBg: "--jam-2026-nav-bg",
  skyTop: "--jam-2026-sky-top",
  skyMiddle: "--jam-2026-sky-middle",
  skyHorizon: "--jam-2026-sky-horizon",
  skyGround: "--jam-2026-sky-ground",
  cloudOpacity: "--jam-2026-cloud-opacity",
  cloudFilter: "--jam-2026-cloud-filter",
};

export const jamTheme = {
  ink: `var(${jamThemeVars.ink})`,
  inkMuted: `var(${jamThemeVars.inkMuted})`,
  inkWash: `var(${jamThemeVars.inkWash})`,
  accent: `var(${jamThemeVars.accent})`,
  accentHover: `var(${jamThemeVars.accentHover})`,
  accentActive: `var(${jamThemeVars.accentActive})`,
  highlight: `var(${jamThemeVars.highlight})`,
  brandRed: `var(${jamThemeVars.brandRed})`,
  onAccent: `var(${jamThemeVars.onAccent})`,
  borderSubtle: `var(${jamThemeVars.borderSubtle})`,
  borderDefault: `var(${jamThemeVars.borderDefault})`,
  ruleColor: `var(${jamThemeVars.ruleColor})`,
  textMuted: `var(${jamThemeVars.textMuted})`,
  surface: `var(${jamThemeVars.surface})`,
  surfaceRaised: `var(${jamThemeVars.surfaceRaised})`,
  surfaceRaisedHover: `var(${jamThemeVars.surfaceRaisedHover})`,
  headerSurface: `var(${jamThemeVars.headerSurface})`,
  navBg: `var(${jamThemeVars.navBg})`,
  skyTop: `var(${jamThemeVars.skyTop})`,
  skyMiddle: `var(${jamThemeVars.skyMiddle})`,
  skyHorizon: `var(${jamThemeVars.skyHorizon})`,
  skyGround: `var(${jamThemeVars.skyGround})`,
  cloudOpacity: `var(${jamThemeVars.cloudOpacity})`,
  cloudFilter: `var(${jamThemeVars.cloudFilter})`,
};

const jamThemeVarsStyle = css({
  [jamThemeVars.ink]: "light-dark(#082845, #ffffff)",
  [jamThemeVars.inkMuted]:
    "light-dark(rgb(8 40 69 / 0.62), rgb(255 255 255 / 0.64))",
  [jamThemeVars.inkWash]:
    "light-dark(rgb(8 40 69 / 0.06), rgb(255 255 255 / 0.08))",
  [jamThemeVars.accent]: "light-dark(#ff3c32, #ff5a45)",
  [jamThemeVars.accentHover]: "light-dark(#e6352d, #ff745f)",
  [jamThemeVars.accentActive]: "light-dark(#c92d27, #e94732)",
  [jamThemeVars.highlight]: "#ff3c32",
  [jamThemeVars.brandRed]: "light-dark(#ff3c32, #ff5a45)",
  [jamThemeVars.onAccent]: "#ffffff",
  [jamThemeVars.borderSubtle]:
    "light-dark(rgb(8 40 69 / 0.12), rgb(255 255 255 / 0.14))",
  [jamThemeVars.borderDefault]:
    "light-dark(rgb(8 40 69 / 0.22), rgb(255 255 255 / 0.24))",
  [jamThemeVars.ruleColor]:
    "light-dark(rgb(8 40 69 / 0.22), rgb(255 255 255 / 0.2))",
  [jamThemeVars.textMuted]:
    "light-dark(rgb(8 40 69 / 0.62), rgb(255 255 255 / 0.5))",
  [jamThemeVars.surface]: "light-dark(#f7f4ea, #030816)",
  [jamThemeVars.surfaceRaised]: "light-dark(#ffffff, #0a1d27)",
  [jamThemeVars.surfaceRaisedHover]:
    "light-dark(rgb(255 255 255 / 0.7), rgb(10 29 39 / 0.7))",
  [jamThemeVars.headerSurface]:
    "light-dark(rgb(255 255 255 / 0.76), rgb(10 29 39 / 0.76))",
  [jamThemeVars.navBg]: "light-dark(#ffffff, #0a1d27)",
  [jamThemeVars.skyTop]:
    "light-dark(color-mix(in srgb, #1174ff 62%, white), #071522)",
  [jamThemeVars.skyMiddle]:
    "light-dark(color-mix(in srgb, #64c6ff 58%, white), #102b38)",
  [jamThemeVars.skyHorizon]:
    "light-dark(color-mix(in srgb, #b7ebff 52%, white), #25424d)",
  [jamThemeVars.skyGround]:
    "light-dark(color-mix(in srgb, #f7f4ea 46%, white), #425963)",
  [jamThemeVars.cloudOpacity]: "0.9",
  [jamThemeVars.cloudFilter]: "contrast(106%) saturate(92%)",
});

const jamThemeModeVarsStyle = css({
  ":root.dark &": {
    [jamThemeVars.cloudOpacity]: "1",
    [jamThemeVars.cloudFilter]: "contrast(106%) saturate(92%)",
  },
  ":root[data-theme='light'] &": {
    [jamThemeVars.cloudOpacity]: "0.9",
    [jamThemeVars.cloudFilter]: "contrast(106%) saturate(92%)",
  },
  ":root[data-theme='dark'] &": {
    [jamThemeVars.cloudOpacity]: "1",
    [jamThemeVars.cloudFilter]: "contrast(106%) saturate(92%)",
  },
});

const jamSelectionStyle = css({
  "&::selection": {
    backgroundColor: jamTheme.highlight,
    color: "#ffffff",
  },
  "& *::selection": {
    backgroundColor: jamTheme.highlight,
    color: "#ffffff",
  },
});

const LIGHT_LOGO_FILTER =
  "brightness(0) saturate(100%) invert(14%) sepia(48%) saturate(1162%) hue-rotate(171deg) brightness(91%) contrast(97%)";
const DARK_LOGO_FILTER = "brightness(0) invert(1)";

/**
 * Recolors the black Jam logo artwork to the theme ink. Follows the system
 * preference until the root has a forced `data-theme`, and also honors the
 * root `.dark` class and a local `data-theme` ancestor (the header).
 */
export const jamLogoFilterStyle = css({
  filter: LIGHT_LOGO_FILTER,
  "@media (prefers-color-scheme: dark)": {
    filter: DARK_LOGO_FILTER,
  },
  ':root[data-theme="light"] &': {
    filter: LIGHT_LOGO_FILTER,
  },
  ":root.dark &": {
    filter: DARK_LOGO_FILTER,
  },
  ':root[data-theme="dark"] &': {
    filter: DARK_LOGO_FILTER,
  },
  '[data-theme="dark"] &': {
    filter: DARK_LOGO_FILTER,
  },
});

export const jamThemeStyle = [
  jamThemeVarsStyle,
  jamThemeModeVarsStyle,
  jamSelectionStyle,
];
