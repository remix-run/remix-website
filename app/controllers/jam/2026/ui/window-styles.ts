import { css } from "remix/ui";
import { theme } from "../../../../ui/theme.ts";
import { jamTheme } from "../theme.ts";

export let jam2026WindowSurfaceStyle = css({
  borderRadius: "0.5rem",
  background: "light-dark(rgb(255 255 255 / 0.9), rgb(10 29 39 / 0.82))",
  boxShadow:
    "0 1px 2px light-dark(rgb(8 40 69 / 0.06), rgb(0 0 0 / 0.2)), 0 3px 6px light-dark(rgb(8 40 69 / 0.05), rgb(0 0 0 / 0.22)), 0 10px 18px light-dark(rgb(8 40 69 / 0.05), rgb(0 0 0 / 0.24)), 0 24px 48px light-dark(rgb(8 40 69 / 0.07), rgb(0 0 0 / 0.3))",
  color: jamTheme.ink,
  padding: "0.5rem",
});

export let jam2026WindowTitleStyle = css({
  minWidth: 0,
  margin: 0,
  overflow: "hidden",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "0.625rem",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.02em",
  lineHeight: 1.2,
  textOverflow: "ellipsis",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
});

export let jam2026WindowBodyStyle = css({
  minWidth: 0,
  borderRadius: "0.25rem",
  background: "light-dark(rgb(0 0 0 / 0.05), rgb(0 0 0 / 0.15))",
  padding: "1rem",
});
