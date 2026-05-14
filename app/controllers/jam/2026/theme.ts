import { css } from "remix/ui";
import { createTheme, RMX_01, theme } from "remix/ui/theme";

export let Jam2026Theme = createTheme({
  ...RMX_01.values,
  space: {
    none: "0px",
    px: "1px",
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "48px",
  },
  radius: {
    ...RMX_01.values.radius,
    sm: "4px",
    md: "8px",
    lg: "16px",
    xl: "24px",
  },
  fontFamily: {
    sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  fontSize: {
    xxxs: "10px",
    xxs: "11px",
    xs: "12px",
    sm: "13px",
    md: "15px",
    lg: "16px",
    xl: "24px",
    xxl: "57px",
  },
  lineHeight: {
    tight: "1",
    normal: "1.2",
    relaxed: "1.6",
  },
  letterSpacing: {
    tight: "-0.03em",
    normal: "0",
    meta: "0.06em",
    wide: "0.14em",
  },
  fontWeight: {
    normal: "400",
    medium: "400",
    semibold: "600",
    bold: "600",
  },
  control: {
    height: {
      sm: "32px",
      md: "40px",
      lg: "48px",
    },
  },
  surface: {
    ...RMX_01.values.surface,
    lvl0: "#f7f4ea",
    lvl1: "#fff8e8",
    lvl2: "#ffffff",
    lvl3: "rgba(255, 255, 255, 0.5)",
    lvl4: "#0a1d27",
  },
  shadow: {
    xs: "0 1px 2px rgba(8, 40, 69, 0.06)",
    sm: "0 3px 6px rgba(8, 40, 69, 0.05)",
    md: "0 10px 18px rgba(8, 40, 69, 0.05)",
    lg: "0 24px 48px rgba(8, 40, 69, 0.07)",
    xl: "0 1px 2px rgba(8, 40, 69, 0.06), 0 3px 6px rgba(8, 40, 69, 0.05), 0 10px 18px rgba(8, 40, 69, 0.05), 0 24px 48px rgba(8, 40, 69, 0.07)",
  },
  colors: {
    ...RMX_01.values.colors,
    text: {
      ...RMX_01.values.colors.text,
      primary: "#082845",
      secondary: "rgba(8, 40, 69, 0.62)",
      muted: "rgba(8, 40, 69, 0.62)",
      link: "#ff3c32",
    },
    border: {
      subtle: "rgba(8, 40, 69, 0.12)",
      default: "rgba(8, 40, 69, 0.22)",
      strong: "#082845",
    },
    focus: {
      ring: "#ff3c32",
    },
    overlay: {
      scrim: "rgba(0, 0, 0, 0.7)",
    },
    action: {
      primary: {
        background: "#ff3c32",
        backgroundHover: "#e6352d",
        backgroundActive: "#c92d27",
        foreground: "#ffffff",
        border: "#ff3c32",
      },
      secondary: {
        background: "#ffffff",
        backgroundHover: "rgba(255, 255, 255, 0.7)",
        backgroundActive: "rgba(255, 255, 255, 0.56)",
        foreground: "#082845",
        border: "rgba(17, 24, 39, 0.12)",
      },
      danger: {
        background: "#ff3c32",
        backgroundHover: "#e6352d",
        backgroundActive: "#c92d27",
        foreground: "#ffffff",
        border: "#ff3c32",
      },
    },
  },
});

export let jam2026PageStyle = css({
  display: "flex",
  minHeight: "100svh",
  flexDirection: "column",
  backgroundColor: theme.surface.lvl0,
  color: theme.colors.text.primary,
  fontFamily: theme.fontFamily.sans,
});

export let jam2026MainStyle = css({
  width: "min(100%, 72rem)",
  marginInline: "auto",
  paddingInline: "clamp(1.5rem, 4vw, 3rem)",
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
});

export let jam2026PlaceholderStyle = css({
  maxWidth: "42rem",
  paddingBlock: "clamp(4rem, 12vw, 8rem)",
});

export let jam2026HeadingStyle = css({
  margin: 0,
  color: theme.colors.text.primary,
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(2.25rem, 7vw, 4rem)",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: theme.letterSpacing.tight,
  lineHeight: theme.lineHeight.tight,
});

export let jam2026CopyStyle = css({
  marginBlock: `${theme.space.lg} 0`,
  color: theme.colors.text.secondary,
  fontFamily: theme.fontFamily.sans,
  fontSize: "1.125rem",
  lineHeight: theme.lineHeight.relaxed,
});
