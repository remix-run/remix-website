import type { Handle } from "remix/ui";

import { NewsletterSubscribe } from "./newsletter-subscribe.tsx";
import type { NewsletterSubscriptionStatus } from "./public/newsletter-subscribe.tsx";

export function NewsletterSignupCta(
  handle: Handle<{
    status?: NewsletterSubscriptionStatus | null;
  }>,
) {
  return () => (
    <section
      class="rmx-newsletter-signup"
      aria-labelledby="newsletter-signup-heading"
    >
      <h2
        id="newsletter-signup-heading"
        class="rmx-page-title rmx-newsletter-signup-title mb-6"
      >
        Get updates on the latest Remix news
      </h2>
      <p class="rmx-page-body mb-6 max-w-2xl">
        Be the first to learn about new Remix features, community events, and
        tutorials.
      </p>
      <NewsletterSubscribe status={handle.props.status} />
    </section>
  );
}
