import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { routes } from "../../../../routes.ts";
import { jamTheme } from "../theme.ts";

export function Jam2026Hero() {
  return () => (
    <section mix={heroStyle}>
      <div mix={heroInnerStyle}>
        <p mix={heroMetaStyle}>October 1-2, 2026 / Toronto, Ontario, Canada</p>
        <div>
          <div mix={placeholderStyle}>
            <h1 mix={headingStyle}>Remix Jam 2026</h1>
            <p mix={copyStyle}>
              The Remix team's annual conference returns to Toronto to show off
              Remix 3.
            </p>
          </div>
          <div mix={heroActionsStyle}>
            <a
              href={routes.jam.y2026.tickets.index.href()}
              mix={ticketLinkStyle}
            >
              Get tickets
            </a>
            <a href="#faq" mix={secondaryActionStyle}>
              Read FAQ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

let heroStyle = css({
  minHeight: "min(48rem, calc(100svh - 4.5rem))",
  paddingBlock: "clamp(5rem, 12vw, 10rem)",
  paddingInline: "clamp(1.5rem, 4vw, 4rem)",
  display: "grid",
  alignItems: "center",
  backgroundColor: jamTheme.sky,
  backgroundImage: `linear-gradient(180deg, ${jamTheme.sky}, ${jamTheme.skySoft})`,
});

let heroInnerStyle = css({
  width: "min(100%, 76rem)",
  marginInline: "auto",
});

let heroMetaStyle = css({
  marginBlock: `0 ${theme.space.xl}`,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: theme.fontSize.xs,
  fontWeight: theme.fontWeight.bold,
  letterSpacing: theme.letterSpacing.wide,
  lineHeight: theme.lineHeight.normal,
  textTransform: "uppercase",
});

let placeholderStyle = css({
  maxWidth: "42rem",
  paddingBlock: "clamp(4rem, 12vw, 8rem)",
});

let headingStyle = css({
  margin: 0,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(2.25rem, 7vw, 4rem)",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: theme.letterSpacing.tight,
  lineHeight: theme.lineHeight.tight,
});

let copyStyle = css({
  marginBlock: `${theme.space.lg} 0`,
  color: jamTheme.inkMuted,
  fontFamily: theme.fontFamily.sans,
  fontSize: "1.125rem",
  lineHeight: theme.lineHeight.relaxed,
});

let heroActionsStyle = css({
  marginBlockStart: theme.space.xl,
  display: "flex",
  flexWrap: "wrap",
  gap: theme.space.md,
});

let ticketLinkStyle = css({
  borderRadius: theme.radius.full,
  backgroundColor: jamTheme.accent,
  color: jamTheme.onAccent,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.bold,
  lineHeight: theme.lineHeight.tight,
  paddingBlock: theme.space.sm,
  paddingInline: theme.space.lg,
  textDecoration: "none",
  "&:hover": {
    backgroundColor: jamTheme.accentHover,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.accent}`,
    outlineOffset: "3px",
  },
  "&:active": {
    backgroundColor: jamTheme.accentActive,
  },
});

let secondaryActionStyle = css({
  border: `1px solid ${jamTheme.borderDefault}`,
  borderRadius: theme.radius.full,
  backgroundColor: jamTheme.surfaceRaised,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.semibold,
  lineHeight: theme.lineHeight.tight,
  paddingBlock: theme.space.sm,
  paddingInline: theme.space.lg,
  textDecoration: "none",
  "&:hover": {
    backgroundColor: jamTheme.surfaceRaisedHover,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.accent}`,
    outlineOffset: "3px",
  },
});
