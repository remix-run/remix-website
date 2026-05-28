import { clientEntry, type Handle } from "remix/ui";
import { cx } from "../utils/cx.ts";
import { routes } from "../routes.ts";
import { createNewsletterForm } from "./newsletter-request.ts";

export let NewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function NewsletterSubscribeForm(
    handle: Handle<{
      class?: string;
      inputClass?: string;
      buttonClass?: string;
    }>,
  ) {
    let form = createNewsletterForm(handle);

    return () => (
      <>
        <form
          action={routes.actions.newsletter.href()}
          method="post"
          class={cx(handle.props.class, {
            "opacity-50": form.state.status === "submitting",
          })}
          mix={[form.submit]}
        >
          <label htmlFor="newsletter-email" class="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@example.com"
            class={handle.props.inputClass}
            aria-invalid={form.state.status === "error" ? true : undefined}
          />
          <button
            type="submit"
            class={handle.props.buttonClass}
            disabled={form.state.status === "submitting"}
          >
            {form.state.status === "submitting"
              ? "Subscribing..."
              : "Subscribe"}
          </button>
        </form>
        <div
          aria-live="polite"
          class={
            form.state.status === "success" || form.state.status === "error"
              ? "block py-2"
              : "hidden"
          }
        >
          {form.state.status === "success" ? (
            <div>
              <b class="text-green-brand">Got it!</b> Please go{" "}
              <b class="text-red-brand">check your email</b> to confirm your
              subscription, otherwise you won&apos;t get our email.
            </div>
          ) : form.state.status === "error" ? (
            <div class="text-red-brand">{form.state.message}</div>
          ) : null}
        </div>
      </>
    );
  },
);
