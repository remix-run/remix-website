import { css } from "remix/ui";
import { theme } from "remix/ui/theme";

let jam = {
  ink: "var(--jam-2026-ink)",
  inkMuted: "var(--jam-2026-ink-muted)",
  accent: "var(--jam-2026-accent)",
  accentHover: "var(--jam-2026-accent-hover)",
  accentActive: "var(--jam-2026-accent-active)",
  borderSubtle: "var(--jam-2026-border-subtle)",
  borderDefault: "var(--jam-2026-border-default)",
  surface: "var(--jam-2026-surface)",
  surfaceRaised: "var(--jam-2026-surface-raised)",
  sky: "var(--jam-2026-sky)",
  skySoft: "var(--jam-2026-sky-soft)",
  skyPale: "var(--jam-2026-sky-pale)",
};

export let jam2026PageStyle = css({
  "--jam-2026-ink": "#082845",
  "--jam-2026-ink-rgb": "8 40 69",
  "--jam-2026-ink-muted": "rgb(var(--jam-2026-ink-rgb) / 0.62)",
  "--jam-2026-accent": "#ff3c32",
  "--jam-2026-accent-hover": "#e6352d",
  "--jam-2026-accent-active": "#c92d27",
  "--jam-2026-border-subtle": "rgb(var(--jam-2026-ink-rgb) / 0.12)",
  "--jam-2026-border-default": "rgb(var(--jam-2026-ink-rgb) / 0.22)",
  "--jam-2026-surface": "#f7f4ea",
  "--jam-2026-surface-raised": "#ffffff",
  "--jam-2026-sky": "#9fc5f5",
  "--jam-2026-sky-soft": "#ecf7ff",
  "--jam-2026-sky-pale": "#eaf6ff",
  display: "flex",
  minHeight: "100svh",
  flexDirection: "column",
  backgroundColor: jam.surface,
  color: jam.ink,
  fontFamily: theme.fontFamily.sans,
});

export let jam2026MainStyle = css({
  width: "100%",
  marginInline: "auto",
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
  color: jam.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(2.25rem, 7vw, 4rem)",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: theme.letterSpacing.tight,
  lineHeight: theme.lineHeight.tight,
});

export let jam2026CopyStyle = css({
  marginBlock: `${theme.space.lg} 0`,
  color: jam.inkMuted,
  fontFamily: theme.fontFamily.sans,
  fontSize: "1.125rem",
  lineHeight: theme.lineHeight.relaxed,
});

export let jam2026HeaderStyle = css({
  position: "sticky",
  top: 0,
  zIndex: 10,
  borderBlockEnd: `1px solid ${jam.borderSubtle}`,
  backgroundColor: "rgba(255, 255, 255, 0.76)",
  backdropFilter: "blur(18px)",
});

export let jam2026HeaderInnerStyle = css({
  width: "min(100%, 88rem)",
  marginInline: "auto",
  paddingBlock: theme.space.md,
  paddingInline: "clamp(1rem, 3vw, 2rem)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.space.lg,
});

export let jam2026BrandStyle = css({
  color: jam.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.bold,
  lineHeight: theme.lineHeight.tight,
  textDecoration: "none",
  textTransform: "uppercase",
});

export let jam2026NavStyle = css({
  display: "flex",
  alignItems: "center",
  gap: theme.space.sm,
});

export let jam2026NavLinkStyle = css({
  borderRadius: theme.radius.full,
  color: jam.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.semibold,
  lineHeight: theme.lineHeight.tight,
  paddingBlock: theme.space.sm,
  paddingInline: theme.space.md,
  textDecoration: "none",
  ":hover": {
    backgroundColor: "rgb(var(--jam-2026-ink-rgb) / 0.06)",
  },
  ":focus-visible": {
    outline: `2px solid ${jam.accent}`,
    outlineOffset: "3px",
  },
});

export let jam2026TicketLinkStyle = css({
  borderRadius: theme.radius.full,
  backgroundColor: jam.accent,
  color: "#ffffff",
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.bold,
  lineHeight: theme.lineHeight.tight,
  paddingBlock: theme.space.sm,
  paddingInline: theme.space.lg,
  textDecoration: "none",
  ":hover": {
    backgroundColor: jam.accentHover,
  },
  ":focus-visible": {
    outline: `2px solid ${jam.accent}`,
    outlineOffset: "3px",
  },
  ":active": {
    backgroundColor: jam.accentActive,
  },
});

export let jam2026HeroStyle = css({
  minHeight: "min(48rem, calc(100svh - 4.5rem))",
  paddingBlock: "clamp(5rem, 12vw, 10rem)",
  paddingInline: "clamp(1.5rem, 4vw, 4rem)",
  display: "grid",
  alignItems: "center",
  backgroundColor: jam.sky,
  backgroundImage: `linear-gradient(180deg, ${jam.sky}, ${jam.skySoft})`,
});

export let jam2026HeroInnerStyle = css({
  width: "min(100%, 76rem)",
  marginInline: "auto",
});

export let jam2026HeroMetaStyle = css({
  marginBlock: `0 ${theme.space.xl}`,
  color: jam.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: theme.fontSize.xs,
  fontWeight: theme.fontWeight.bold,
  letterSpacing: theme.letterSpacing.wide,
  lineHeight: theme.lineHeight.normal,
  textTransform: "uppercase",
});

export let jam2026HeroActionsStyle = css({
  marginBlockStart: theme.space.xl,
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space.md,
});

export let jam2026SecondaryActionStyle = css({
  border: `1px solid ${jam.borderDefault}`,
  borderRadius: theme.radius.full,
  backgroundColor: jam.surfaceRaised,
  color: jam.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.semibold,
  lineHeight: theme.lineHeight.tight,
  paddingBlock: theme.space.sm,
  paddingInline: theme.space.lg,
  textDecoration: "none",
  ":hover": {
    backgroundColor: "rgb(255 255 255 / 0.7)",
  },
  ":focus-visible": {
    outline: `2px solid ${jam.accent}`,
    outlineOffset: "3px",
  },
});

export let jam2026FaqStyle = css({
  paddingBlock: "clamp(4rem, 10vw, 8rem)",
  paddingInline: "clamp(1.5rem, 4vw, 4rem)",
  backgroundColor: jam.skyPale,
});

export let jam2026FaqInnerStyle = css({
  width: "min(100%, 72rem)",
  marginInline: "auto",
});

export let jam2026FaqListStyle = css({
  marginBlockStart: theme.space.xl,
  display: "grid",
  gap: theme.space.sm,
});

export let jam2026FaqItemStyle = css({
  borderBlockStart: `1px solid ${jam.borderSubtle}`,
  paddingBlock: theme.space.lg,
  color: jam.ink,
  fontFamily: theme.fontFamily.sans,
  summary: {
    cursor: "pointer",
    fontFamily: theme.fontFamily.mono,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: theme.letterSpacing.meta,
    lineHeight: theme.lineHeight.normal,
    textTransform: "uppercase",
  },
  p: {
    marginBlock: `${theme.space.md} 0`,
    color: jam.inkMuted,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.relaxed,
  },
  ":focus-within": {
    outline: `2px solid ${jam.accent}`,
    outlineOffset: "4px",
  },
});
