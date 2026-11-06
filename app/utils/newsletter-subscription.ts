import {
  newsletterSubscriptionStatuses,
  type NewsletterSubscriptionStatus,
} from "../ui/public/newsletter-frame-form.tsx";

/**
 * Reads the `?subscription=` status that the newsletter subscribe action
 * redirects back with. Shared by every page that hosts the subscribe frame.
 */
export function getNewsletterSubscriptionStatus(
  request: Request,
): NewsletterSubscriptionStatus | null {
  let value = new URL(request.url).searchParams.get("subscription");
  return (
    newsletterSubscriptionStatuses.find((status) => status === value) ?? null
  );
}
