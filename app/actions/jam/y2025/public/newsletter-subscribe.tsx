import { clientEntry, type Handle } from "remix/ui";

import {
  createNewsletterFrameForm,
  type NewsletterSubscriptionStatus,
} from "../../../../ui/public/newsletter-subscribe.tsx";
import { routes } from "../../../../routes.ts";
import { newsletterTagIds } from "../../../../utils/public/newsletter-tags.ts";

export let JamNewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function JamNewsletterSubscribeForm(
    handle: Handle<{
      class?: string;
      status?: NewsletterSubscriptionStatus | null;
    }>,
  ) {
    let form = createNewsletterFrameForm(handle, "jam2025");

    return () => {
      let status = form.state.status;

      return (
        <form
          action={routes.newsletter.subscribe.href()}
          method="post"
          {...form.navigation}
          class={
            handle.props.class ??
            "relative z-10 mt-12 flex flex-col items-center"
          }
          mix={form.submit}
        >
          <input
            type="hidden"
            name="tag"
            value={String(newsletterTagIds.jam2025Updates)}
          />
          <p class="font-mono text-xs uppercase tracking-widest text-white/50 md:text-base">
            <label htmlFor="jam-newsletter-email">email</label>
          </p>
          <input
            type="email"
            id="jam-newsletter-email"
            name="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            aria-invalid={status === "invalid-email" ? true : undefined}
            aria-describedby={
              status === "idle" ? undefined : "jam-newsletter-message"
            }
            class="mt-[10px] w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-lg text-white ring-inset placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-brand sm:leading-6"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            class="mt-5 w-full min-w-fit max-w-sm rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-4 md:text-xl"
          >
            {status === "submitting" ? "Signing Up..." : "Sign Up"}
          </button>
          <div
            id="jam-newsletter-message"
            aria-live="polite"
            class={
              status !== "idle" && status !== "submitting"
                ? "mt-4 text-sm text-white"
                : "hidden"
            }
          >
            {status === "success" ? (
              <p>
                You&apos;re good to go. Please confirm your email to be notified
                when ticket sales are available.
              </p>
            ) : status === "invalid-email" ? (
              <p class="text-red-brand">Please enter a valid email address.</p>
            ) : status === "invalid-tag" ? (
              <p class="text-red-brand">
                The selected newsletter is not available. Please try again.
              </p>
            ) : status === "error" ? (
              <p class="text-red-brand">
                Something went wrong. Please try again.
              </p>
            ) : null}
          </div>
        </form>
      );
    };
  },
);
