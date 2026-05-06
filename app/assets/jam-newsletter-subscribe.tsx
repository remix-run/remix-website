import { clientEntry, on, type Handle } from "remix/ui";
import { routes } from "../routes.ts";
import {
  submitNewsletterRequest,
  type SubscribeState,
} from "./newsletter-subscribe.tsx";

export let JamNewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function JamNewsletterSubscribeForm(handle: Handle) {
    let state: SubscribeState = { status: "idle" };

    return (props: { class?: string }) => (
      <form
        action={routes.actions.newsletter.href()}
        method="post"
        class={props.class}
        mix={[
          on("submit", async (event, signal) => {
            event.preventDefault();
            if (state.status === "submitting") return;

            let form = event.currentTarget as HTMLFormElement;
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
        <input type="hidden" name="tag" value="6280341" />
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
          aria-invalid={state.status === "error" ? true : undefined}
          class="mt-[10px] w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-lg text-white ring-inset placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-brand sm:leading-6"
        />
        <button
          type="submit"
          disabled={state.status === "submitting"}
          class="mt-5 w-full min-w-fit max-w-sm rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 md:px-6 md:py-4 md:text-xl"
        >
          {state.status === "submitting" ? "Signing Up..." : "Sign Up"}
        </button>
        <div
          aria-live="polite"
          class={
            state.status === "success" || state.status === "error"
              ? "mt-4 text-sm text-white"
              : "hidden"
          }
        >
          {state.status === "success" ? (
            <p>
              You&apos;re good to go. Please confirm your email to be notified
              when ticket sales are available.
            </p>
          ) : state.status === "error" ? (
            <p class="text-red-brand">{state.message} Please try again.</p>
          ) : null}
        </div>
      </form>
    );
  },
);
