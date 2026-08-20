import { addEventListeners, clientEntry, on, ref, type Handle } from "remix/ui";

import { routes } from "../../routes.ts";

export const NEWSLETTER_SUBSCRIBE_FRAME_NAME = "newsletter-subscribe";

export type NewsletterSubscriptionStatus =
  | "success"
  | "invalid-email"
  | "invalid-tag"
  | "error";

export let NewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function NewsletterSubscribeForm(
    handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
  ) {
    let form: HTMLFormElement | null = null;
    let submitting = false;

    addEventListeners(handle.frame, handle.signal, {
      reloadComplete() {
        submitting = false;
        if (handle.props.status === "success") form?.reset();
        handle.update();
      },
    });

    return () => (
      <form
        action={routes.newsletter.subscribe.href()}
        method="post"
        rmx-src={routes.newsletter.subscribe.href()}
        rmx-target={NEWSLETTER_SUBSCRIBE_FRAME_NAME}
        class="m-0 flex flex-col gap-6 md:h-14 md:flex-row"
        mix={[
          ref((element, signal) => {
            form = element;
            element.action = handle.frames.top.src;
            signal.addEventListener("abort", () => {
              if (form === element) form = null;
            });
          }),
          on("submit", () => {
            submitting = true;
            handle.update();
          }),
        ]}
      >
        <label htmlFor={handle.id} class="sr-only">
          Email address
        </label>
        <input
          id={handle.id}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@example.com"
          class="rmx-bg-neutral-100 placeholder:text-rmx-text-tertiary box-border inline-block h-14 flex-1 appearance-none rounded-lg border-0 px-6 py-4 text-base"
          aria-invalid={
            handle.props.status === "invalid-email" ? true : undefined
          }
        />
        <button
          type="submit"
          class="rmx-bg-button-primary rmx-text-button-primary rmx-shadow-low rmx-button-text box-border inline-flex h-14 appearance-none items-center justify-center rounded-lg border border-black/10 px-6 font-semibold transition-all hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rmx-button-surface-primary)] active:scale-[0.98] active:opacity-80 md:w-auto md:whitespace-nowrap"
          disabled={submitting}
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    );
  },
);
