import { on } from "remix/ui";

export type SubscribeState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; shouldReset: true }
  | { status: "error"; message: string };

/**
 * Owns the submit lifecycle shared by every newsletter form: optimistic
 * `submitting` state, the request, abort handling, reset-on-success, and the
 * `handle.update()` plumbing. Components keep their own markup, styling, and
 * copy; they read `form.state` in render and spread `form.submit` into `mix`.
 */
export function createNewsletterForm(handle: { update(): void }) {
  let state: SubscribeState = { status: "idle" };

  let submit = on<HTMLFormElement>("submit", async (event, signal) => {
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
  });

  return {
    get state() {
      return state;
    },
    submit,
  };
}

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
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      return { status: "idle" };
    }

    return {
      status: "error",
      message: "Something went wrong",
    };
  }
}
