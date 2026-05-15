import { css } from "remix/ui";

let jamThemeVars = {
  ink: "--jam-2026-ink",
  inkMuted: "--jam-2026-ink-muted",
  inkWash: "--jam-2026-ink-wash",
  accent: "--jam-2026-accent",
  accentHover: "--jam-2026-accent-hover",
  accentActive: "--jam-2026-accent-active",
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
  sky: "--jam-2026-sky",
  skySoft: "--jam-2026-sky-soft",
  skyPale: "--jam-2026-sky-pale",
};

export let jamTheme = {
  ink: `var(${jamThemeVars.ink})`,
  inkMuted: `var(${jamThemeVars.inkMuted})`,
  inkWash: `var(${jamThemeVars.inkWash})`,
  accent: `var(${jamThemeVars.accent})`,
  accentHover: `var(${jamThemeVars.accentHover})`,
  accentActive: `var(${jamThemeVars.accentActive})`,
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
  sky: `var(${jamThemeVars.sky})`,
  skySoft: `var(${jamThemeVars.skySoft})`,
  skyPale: `var(${jamThemeVars.skyPale})`,
};

export let jamThemeStyle = css({
  [jamThemeVars.ink]: "light-dark(#082845, #ffffff)",
  [jamThemeVars.inkMuted]:
    "light-dark(rgb(8 40 69 / 0.62), rgb(255 255 255 / 0.64))",
  [jamThemeVars.inkWash]:
    "light-dark(rgb(8 40 69 / 0.06), rgb(255 255 255 / 0.08))",
  [jamThemeVars.accent]: "light-dark(#ff3c32, #ff5a45)",
  [jamThemeVars.accentHover]: "light-dark(#e6352d, #ff745f)",
  [jamThemeVars.accentActive]: "light-dark(#c92d27, #e94732)",
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
  [jamThemeVars.sky]: "light-dark(#9fc5f5, #07112c)",
  [jamThemeVars.skySoft]: "light-dark(#ecf7ff, #182851)",
  [jamThemeVars.skyPale]: "light-dark(#eaf6ff, #0a1d27)",
});
