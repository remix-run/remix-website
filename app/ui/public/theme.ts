export const breakpoints = {
  "2xs": "320px",
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const breakpointMedia = {
  "2xs": `@media (min-width: ${breakpoints["2xs"]})`,
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]})`,
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
    sans: '"Inter", "Inter Fallback", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    system:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
  surface: {
    lvl0: "light-dark(#ffffff, #121212)",
    lvl3: "#f0f4f7",
    lvl4: "#f7fbff",
    neutral100: "#dee2e6",
    newsletterCard: "light-dark(#f7f7f8, #16161a)",
  },
  colors: {
    text: {
      primary: "light-dark(#121212, #c8c8c8)",
      muted: "light-dark(#94989c, #9aa0a6)",
      marketingPrimary: "light-dark(#313539, #e5e7eb)",
      marketingSecondary: "light-dark(#515151, #a4a4a4)",
      newsletterCard: "light-dark(#121212, #e3e3e3)",
      secondary: "#63676b",
      tertiary: "#7c8084",
    },
    neutral: {
      50: "#ebeff2",
      100: "#dee2e6",
      200: "#c6cace",
      750: "#3e4246",
      950: "#0d1114",
    },
    action: {
      current: "light-dark(#0074c0, #2dacf9)",
      primary: "#259eef",
      primaryLabel: "#f7fbff",
      secondary: "#ebeff2",
      secondaryLabel: "#25292d",
    },
    brand: {
      blue: "#3992ff",
      green: "#6bd968",
      red: "#f44250",
    },
  },
  shadow: {
    low: "0 1px 1px 1px #00274f59, 0 2px 3px 0 #0138701a, 0 4px 4px 0 #0138700d",
    mid: "0 2px 4px 0 #011d3940, 0 8px 12px 0 #01387014, 0 12px 16px 0 #0138700a, 0 16px 20px 0 #0138700a, 0 20px 24px 0 #01387005",
  },
} as const;
