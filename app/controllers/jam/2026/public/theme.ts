import { css } from "remix/ui";

export type Jam2026ThemeMode = "light" | "dark";

let jamThemeVars = {
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

export let jamTheme = {
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

let jamThemeVarsStyle = css({
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

let jamThemeModeVarsStyle = css({
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

let jamSelectionStyle = css({
  "&::selection": {
    backgroundColor: jamTheme.highlight,
    color: "#ffffff",
  },
  "& *::selection": {
    backgroundColor: jamTheme.highlight,
    color: "#ffffff",
  },
});

export let jamThemeStyle = [
  jamThemeVarsStyle,
  jamThemeModeVarsStyle,
  jamSelectionStyle,
];
