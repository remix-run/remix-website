import { css, type Handle } from "remix/ui";

import { NewsletterSubscribe } from "./newsletter-subscribe.tsx";
import { pageBodyStyle, pageTitleStyle } from "./public/marketing-styles.ts";
import type { NewsletterSubscriptionStatus } from "./public/newsletter-subscribe.tsx";

export function NewsletterSignupCta(
  handle: Handle<{
    status?: NewsletterSubscriptionStatus | null;
  }>,
) {
  return () => (
    <section mix={signupStyle} aria-labelledby="newsletter-signup-heading">
      <h2
        id="newsletter-signup-heading"
        mix={[pageTitleStyle, signupTitleStyle]}
      >
        Get updates on the latest Remix news
      </h2>
      <p mix={[pageBodyStyle, signupBodyStyle]}>
        Be the first to learn about new Remix features, community events, and
        tutorials.
      </p>
      <NewsletterSubscribe status={handle.props.status} />
    </section>
  );
}

let signupStyle = css({
  width: "max-content",
  maxWidth: "100%",
  marginInline: "auto",
});

let signupTitleStyle = css({
  maxWidth: "672px",
  marginBottom: "24px",
  fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
  letterSpacing: "-0.02em",
  textWrap: "balance",
});

let signupBodyStyle = css({ maxWidth: "672px", marginBottom: "24px" });
