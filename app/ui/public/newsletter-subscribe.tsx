import {
  addEventListeners,
  clientEntry,
  Frame,
  on,
  ref,
  type Handle,
  type MixInput,
} from "remix/ui";

import { routes } from "../../routes.ts";

export const NEWSLETTER_SUBSCRIBE_FRAME_NAME = "newsletter-subscribe";

// TEMPORARY WORKAROUND — REMOVE AFTER REMIX PR #11699 LANDS:
// https://github.com/remix-run/remix/pull/11699
//
// The hack: Remix frame form navigation currently scrolls the document to the
// top even with `rmx-reset-scroll="false"`. While we wait for the runtime fix,
// newsletter forms opt out of Navigation API interception with `rmx-document`,
// POST with `fetch()`, and manually reload only their containing frame.
//
// How to switch: after upgrading to a Remix release containing that PR, change
// this flag to `false`. Every newsletter form will return to normal declarative
// frame navigation without changing any call sites.
const USE_MANUAL_NEWSLETTER_FRAME_RELOAD = true;

export type NewsletterSubscriptionStatus =
  | "success"
  | "invalid-email"
  | "invalid-tag"
  | "error";

export type NewsletterSubscribeFrameContext =
  | "newsletter"
  | "home"
  | "jam2025"
  | "jam2026";

export function NewsletterSubscribeFrameHost(
  handle: Handle<{ src: string; mix?: MixInput<HTMLElement> }>,
) {
  return () => (
    <div mix={handle.props.mix}>
      <Frame name={NEWSLETTER_SUBSCRIBE_FRAME_NAME} src={handle.props.src} />
    </div>
  );
}

export type NewsletterSubscribeFormStatus =
  | "idle"
  | "submitting"
  | NewsletterSubscriptionStatus;

export function createNewsletterFrameForm(
  handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
  context: NewsletterSubscribeFrameContext,
) {
  let form: HTMLFormElement | null = null;
  let submitting = false;
  let requestSrc = `${routes.newsletter.subscribe.href()}?${new URLSearchParams({ frame: context })}`;
  let navigation = USE_MANUAL_NEWSLETTER_FRAME_RELOAD
    ? ({ "rmx-document": true } as const)
    : ({
        "rmx-reset-scroll": "false",
        "rmx-src": requestSrc,
        "rmx-target": NEWSLETTER_SUBSCRIBE_FRAME_NAME,
      } as const);

  addEventListeners(handle.frame, handle.signal, {
    reloadComplete() {
      submitting = false;
      if (handle.props.status === "success") form?.reset();
      handle.update();
    },
  });

  return {
    get state(): { status: NewsletterSubscribeFormStatus } {
      return {
        status: submitting ? "submitting" : (handle.props.status ?? "idle"),
      };
    },
    submit: [
      ref<HTMLFormElement>((element, signal) => {
        form = element;
        if (!USE_MANUAL_NEWSLETTER_FRAME_RELOAD) {
          element.action = handle.frames.top.src;
        }
        signal.addEventListener("abort", () => {
          if (form === element) form = null;
        });
      }),
      on<HTMLFormElement>("submit", async (event, signal) => {
        submitting = true;
        handle.update();
        if (!USE_MANUAL_NEWSLETTER_FRAME_RELOAD) return;

        event.preventDefault();
        let status: NewsletterSubscriptionStatus = "error";
        try {
          let response = await fetch(routes.newsletter.subscribe.href(), {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(
              event.currentTarget,
              event instanceof SubmitEvent ? event.submitter : null,
            ),
            signal,
          });
          let result: unknown = await response.json();
          if (isNewsletterResponse(result)) {
            status = result.ok
              ? "success"
              : result.error === "Invalid Email"
                ? "invalid-email"
                : result.error === "Invalid Tag"
                  ? "invalid-tag"
                  : "error";
          }
        } catch {
          if (signal.aborted) return;
        }

        if (signal.aborted) return;
        let src = new URL(handle.frame.src, window.location.href);
        src.searchParams.set("subscription", status);
        handle.frame.src = src.href;
        await handle.frame.reload();
      }),
    ],
    navigation,
  };
}

function isNewsletterResponse(
  value: unknown,
): value is { ok: boolean; error: string | null } {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof value.ok === "boolean" &&
    "error" in value &&
    (value.error === null || typeof value.error === "string")
  );
}

export let NewsletterSubscribeForm = clientEntry(
  import.meta.url,
  function NewsletterSubscribeForm(
    handle: Handle<{ status?: NewsletterSubscriptionStatus | null }>,
  ) {
    let form = createNewsletterFrameForm(handle, "newsletter");

    return () => (
      <form
        action={routes.newsletter.subscribe.href()}
        method="post"
        {...form.navigation}
        class="m-0 flex flex-col gap-6 md:h-14 md:flex-row"
        mix={form.submit}
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
          disabled={form.state.status === "submitting"}
        >
          {form.state.status === "submitting" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    );
  },
);
