/** @jsxImportSource remix/component */
import cx from "clsx";

export function StayInTheLoopSection() {
  return () => (
    <section class="flex flex-col items-center gap-12 px-12 py-24 md:gap-12">
      <h2 class={cx("rmx-heading-xl", "text-rmx-primary", "text-center")}>
        Stay in the loop
      </h2>

      <div class="flex w-full max-w-[1032px] flex-col gap-8 lg:flex-row lg:items-stretch">
        <NewsletterCard />
        <DiscordCard />
      </div>
    </section>
  );
}

function NewsletterCard() {
  return () => (
    <div
      class={cx("rmx-bg-surface-4 rmx-shadow-mid", "flex flex-[2] flex-col rounded-2xl p-8")}
    >
      <div class="flex flex-1 flex-col gap-8 pb-8">
        <h3 class={cx("rmx-heading-sm", "text-rmx-secondary")}>Remix Newsletter</h3>
        <p class="rmx-body text-rmx-primary">
          Once a month, we write about everything in the world of Remix. Sign up to be
          notified about progress on Remix 3. No spam. Unsubscribe anytime.
        </p>
      </div>
      {/* TODO(remix-home): replace this static form with the real subscribe provider/action flow. */}
      <form class="flex flex-col gap-6 md:h-14 md:flex-row" method="post" action="#">
        <input
          type="email"
          name="email"
          placeholder="name@example.com"
          class={cx(
            "rmx-bg-neutral-100",
            "h-14 flex-1 rounded-lg border-0 px-6 text-base",
            "placeholder:text-rmx-text-tertiary",
          )}
        />
        <button
          type="submit"
          class={cx(
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
        </button>
      </form>
    </div>
  );
}

function DiscordCard() {
  return () => (
    <div
      class={cx("rmx-bg-surface-4 rmx-shadow-mid", "flex flex-1 flex-col rounded-2xl p-8")}
    >
      <div class="flex flex-1 flex-col gap-8 pb-8">
        <h3 class={cx("rmx-heading-sm", "text-rmx-secondary")}>Remix Community</h3>
        <p class="rmx-body text-rmx-primary">
          Discuss, get help, or ask questions regarding Remix or React Router.
        </p>
      </div>
      <a
        href="https://rmx.as/discord"
        class={cx(
          "rmx-bg-button-secondary rmx-text-button-secondary rmx-shadow-low",
          "rmx-button-text",
          "inline-flex h-14 w-full items-center justify-center rounded-lg border border-black/10 px-6 no-underline",
          "transition-all hover:opacity-90",
          "active:scale-[0.98] active:brightness-95",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rmx-button-surface-primary)]",
        )}
      >
        Join Discord
      </a>
    </div>
  );
}
