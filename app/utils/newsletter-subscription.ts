import type { NewsletterSubscriptionStatus } from "../ui/public/newsletter-frame-form.tsx";

let subscriptionStatuses: readonly NewsletterSubscriptionStatus[] = [
  "success",
  "invalid-email",
  "invalid-tag",
  "error",
];

/**
 * Reads the `?subscription=` status that the newsletter subscribe action
 * redirects back with. Shared by every page that hosts the subscribe frame.
 */
export function getNewsletterSubscriptionStatus(
  request: Request,
): NewsletterSubscriptionStatus | null {
  let value = new URL(request.url).searchParams.get("subscription");
  return subscriptionStatuses.find((status) => status === value) ?? null;
}
