import { clientEntry, css, type Handle } from "remix/ui";

import {
  createNewsletterFrameForm,
  type NewsletterSubscriptionStatus,
} from "../../../../ui/public/newsletter-subscribe.tsx";
import { jamTheme } from "./theme.ts";
import { routes } from "../../../../routes.ts";
import { textBoxTrim } from "../../../../ui/public/css-mixins.ts";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import { newsletterTagIds } from "../../../../utils/public/newsletter-tags.ts";

export let Jam2026NewsletterSignup = clientEntry(
  import.meta.url,
  function Jam2026NewsletterSignup(
    handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
  ) {
    let form = createNewsletterFrameForm(handle, "jam2026");

    return () => {
      let status = form.state.status;

      return (
        <section
          id="newsletter"
          aria-labelledby="newsletter-heading"
          mix={newsletterSectionStyle}
        >
          <div mix={newsletterContentStyle}>
            <h2 id="newsletter-heading" mix={newsletterHeadingStyle}>
              Get notified
            </h2>
            <p>
              Sign up for our newsletter to receive any updates, announcements,
              and speaker line up for Remix Jam 2026.
            </p>
            <form
              action={routes.newsletter.subscribe.href()}
              method="post"
              {...form.navigation}
              data-state={status}
              mix={[newsletterFormStyle, ...form.submit]}
            >
              <input
                type="hidden"
                name="tag"
                value={String(newsletterTagIds.jam2026Updates)}
              />
              <label htmlFor="jam-2026-newsletter-email" mix={labelStyle}>
                Email address
              </label>
              <input
                id="jam-2026-newsletter-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="your@email.com"
                aria-describedby={
                  status === "idle" ? undefined : "jam-2026-newsletter-message"
                }
                aria-invalid={status === "invalid-email" ? true : undefined}
                mix={newsletterInputStyle}
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                mix={newsletterButtonStyle}
              >
                {status === "submitting" ? "Signing up..." : "Sign up"}
              </button>
              <div
                id="jam-2026-newsletter-message"
                aria-live="polite"
                hidden={
                  status === "idle" || status === "submitting"
                    ? true
                    : undefined
                }
                mix={newsletterMessageStyle}
              >
                {status === "success" ? (
                  <p>
                    You&apos;re on the list. Check your email to confirm your
                    subscription.
                  </p>
                ) : status === "invalid-email" ? (
                  <p>Please enter a valid email address. Please try again.</p>
                ) : status === "invalid-tag" ? (
                  <p>
                    The selected newsletter is not available. Please try again.
                  </p>
                ) : status === "error" ? (
                  <p>Something went wrong. Please try again.</p>
                ) : null}
              </div>
            </form>
          </div>
        </section>
      );
    };
  },
);

let newsletterSectionStyle = css({
  position: "relative",
  zIndex: 1,
  paddingBlock: "36px",
  paddingInline: theme.space.lg,
  backgroundColor: jamTheme.surfaceRaised,
  color: jamTheme.ink,
});

let newsletterContentStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  width: "100%",
  marginInline: "auto",
  [breakpointMedia.md]: {
    width: "35%",
  },
  "& > p": {
    margin: 0,
    color: jamTheme.ink,
    fontFamily: theme.fontFamily.sans,
    fontSize: "16px",
    fontWeight: theme.fontWeight.normal,
    letterSpacing: "-0.01em",
    lineHeight: "1.6em",
    textAlign: "center",
    textWrap: "balance",
    ...textBoxTrim,
  },
});

let newsletterHeadingStyle = css({
  margin: 0,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.mono,
  fontSize: "16px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.48px",
  lineHeight: "normal",
  textAlign: "center",
  textTransform: "uppercase",
  ...textBoxTrim,
});

let newsletterFormStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "9px",
  width: "240px",
  maxWidth: "100%",
  minWidth: 0,
  transition: "opacity 160ms ease",
  "&[data-state='submitting']": {
    opacity: 0.72,
  },
});

let labelStyle = css({
  color: jamTheme.brandRed,
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "0.24px",
  lineHeight: "normal",
  textTransform: "uppercase",
  ...textBoxTrim,
});

let newsletterInputStyle = css({
  width: "100%",
  minHeight: 0,
  minWidth: 0,
  border: 0,
  borderRadius: "6px",
  backgroundColor: jamTheme.inkWash,
  color: jamTheme.inkMuted,
  fontFamily: theme.fontFamily.sans,
  fontSize: "16px",
  fontWeight: theme.fontWeight.normal,
  letterSpacing: "-0.01em",
  lineHeight: "1.6em",
  padding: "12px 16px",
  textAlign: "center",
  "&::placeholder": {
    color: jamTheme.textMuted,
  },
  "&:focus": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "&[aria-invalid='true']": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
});

let newsletterButtonStyle = css({
  width: "100%",
  minHeight: 0,
  border: 0,
  borderRadius: "6px",
  backgroundColor: jamTheme.accent,
  color: jamTheme.onAccent,
  cursor: "pointer",
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.33px",
  lineHeight: "normal",
  padding: "12px 16px",
  textTransform: "uppercase",
  transition: "background-color 160ms ease, transform 160ms ease",
  whiteSpace: "nowrap",
  "&:hover": {
    backgroundColor: jamTheme.accentHover,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "&:active": {
    backgroundColor: jamTheme.accentActive,
    transform: "translateY(1px)",
  },
  "&:disabled": {
    cursor: "not-allowed",
    opacity: 0.66,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "background-color 160ms ease",
    "&:active": {
      transform: "none",
    },
  },
});

let newsletterMessageStyle = css({
  maxWidth: "240px",
  minHeight: "24px",
  color: jamTheme.brandRed,
  fontSize: "12px",
  lineHeight: 1.4,
  textAlign: "center",
  "& p": {
    margin: 0,
  },
});
