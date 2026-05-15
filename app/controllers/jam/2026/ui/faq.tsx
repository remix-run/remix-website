import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { jamTheme } from "../theme.ts";

export function Jam2026Faq() {
  return () => (
    <section id="faq" aria-labelledby="faq-heading" mix={faqStyle}>
      <div mix={faqInnerStyle}>
        <h2 id="faq-heading" mix={headingStyle}>
          FAQ
        </h2>
        <div mix={faqListStyle}>
          <details mix={faqItemStyle}>
            <summary>Where will the event be hosted?</summary>
            <p>Venue details are coming soon.</p>
          </details>
          <details mix={faqItemStyle}>
            <summary>What does the schedule look like?</summary>
            <p>The launch schedule will be added here.</p>
          </details>
          <details mix={faqItemStyle}>
            <summary>When will tickets be available?</summary>
            <p>Ticket details are coming soon.</p>
          </details>
        </div>
      </div>
    </section>
  );
}

let faqStyle = css({
  paddingBlock: "clamp(4rem, 10vw, 8rem)",
  paddingInline: "clamp(1.5rem, 4vw, 4rem)",
  backgroundColor: jamTheme.skyPale,
  scrollMarginBlockStart: "48px",
});

let faqInnerStyle = css({
  width: "min(100%, 72rem)",
  marginInline: "auto",
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

let faqListStyle = css({
  marginBlockStart: theme.space.xl,
  display: "grid",
  gap: theme.space.sm,
});

let faqItemStyle = css({
  borderBlockStart: `1px solid ${jamTheme.borderSubtle}`,
  paddingBlock: theme.space.lg,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  "& summary": {
    cursor: "pointer",
    fontFamily: theme.fontFamily.mono,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: theme.letterSpacing.meta,
    lineHeight: theme.lineHeight.normal,
    textTransform: "uppercase",
  },
  "& p": {
    marginBlock: `${theme.space.md} 0`,
    color: jamTheme.inkMuted,
    fontSize: theme.fontSize.md,
    lineHeight: theme.lineHeight.relaxed,
  },
  "&:focus-within": {
    outline: `2px solid ${jamTheme.accent}`,
    outlineOffset: "4px",
  },
});
