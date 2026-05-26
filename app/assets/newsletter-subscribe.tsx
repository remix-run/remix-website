import { clientEntry, on, type Handle } from "remix/ui";
import { cx } from "../utils/cx.ts";
import { routes } from "../routes.ts";
import {
  submitNewsletterRequest,
  type SubscribeState,
} from "./newsletter-request.ts";

export let NewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function NewsletterSubscribeForm(
    handle: Handle<{
      class?: string;
      inputClass?: string;
      buttonClass?: string;
    }>,
  ) {
    let state: SubscribeState = { status: "idle" };

    return () => (
      <>
        <form
          action={routes.actions.newsletter.href()}
          method="post"
          class={cx(handle.props.class, {
            "opacity-50": state.status === "submitting",
          })}
          mix={[
            on("submit", async (event, signal) => {
              event.preventDefault();
              if (state.status === "submitting") return;

              let form = event.currentTarget;
              state = { status: "submitting" };
              handle.update();

              try {
                let result = await submitNewsletterRequest({
                  action: form.action,
                  formData: new FormData(form),
                  signal,
                });
                if (signal.aborted) return;
                state = result;
                if (result.status === "success" && result.shouldReset) {
                  form.reset();
                }
              } finally {
                if (state.status === "submitting") {
                  state = { status: "idle" };
                }
                handle.update();
              }
            }),
          ]}
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
            aria-invalid={state.status === "error" ? true : undefined}
          />
          <button
            type="submit"
            class={handle.props.buttonClass}
            disabled={state.status === "submitting"}
          >
            {state.status === "submitting" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        <div
          aria-live="polite"
          class={
            state.status === "success" || state.status === "error"
              ? "block py-2"
              : "hidden"
          }
        >
          {state.status === "success" ? (
            <div>
              <b class="text-green-brand">Got it!</b> Please go{" "}
              <b class="text-red-brand">check your email</b> to confirm your
              subscription, otherwise you won&apos;t get our email.
            </div>
          ) : state.status === "error" ? (
            <div class="text-red-brand">{state.message}</div>
          ) : null}
        </div>
      </>
    );
  },
);
