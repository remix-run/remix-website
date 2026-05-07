import { clientEntry, on, type Handle } from "remix/ui";
import cx from "clsx";
import { routes } from "../routes.ts";

export type SubscribeState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; shouldReset: true }
  | { status: "error"; message: string };

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
}): Promise<SubscribeState> {
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
      return { status: "success", shouldReset: true };
    }

    return {
      status: "error",
      message: payload?.error ?? "Something went wrong",
    };
  } catch (error: unknown) {
    if (signal.aborted || isAbortError(error)) {
      return { status: "idle" };
    }

    return {
      status: "error",
      message: "Something went wrong",
    };
  }
}

export let NewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function NewsletterSubscribeForm(handle: Handle) {
    let state: SubscribeState = { status: "idle" };

    return (props: {
      class?: string;
      inputClass?: string;
      buttonClass?: string;
    }) => (
      <>
        <form
          action={routes.actions.newsletter.href()}
          method="post"
          class={cx(props.class, {
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
            class={props.inputClass}
            aria-invalid={state.status === "error" ? true : undefined}
          />
          <button
            type="submit"
            class={props.buttonClass}
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

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}
