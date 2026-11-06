import { type Handle, type MixInput } from "remix/component";

import { routes } from "../routes.ts";
import {
  NewsletterSubscribeFrameHost,
  type NewsletterSubscriptionStatus,
} from "./public/newsletter-frame-form.tsx";

export function NewsletterFrame(
  handle: Handle<{
    mix?: MixInput<HTMLElement>;
    status?: NewsletterSubscriptionStatus | null;
  }>,
) {
  return () => {
    let src = routes.newsletter.subscribeForm.href();
    if (handle.props.status) {
      src += `?subscription=${handle.props.status}`;
    }

    return <NewsletterSubscribeFrameHost src={src} mix={handle.props.mix} />;
  };
}
