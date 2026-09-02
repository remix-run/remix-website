import { css, type Handle } from "remix/ui";

import {
  NewsletterSubscribeForm,
  type NewsletterSubscriptionStatus,
} from "../../ui/public/newsletter-subscribe.tsx";
import { theme } from "../../ui/public/theme.ts";

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
        mix={
          handle.props.status === "success"
            ? subscriptionNoticeStyle
            : [subscriptionNoticeStyle, subscriptionErrorStyle]
        }
      >
        {handle.props.status === "success" ? (
          <div>
            <b mix={subscriptionSuccessStyle}>Got it!</b> Please go{" "}
            <b mix={subscriptionErrorStyle}>check your email</b> to confirm your
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

let subscriptionNoticeStyle = css({ paddingBlock: "8px" });
let subscriptionSuccessStyle = css({ color: theme.colors.brand.green });
let subscriptionErrorStyle = css({ color: theme.colors.brand.red });
