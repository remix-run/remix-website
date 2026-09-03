import {
  clientEntry,
  css,
  Frame,
  on,
  ref,
  type Handle,
  type MixInput,
} from "remix/ui";

import { routes } from "../../routes.ts";
import { visuallyHiddenStyle } from "./css-mixins.ts";
import { breakpointMedia, theme } from "./theme.ts";

export const NEWSLETTER_SUBSCRIBE_FRAME_NAME = "newsletter-subscribe";

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
    <div
      mix={
        handle.props.mix
          ? [newsletterFrameHostStyle, handle.props.mix]
          : newsletterFrameHostStyle
      }
    >
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
  let navigation = {
    "data-rmx-reset-scroll": "false",
    "data-rmx-src": requestSrc,
    "data-rmx-target": NEWSLETTER_SUBSCRIBE_FRAME_NAME,
  } as const;

  handle.frame.addEventListener(
    "reloadComplete",
    () => {
      submitting = false;
      if (handle.props.status === "success") form?.reset();
      handle.update();
    },
    { signal: handle.signal },
  );

  return {
    get state(): { status: NewsletterSubscribeFormStatus } {
      return {
        status: submitting ? "submitting" : (handle.props.status ?? "idle"),
      };
    },
    submit: [
      ref<HTMLFormElement>((element, signal) => {
        form = element;
        element.action = handle.frames.top.src;
        signal.addEventListener("abort", () => {
          if (form === element) form = null;
        });
      }),
      on<HTMLFormElement>("submit", () => {
        submitting = true;
        handle.update();
      }),
    ],
    navigation,
  };
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
        mix={[
          css({
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            margin: 0,
            [breakpointMedia.md]: { height: "56px", flexDirection: "row" },
            "@container (max-width: 383px)": {
              height: "auto",
              flexDirection: "column",
            },
          }),
          ...form.submit,
        ]}
      >
        <label htmlFor={handle.id} mix={visuallyHiddenStyle}>
          Email address
        </label>
        <input
          id={handle.id}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@example.com"
          mix={css({
            boxSizing: "border-box",
            display: "inline-block",
            height: "56px",
            flex: 1,
            appearance: "none",
            border: 0,
            borderRadius: "8px",
            backgroundColor: theme.surface.neutral100,
            padding: "16px 24px",
            fontSize: "1rem",
            "&::placeholder": { color: theme.colors.text.tertiary },
          })}
          aria-invalid={
            handle.props.status === "invalid-email" ? true : undefined
          }
        />
        <button
          type="submit"
          mix={css({
            boxSizing: "border-box",
            display: "inline-flex",
            height: "56px",
            appearance: "none",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgb(0 0 0 / 0.1)",
            borderRadius: "8px",
            backgroundColor: theme.colors.action.primary,
            paddingInline: "24px",
            color: theme.colors.action.primaryLabel,
            boxShadow: theme.shadow.low,
            fontSize: "1rem",
            fontWeight: theme.fontWeight.semibold,
            lineHeight: 1,
            letterSpacing: "-0.025em",
            transition: "all 150ms ease",
            "&:hover": { opacity: 0.9 },
            "&:focus-visible": {
              outline: `2px solid ${theme.colors.action.primary}`,
              outlineOffset: "2px",
            },
            "&:active": { opacity: 0.8, transform: "scale(0.98)" },
            [breakpointMedia.md]: { width: "auto", whiteSpace: "nowrap" },
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          })}
          disabled={form.state.status === "submitting"}
        >
          {form.state.status === "submitting" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    );
  },
);

let newsletterFrameHostStyle = css({ containerType: "inline-size" });
