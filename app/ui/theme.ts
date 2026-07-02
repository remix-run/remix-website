export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
} as const;

export const breakpointMedia = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
} as const;

export const theme = {
  space: {
    sm: "8px",
    lg: "16px",
    xl: "24px",
  },
  radius: {
    full: "9999px",
  },
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontWeight: {
    normal: "400",
    bold: "700",
  },
  surface: {
    lvl0: "light-dark(#ffffff, #121212)",
  },
  colors: {
    text: {
      primary: "light-dark(#121212, #c8c8c8)",
      muted: "light-dark(#94989c, #9aa0a6)",
    },
  },
} as const;
