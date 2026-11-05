import { clientEntry, css, type Handle } from "remix/component";
import {
  createNewsletterFrameForm,
  type NewsletterSubscriptionStatus,
} from "../../../../ui/public/newsletter-frame-form.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/styles/theme.ts";
import { routes } from "../../../../routes.ts";
import { colors } from "../tokens.ts";

export const LandingNewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function LandingNewsletterSubscribeForm(
    handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
  ) {
    let form = createNewsletterFrameForm(handle, "home");

    return () => {
      let status = form.state.status;

      return (
        <>
          <form
            action={routes.newsletter.subscribe.href()}
            method="post"
            {...form.navigation}
            mix={[
              css({
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "32px",
              }),
              ...form.submit,
            ]}
          >
            <label
              for="landing-newsletter-email"
              mix={[
                css({
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  padding: "0",
                  margin: "-1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  border: "0",
                }),
              ]}
            >
              Email address
            </label>
            <input
              id="landing-newsletter-email"
              type="email"
              name="email"
              required
              autocomplete="email"
              placeholder="name@example.com"
              aria-invalid={status === "invalid-email" ? true : undefined}
              aria-describedby={
                status === "idle" ? undefined : "landing-newsletter-message"
              }
              mix={[
                css({
                  flex: "1 1 220px",
                  minWidth: "0",
                  boxSizing: "border-box",
                  appearance: "none",
                  borderRadius: "999px",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  background: "transparent",
                  color: colors.fgStrong,
                  height: "44px",
                  padding: "0 18px",
                  fontFamily: theme.fontFamily.sans,
                  fontSize: "16px",
                  lineHeight: "1.4",
                  letterSpacing: "-0.008px",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                }),
              ]}
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              mix={[
                css({
                  flexShrink: "0",
                  borderRadius: "999px",
                  border: "none",
                  boxShadow: "none",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: colors.fgStrong,
                  height: "44px",
                  padding: "0 18px",
                  fontFamily: theme.fontFamily.sans,
                  fontWeight: theme.fontWeight.normal,
                  fontSize: "16px",
                  lineHeight: "1.4",
                  letterSpacing: "-0.008px",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 150ms ease, color 150ms ease",
                  [breakpointMedia.sm]: {
                    width: "auto",
                  },
                  "&:hover": {
                    background: `color-mix(in srgb, var(--brand-cycle, ${colors.accent}) 18%, rgba(255, 255, 255, 0.08))`,
                  },
                  "&:disabled": {
                    cursor: "not-allowed",
                    opacity: "0.55",
                  },
                }),
              ]}
            >
              {status === "submitting" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          <div
            id="landing-newsletter-message"
            aria-live="polite"
            mix={[
              css({
                marginTop: "12px",
                fontFamily: theme.fontFamily.sans,
                fontSize: "14px",
                lineHeight: "1.45",
                letterSpacing: "-0.008px",
                color: "rgba(255, 255, 255, 0.76)",
              }),
              status === "success"
                ? css({
                    display: "block",
                    color: "#7ce95a",
                  })
                : status !== "idle" && status !== "submitting"
                  ? css({
                      display: "block",
                      color: "#ff6b6b",
                    })
                  : css({
                      display: "none",
                    }),
            ]}
          >
            {status === "success"
              ? "Got it! Please check your email to confirm your subscription."
              : status === "invalid-email"
                ? "Please enter a valid email address."
                : status === "invalid-tag"
                  ? "The selected newsletter is not available."
                  : status === "error"
                    ? "Something went wrong. Please try again."
                    : null}
          </div>
        </>
      );
    };
  },
);
