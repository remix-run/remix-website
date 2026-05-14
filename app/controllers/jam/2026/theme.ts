import { css } from "remix/ui";

let jamThemeVars = {
  ink: "--jam-2026-ink",
  inkRgb: "--jam-2026-ink-rgb",
  inkMuted: "--jam-2026-ink-muted",
  inkWash: "--jam-2026-ink-wash",
  accent: "--jam-2026-accent",
  accentHover: "--jam-2026-accent-hover",
  accentActive: "--jam-2026-accent-active",
  onAccent: "--jam-2026-on-accent",
  borderSubtle: "--jam-2026-border-subtle",
  borderDefault: "--jam-2026-border-default",
  surface: "--jam-2026-surface",
  surfaceRaised: "--jam-2026-surface-raised",
  surfaceRaisedRgb: "--jam-2026-surface-raised-rgb",
  surfaceRaisedHover: "--jam-2026-surface-raised-hover",
  headerSurface: "--jam-2026-header-surface",
  sky: "--jam-2026-sky",
  skySoft: "--jam-2026-sky-soft",
  skyPale: "--jam-2026-sky-pale",
};

const cv = (name: string) => `var(${name})`;

export let jamTheme = {
  ink: cv(jamThemeVars.ink),
  inkMuted: cv(jamThemeVars.inkMuted),
  inkWash: cv(jamThemeVars.inkWash),
  accent: cv(jamThemeVars.accent),
  accentHover: cv(jamThemeVars.accentHover),
  accentActive: cv(jamThemeVars.accentActive),
  onAccent: cv(jamThemeVars.onAccent),
  borderSubtle: cv(jamThemeVars.borderSubtle),
  borderDefault: cv(jamThemeVars.borderDefault),
  surface: cv(jamThemeVars.surface),
  surfaceRaised: cv(jamThemeVars.surfaceRaised),
  surfaceRaisedHover: cv(jamThemeVars.surfaceRaisedHover),
  headerSurface: cv(jamThemeVars.headerSurface),
  sky: cv(jamThemeVars.sky),
  skySoft: cv(jamThemeVars.skySoft),
  skyPale: cv(jamThemeVars.skyPale),
};

export let jamThemeStyle = css({
  [jamThemeVars.ink]: "#082845",
  [jamThemeVars.inkRgb]: "8 40 69",
  [jamThemeVars.inkMuted]: `rgb(${cv(jamThemeVars.inkRgb)} / 0.62)`,
  [jamThemeVars.inkWash]: `rgb(${cv(jamThemeVars.inkRgb)} / 0.06)`,
  [jamThemeVars.accent]: "#ff3c32",
  [jamThemeVars.accentHover]: "#e6352d",
  [jamThemeVars.accentActive]: "#c92d27",
  [jamThemeVars.onAccent]: "#ffffff",
  [jamThemeVars.borderSubtle]: `rgb(${cv(jamThemeVars.inkRgb)} / 0.12)`,
  [jamThemeVars.borderDefault]: `rgb(${cv(jamThemeVars.inkRgb)} / 0.22)`,
  [jamThemeVars.surface]: "#f7f4ea",
  [jamThemeVars.surfaceRaised]: "#ffffff",
  [jamThemeVars.surfaceRaisedRgb]: "255 255 255",
  [jamThemeVars.surfaceRaisedHover]: `rgb(${cv(
    jamThemeVars.surfaceRaisedRgb,
  )} / 0.7)`,
  [jamThemeVars.headerSurface]: `rgb(${cv(
    jamThemeVars.surfaceRaisedRgb,
  )} / 0.76)`,
  [jamThemeVars.sky]: "#9fc5f5",
  [jamThemeVars.skySoft]: "#ecf7ff",
  [jamThemeVars.skyPale]: "#eaf6ff",
});
