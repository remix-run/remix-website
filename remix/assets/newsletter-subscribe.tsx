import { clientEntry, type Handle } from "remix/component";
import cx from "clsx";
import assets from "./newsletter-subscribe.tsx?assets=client";
import { routes } from "../routes";

type SubscribeState = "idle" | "success" | "error";
type SubscribeResult = {
  state: SubscribeState;
  error: string | null;
  shouldReset: boolean;
};

export async function submitNewsletterRequest({
  action,
  formData,
  signal,
  fetchImpl = fetch,
}: {
  action: string;
  formData: FormData;
  signal: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<SubscribeResult> {
  let body = new URLSearchParams();
  for (let [key, value] of formData.entries()) {
    if (typeof value === "string") body.append(key, value);
  }

  try {
    let response = await fetchImpl(action, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: body.toString(),
      signal,
    });

    let payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;

    if (response.ok && payload?.ok) {
      return { state: "success", error: null, shouldReset: true };
    }

    return {
      state: "error",
      error: payload?.error ?? "Something went wrong",
      shouldReset: false,
    };
  } catch (error: unknown) {
    if (signal.aborted || isAbortError(error)) {
      return { state: "idle", error: null, shouldReset: false };
    }

    return {
      state: "error",
      error: "Something went wrong",
      shouldReset: false,
    };
  }
}

export let NewsletterSubscribeForm = clientEntry(
  `${assets.entry}#NewsletterSubscribeForm`,
  (handle: Handle) => {
    let submitting = false;
    let state: SubscribeState = "idle";
    let error: string | null = null;

    return (props: {
      class?: string;
      inputClass?: string;
      buttonClass?: string;
    }) => (
      <>
        <form
          action={routes.actions.newsletter.href()}
          method="post"
          class={cx(props.class, { "opacity-50": submitting })}
          on={{
            async submit(event, signal) {
              event.preventDefault();
              if (submitting) return;

              let form = event.currentTarget as HTMLFormElement;
              submitting = true;
              state = "idle";
              error = null;
              handle.update();

              try {
                let result = await submitNewsletterRequest({
                  action: form.action,
                  formData: new FormData(form),
                  signal,
                });
                state = result.state;
                error = result.error;
                if (result.shouldReset) {
                  form.reset();
                }
              } finally {
                submitting = false;
                handle.update();
              }
            },
          }}
        >
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@example.com"
            class={props.inputClass}
            aria-invalid={state === "error" ? true : undefined}
          />
          <button type="submit" class={props.buttonClass} disabled={submitting}>
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        <div
          aria-live="polite"
          class={
            state === "success" || state === "error" ? "block py-2" : "hidden"
          }
        >
          {state === "success" ? (
            <div>
              <b class="text-green-brand">Got it!</b> Please go{" "}
              <b class="text-red-brand">check your email</b> to confirm your
              subscription, otherwise you won&apos;t get our email.
            </div>
          ) : state === "error" ? (
            <div class="text-red-brand">{error ?? "Something went wrong"}</div>
          ) : null}
        </div>
      </>
    );
  },
);

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}
