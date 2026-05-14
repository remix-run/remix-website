import { createTheme } from "remix/ui/theme";

export let RemixTheme = createTheme(
  {
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
      none: "0px",
      sm: "2px",
      md: "6px",
      lg: "8px",
      xl: "12px",
      full: "9999px",
    },
    fontFamily: {
      sans:
        '"Inter", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xxxs: "10px",
      xxs: "11px",
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "20px",
      xxl: "30px",
    },
    lineHeight: {
      tight: "1",
      normal: "1.5",
      relaxed: "1.6",
    },
    letterSpacing: {
      tight: "0",
      normal: "0",
      meta: "0.05em",
      wide: "0.08em",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    control: {
      height: {
        sm: "32px",
        md: "40px",
        lg: "48px",
      },
    },
    surface: {
      lvl0: "#ffffff",
      lvl1: "#f7f7f7",
      lvl2: "#e3e3e3",
      lvl3: "#c8c8c8",
      lvl4: "#121212",
    },
    shadow: {
      xs: "0 1px 1px 1px #00274f59",
      sm: "0 1px 1px 1px #00274f59, 0 2px 3px 0 #0138701a",
      md: "0 2px 4px 0 #011d3940, 0 8px 12px 0 #01387014",
      lg: "0 2px 4px 0 #011d3940, 0 8px 12px 0 #01387014, 0 12px 16px 0 #0138700a",
      xl: "0 2px 4px 0 #011d3940, 0 8px 12px 0 #01387014, 0 12px 16px 0 #0138700a, 0 16px 20px 0 #0138700a, 0 20px 24px 0 #01387005",
    },
    colors: {
      text: {
        primary: "#121212",
        secondary: "#515151",
        muted: "#a4a4a4",
        link: "#3992ff",
      },
      border: {
        subtle: "#e3e3e3",
        default: "#c8c8c8",
        strong: "#a4a4a4",
      },
      focus: {
        ring: "#3992ff",
      },
      overlay: {
        scrim: "rgb(0 0 0 / 0.7)",
      },
      action: {
        primary: {
          background: "#3992ff",
          backgroundHover: "#1b6ef5",
          backgroundActive: "#1458e1",
          foreground: "#ffffff",
          border: "#3992ff",
        },
        secondary: {
          background: "#e3e3e3",
          backgroundHover: "#c8c8c8",
          backgroundActive: "#a4a4a4",
          foreground: "#121212",
          border: "#c8c8c8",
        },
        danger: {
          background: "#f44250",
          backgroundHover: "#bd1825",
          backgroundActive: "#9d1722",
          foreground: "#ffffff",
          border: "#f44250",
        },
      },
    },
  },
  { reset: false },
);
