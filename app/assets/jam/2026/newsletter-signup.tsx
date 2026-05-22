import { clientEntry, css, on, type Handle } from "remix/ui";
import { theme } from "remix/ui/theme";

import {
  submitNewsletterRequest,
  type SubscribeState,
} from "../../newsletter-request.ts";
import { jamTheme } from "../../../controllers/jam/2026/theme.ts";
import { routes } from "../../../routes.ts";

const REMIX_JAM_UPDATES_TAG_ID = "19736081";

export let Jam2026NewsletterSignup = clientEntry(
  import.meta.url,
  function Jam2026NewsletterSignup(handle: Handle) {
    let state: SubscribeState = { status: "idle" };

    return () => (
      <section
        id="newsletter"
        aria-labelledby="newsletter-heading"
        mix={newsletterSectionStyle}
      >
        <div mix={newsletterContentStyle}>
          <h2 id="newsletter-heading" mix={newsletterHeadingStyle}>
            Sign up for our newsletter for the latest Remix Jam news and updates
          </h2>
          <form
            action={routes.actions.newsletter.href()}
            method="post"
            data-state={state.status}
            mix={[
              newsletterFormStyle,
              on("submit", async (event, signal) => {
                event.preventDefault();
                if (state.status === "submitting") return;

                let form = event.currentTarget as HTMLFormElement;
                state = { status: "submitting" };
                handle.update();

                try {
                  let result = await submitNewsletterRequest({
                    action: form.action,
                    formData: new FormData(form),
                    signal,
                  });
                  if (signal.aborted) return;
                  state = result;
                  if (result.status === "success" && result.shouldReset) {
                    form.reset();
                  }
                } finally {
                  if (state.status === "submitting") {
                    state = { status: "idle" };
                  }
                  handle.update();
                }
              }),
            ]}
          >
            <input type="hidden" name="tag" value={REMIX_JAM_UPDATES_TAG_ID} />
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
                state.status === "idle"
                  ? undefined
                  : "jam-2026-newsletter-message"
              }
              aria-invalid={state.status === "error" ? true : undefined}
              mix={newsletterInputStyle}
            />
            <button
              type="submit"
              disabled={state.status === "submitting"}
              mix={newsletterButtonStyle}
            >
              {state.status === "submitting" ? "Signing up..." : "Sign up"}
            </button>
            <div
              id="jam-2026-newsletter-message"
              aria-live="polite"
              hidden={
                state.status !== "success" && state.status !== "error"
                  ? true
                  : undefined
              }
              mix={newsletterMessageStyle}
            >
              {state.status === "success" ? (
                <p>
                  You&apos;re on the list. Check your email to confirm your
                  subscription.
                </p>
              ) : state.status === "error" ? (
                <p>{state.message} Please try again.</p>
              ) : null}
            </div>
          </form>
        </div>
      </section>
    );
  },
);

let newsletterSectionStyle = css({
  position: "relative",
  zIndex: 1,
  paddingBlock: "clamp(64px, 9vw, 120px) 48px",
  paddingInline: theme.space.lg,
  backgroundColor: jamTheme.surfaceRaised,
  color: jamTheme.ink,
});

let newsletterContentStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "40px",
  maxWidth: "640px",
  marginInline: "auto",
});

let newsletterHeadingStyle = css({
  margin: 0,
  maxWidth: "620px",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(28px, 4.2vw, 40px)",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: 1.12,
  textAlign: "center",
});

let newsletterFormStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "14px",
  width: "100%",
  minWidth: 0,
  transition: "opacity 160ms ease",
  "&[data-state='submitting']": {
    opacity: 0.72,
  },
});

let labelStyle = css({
  color: jamTheme.brandRed,
  fontFamily: theme.fontFamily.mono,
  fontSize: "0.78rem",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: 0,
  lineHeight: 1,
  textTransform: "uppercase",
});

let newsletterInputStyle = css({
  width: "100%",
  maxWidth: "420px",
  minHeight: "56px",
  minWidth: 0,
  border: 0,
  borderRadius: "8px",
  backgroundColor: jamTheme.surface,
  color: jamTheme.ink,
  font: "inherit",
  fontSize: "1rem",
  lineHeight: 1.2,
  padding: "0 18px",
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
  maxWidth: "420px",
  minHeight: "56px",
  border: 0,
  borderRadius: "8px",
  backgroundColor: jamTheme.accent,
  color: jamTheme.onAccent,
  cursor: "pointer",
  fontFamily: theme.fontFamily.sans,
  fontSize: "1rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1,
  paddingInline: "24px",
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
  maxWidth: "420px",
  minHeight: "24px",
  color: jamTheme.brandRed,
  fontSize: "0.95rem",
  lineHeight: 1.4,
  textAlign: "center",
  "& p": {
    margin: 0,
  },
});
