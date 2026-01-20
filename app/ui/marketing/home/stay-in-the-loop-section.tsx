import cx from "clsx";
import {
  SubscribeProvider,
  SubscribeForm,
  SubscribeEmailInput,
  SubscribeSubmit,
  SubscribeStatus,
} from "~/ui/subscribe";

export function StayInTheLoopSection() {
  return (
    <section className="flex flex-col items-center gap-12 px-12 py-24 md:gap-12">
      <h2 className={cx("rmx-heading-xl", "text-rmx-primary", "text-center")}>
        Stay in the loop
      </h2>

      <div className="flex w-full max-w-[1032px] flex-col gap-8 lg:flex-row lg:items-stretch">
        <NewsletterCard />
        <DiscordCard />
      </div>
    </section>
  );
}

function NewsletterCard() {
  return (
    <div
      className={cx(
        "rmx-bg-surface-4 rmx-shadow-mid",
        "flex flex-[2] flex-col rounded-2xl p-8",
      )}
    >
      <div className="flex flex-1 flex-col gap-8 pb-8">
        <h3 className={cx("rmx-heading-sm", "text-rmx-secondary")}>
          Remix Newsletter
        </h3>
        <p className={cx("rmx-body", "text-rmx-primary")}>
          Once a month, we write about everything in the world of Remix. Sign up
          to be notified about progress on Remix 3. No spam. Unsubscribe
          anytime.
        </p>
      </div>
      <div>
        <SubscribeProvider>
          <SubscribeForm className="flex flex-col gap-6 md:h-14 md:flex-row">
            <SubscribeEmailInput
              placeholder="name@example.com"
              className={cx(
                "rmx-bg-neutral-100",
                "h-14 flex-1 rounded-lg border-0 px-6 text-base",
                "placeholder:text-rmx-text-tertiary",
              )}
            />
            <SubscribeSubmit
              className={cx(
                "rmx-bg-button-primary rmx-text-button-primary rmx-shadow-low",
                "rmx-button-text",
                "h-14 rounded-lg border border-black/10 px-6",
                "transition-all hover:opacity-90",
                "active:scale-[0.98] active:opacity-80",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rmx-button-surface-primary)]",
                "md:w-auto md:whitespace-nowrap",
              )}
            >
              Subscribe
            </SubscribeSubmit>
          </SubscribeForm>
          <SubscribeStatus />
        </SubscribeProvider>
      </div>
    </div>
  );
}

function DiscordCard() {
  return (
    <div
      className={cx(
        "rmx-bg-surface-4 rmx-shadow-mid",
        "flex flex-1 flex-col rounded-2xl p-8",
      )}
    >
      <div className="flex flex-1 flex-col gap-8 pb-8">
        <h3 className={cx("rmx-heading-sm", "text-rmx-secondary")}>
          Remix Community
        </h3>
        <p className={cx("rmx-body", "text-rmx-primary")}>
          Discuss, get help, or ask questions regarding Remix or React Router.
        </p>
      </div>
      <div>
        <a
          href="https://rmx.as/discord"
          className={cx(
            "rmx-bg-button-secondary rmx-text-button-secondary rmx-shadow-low",
            "rmx-button-text",
            "inline-flex h-14 w-full items-center justify-center rounded-lg border border-black/10 px-6 no-underline",
            "transition-all hover:opacity-90",
            "active:scale-[0.98] active:brightness-95",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rmx-button-surface-secondary)]",
          )}
        >
          Join Discord
        </a>
      </div>
    </div>
  );
}
