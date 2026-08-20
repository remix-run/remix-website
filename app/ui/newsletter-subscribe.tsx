import { Frame, type Handle, type MixInput } from "remix/ui";

import { routes } from "../routes.ts";
import {
  NEWSLETTER_SUBSCRIBE_FRAME_NAME,
  type NewsletterSubscriptionStatus,
} from "./public/newsletter-subscribe.tsx";

export function NewsletterSubscribe(
  handle: Handle<{
    mix?: MixInput<HTMLElement>;
    status?: NewsletterSubscriptionStatus | null;
  }>,
) {
  return () => {
    let src = routes.newsletter.index.href();
    if (handle.props.status) {
      src += `?subscription=${handle.props.status}`;
    }

    return (
      <div mix={handle.props.mix}>
        <Frame name={NEWSLETTER_SUBSCRIBE_FRAME_NAME} src={src} />
      </div>
    );
  };
}
