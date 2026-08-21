import type { Handle } from "remix/ui";

import {
  NewsletterSubscribeForm,
  type NewsletterSubscriptionStatus,
} from "../../ui/public/newsletter-subscribe.tsx";

export function NewsletterSubscribeFrame(
  handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
) {
  return () => (
    <>
      <NewsletterSubscribeForm status={handle.props.status} />
      <NewsletterSubscriptionNotice status={handle.props.status} />
    </>
  );
}

function NewsletterSubscriptionNotice(
  handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
) {
  return () => {
    if (!handle.props.status) return null;

    return (
      <div
        role={handle.props.status === "success" ? "status" : "alert"}
        class={
          handle.props.status === "success" ? "py-2" : "py-2 text-red-brand"
        }
      >
        {handle.props.status === "success" ? (
          <div>
            <b class="text-green-brand">Got it!</b> Please go{" "}
            <b class="text-red-brand">check your email</b> to confirm your
            subscription, otherwise you won&apos;t get our email.
          </div>
        ) : handle.props.status === "invalid-email" ? (
          "Please enter a valid email address."
        ) : handle.props.status === "invalid-tag" ? (
          "The selected newsletter is not available."
        ) : (
          "Something went wrong. Please try again."
        )}
      </div>
    );
  };
}
