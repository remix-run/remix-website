import { type Handle, type MixInput } from "remix/ui";

import { routes } from "../routes.ts";
import {
  NewsletterSubscribeFrameHost,
  type NewsletterSubscriptionStatus,
} from "./public/newsletter-subscribe.tsx";

export function NewsletterSubscribe(
  handle: Handle<{
    mix?: MixInput<HTMLElement>;
    status?: NewsletterSubscriptionStatus | null;
  }>,
) {
  return () => {
    let src = routes.newsletter.signup.href();
    if (handle.props.status) {
      src += `?subscription=${handle.props.status}`;
    }

    return <NewsletterSubscribeFrameHost src={src} mix={handle.props.mix} />;
  };
}
