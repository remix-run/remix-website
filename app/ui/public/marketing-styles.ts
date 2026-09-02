import { css } from "remix/ui";

import { breakpointMedia, theme } from "./theme.ts";

export let pageTitleStyle = css({
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(30px, 4vw, 56px)",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.15,
  letterSpacing: "-0.015em",
  whiteSpace: "pre-line",
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
});

export let pageTitleSmallStyle = css({
  fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)",
});

export let pageTitleExtraSmallStyle = css({
  fontSize: "clamp(1.125rem, 2vw, 1.25rem)",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
});

export let pageBodyStyle = css({
  fontFamily: theme.fontFamily.sans,
  fontSize: "1rem",
  fontWeight: theme.fontWeight.normal,
  lineHeight: 1.4,
  letterSpacing: "-0.008px",
  "@supports (text-box-trim: trim-both)": {
    textBoxTrim: "trim-both",
    textBoxEdge: "cap alphabetic",
  },
});

export let pageBodySmallStyle = css({
  fontSize: "0.875rem",
});

export let pageMetaStyle = css({
  fontFamily: theme.fontFamily.mono,
  fontSize: "0.75rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: "normal",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
});

export let marketingPageStyle = css({
  marginBlockStart: "clamp(2.5rem, 5vw, 4rem)",
});

export let captionStyle = css({
  fontSize: "0.75rem",
  lineHeight: 1.6,
  letterSpacing: "0.01em",
});

export let bodyStyle = css({
  fontSize: "1rem",
  lineHeight: 1.6,
  letterSpacing: "0.025em",
});

export let bodyMediumStyle = css({
  fontSize: "1rem",
  lineHeight: 1.6,
  letterSpacing: "0.025em",
  [breakpointMedia.md]: {
    fontSize: "1.5rem",
    lineHeight: 1.4,
    letterSpacing: 0,
  },
});

export let bodyLargeStyle = css({
  fontSize: "1rem",
  lineHeight: 1.6,
  letterSpacing: "0.025em",
  [breakpointMedia.md]: {
    fontSize: "1.5rem",
    lineHeight: 1.4,
    letterSpacing: 0,
  },
  [breakpointMedia.xl]: {
    fontSize: "2.25rem",
    lineHeight: 1.4,
    letterSpacing: "-0.025em",
  },
});

export let bodyOnDarkStyle = css({ color: "rgb(255 255 255 / 0.8)" });

export let headingHeroStyle = css({
  fontSize: "1.5rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.4,
  [breakpointMedia.md]: {
    fontSize: "2.25rem",
    fontWeight: theme.fontWeight.semibold,
    letterSpacing: "-0.025em",
  },
});

export let headingLargeStyle = css({
  fontSize: "1.5rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.3,
  letterSpacing: "-0.025em",
  [breakpointMedia.md]: { fontSize: "2.25rem" },
});

export let headingExtraLargeStyle = css({
  fontSize: "2.25rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.4,
  letterSpacing: "-0.025em",
});

export let headingSmallStyle = css({
  fontSize: "1.5rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.4,
});

export let buttonTextStyle = css({
  fontSize: "1rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1,
  letterSpacing: "-0.025em",
});

export let buttonTextLargeStyle = css({
  fontSize: "1.25rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1,
  letterSpacing: "-0.025em",
});
