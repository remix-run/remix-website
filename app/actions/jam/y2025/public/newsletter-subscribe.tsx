import { clientEntry, css, type Handle } from "remix/ui";

import {
  createNewsletterFrameForm,
  type NewsletterSubscriptionStatus,
} from "../../../../ui/public/newsletter-subscribe.tsx";
import { routes } from "../../../../routes.ts";
import { newsletterTagIds } from "../../../../utils/public/newsletter-tags.ts";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

export let JamNewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function JamNewsletterSubscribeForm(
    handle: Handle<{
      status?: NewsletterSubscriptionStatus | null;
    }>,
  ) {
    let form = createNewsletterFrameForm(handle, "jam2025");

    return () => {
      let status = form.state.status;

      return (
        <form
          action={routes.newsletter.subscribe.href()}
          method="post"
          {...form.navigation}
          mix={[newsletterFormStyle, form.submit]}
        >
          <input
            type="hidden"
            name="tag"
            value={String(newsletterTagIds.jam2025Updates)}
          />
          <p mix={newsletterLabelStyle}>
            <label htmlFor="jam-newsletter-email">email</label>
          </p>
          <input
            type="email"
            id="jam-newsletter-email"
            name="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            aria-invalid={status === "invalid-email" ? true : undefined}
            aria-describedby={
              status === "idle" ? undefined : "jam-newsletter-message"
            }
            mix={newsletterInputStyle}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            mix={newsletterButtonStyle}
          >
            {status === "submitting" ? "Signing Up..." : "Sign Up"}
          </button>
          <div
            id="jam-newsletter-message"
            aria-live="polite"
            mix={
              status !== "idle" && status !== "submitting"
                ? newsletterMessageStyle
                : hiddenStyle
            }
          >
            {status === "success" ? (
              <p>
                You&apos;re good to go. Please confirm your email to be notified
                when ticket sales are available.
              </p>
            ) : status === "invalid-email" ? (
              <p mix={newsletterErrorStyle}>
                Please enter a valid email address.
              </p>
            ) : status === "invalid-tag" ? (
              <p mix={newsletterErrorStyle}>
                The selected newsletter is not available. Please try again.
              </p>
            ) : status === "error" ? (
              <p mix={newsletterErrorStyle}>
                Something went wrong. Please try again.
              </p>
            ) : null}
          </div>
        </form>
      );
    };
  },
);

let newsletterFormStyle = css({
  position: "relative",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

let newsletterLabelStyle = css({
  color: "rgb(255 255 255 / 0.5)",
  fontFamily: theme.fontFamily.mono,
  fontSize: "0.75rem",
  lineHeight: 1.333,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  [breakpointMedia.md]: { fontSize: "1rem", lineHeight: 1.5 },
});

let newsletterInputStyle = css({
  width: "100%",
  maxWidth: "384px",
  marginTop: "10px",
  border: 0,
  borderRadius: theme.radius.full,
  padding: "16px 24px",
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "1.125rem",
  lineHeight: 1.556,
  textAlign: "center",
  outline: "none",
  "&::placeholder": { color: "rgb(255 255 255 / 0.3)" },
  "&:focus": { boxShadow: `inset 0 0 0 2px ${theme.colors.brand.blue}` },
  [breakpointMedia.sm]: { lineHeight: "24px" },
});

let newsletterButtonStyle = css({
  width: "100%",
  minWidth: "fit-content",
  maxWidth: "384px",
  marginTop: "20px",
  borderRadius: theme.radius.full,
  padding: "12px 16px",
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "0.875rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.425,
  transition: "color 300ms, background-color 300ms",
  "&:disabled": { cursor: "not-allowed", opacity: 0.5 },
  [breakpointMedia.md]: {
    padding: "16px 24px",
    fontSize: "1.25rem",
    lineHeight: 1.556,
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let newsletterMessageStyle = css({
  marginTop: "16px",
  color: "#ffffff",
  fontSize: "0.875rem",
  lineHeight: 1.425,
});

let newsletterErrorStyle = css({ color: theme.colors.brand.red });
let hiddenStyle = css({ display: "none" });
