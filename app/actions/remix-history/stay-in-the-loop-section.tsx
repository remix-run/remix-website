import { css } from "remix/ui";

import { NewsletterSubscribe } from "../../ui/newsletter-subscribe.tsx";
import {
  bodyStyle,
  buttonTextStyle,
  headingExtraLargeStyle,
  headingSmallStyle,
} from "../../ui/public/marketing-styles.ts";
import { breakpointMedia, theme } from "../../ui/public/theme.ts";

export function StayInTheLoopSection() {
  return () => (
    <section mix={staySectionStyle}>
      <h2 mix={[headingExtraLargeStyle, stayHeadingStyle]}>Stay in the loop</h2>

      <div mix={cardGridStyle}>
        <NewsletterCard />
        <DiscordCard />
      </div>
    </section>
  );
}

function NewsletterCard() {
  return () => (
    <div mix={[cardStyle, newsletterCardStyle]}>
      <div mix={cardContentStyle}>
        <h3 mix={[headingSmallStyle, cardHeadingStyle]}>Remix Newsletter</h3>
        <p mix={[bodyStyle, cardBodyStyle]}>
          Once a month, we write about everything in the world of Remix. Sign up
          to keep up with what comes next. No spam. Unsubscribe anytime.
        </p>
      </div>
      <NewsletterSubscribe />
    </div>
  );
}

function DiscordCard() {
  return () => (
    <div mix={[cardStyle, discordCardStyle]}>
      <div mix={cardContentStyle}>
        <h3 mix={[headingSmallStyle, cardHeadingStyle]}>Remix Community</h3>
        <p mix={[bodyStyle, cardBodyStyle]}>
          Discuss, get help, or ask questions regarding Remix or React Router.
        </p>
      </div>
      <div>
        <a
          href="https://remix.run/discord"
          mix={[buttonTextStyle, discordButtonStyle]}
        >
          Join Discord
        </a>
      </div>
    </div>
  );
}

let staySectionStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "48px",
  padding: "96px 48px",
});

let stayHeadingStyle = css({
  color: "var(--rmx-text-primary)",
  textAlign: "center",
});

let cardGridStyle = css({
  display: "flex",
  width: "100%",
  maxWidth: "1032px",
  flexDirection: "column",
  gap: "32px",
  [breakpointMedia.lg]: {
    flexDirection: "row",
    alignItems: "stretch",
  },
});

let cardStyle = css({
  display: "flex",
  flexDirection: "column",
  borderRadius: "16px",
  padding: "32px",
  background: theme.surface.lvl4,
  boxShadow: theme.shadow.mid,
});

let newsletterCardStyle = css({ flex: "2" });
let discordCardStyle = css({ flex: "1" });

let cardContentStyle = css({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: "32px",
  paddingBottom: "32px",
});

let cardHeadingStyle = css({ color: "var(--rmx-text-secondary)" });
let cardBodyStyle = css({ color: "var(--rmx-text-primary)" });

let discordButtonStyle = css({
  display: "inline-flex",
  width: "100%",
  height: "56px",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgb(0 0 0 / 0.1)",
  borderRadius: "8px",
  paddingInline: "24px",
  background: theme.colors.action.secondary,
  color: theme.colors.action.secondaryLabel,
  boxShadow: theme.shadow.low,
  textDecoration: "none",
  transition: "all 150ms ease",
  "&:hover": { opacity: 0.9 },
  "&:active": { filter: "brightness(0.95)", transform: "scale(0.98)" },
  "&:focus-visible": {
    outline: `2px solid ${theme.colors.action.primary}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    "&:active": { transform: "none" },
  },
});
