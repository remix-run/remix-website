/** @jsxImportSource remix/component */
import cx from "clsx";

export function PitchSection() {
  return () => (
    <section class="flex flex-col items-center px-12 py-12 md:px-12 md:pb-24 md:pt-12">
      <div
        class={cx(
          "text-rmx-primary",
          "rmx-body-lg",
          "flex w-full max-w-[1024px] flex-col items-center gap-12",
        )}
      >
        <p class="w-full">
          We are building Remix to be a batteries-included, ultra-productive, zero
          dependencies and bundler-free framework, ready to develop with in a
          model-first world.
        </p>
        <p class="w-full">
          Remix 3 is a reimagining of what a web framework can be;
          <br aria-hidden="true" />a fresh foundation shaped by decades of experience
          building for the web. Our focus is on simplicity, clarity, and performance,
          without giving up the power developers need.
        </p>
        <a
          href="https://github.com/remix-run/remix"
          class={cx(
            "rmx-bg-button-primary rmx-text-button-primary rmx-shadow-mid",
            "rmx-button-text-lg",
            "inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-4 no-underline",
            "transition-all hover:opacity-90",
            "active:scale-[0.98] active:opacity-80",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rmx-button-surface-primary)]",
            "sm:w-auto sm:whitespace-nowrap",
          )}
        >
          <span>Watch the repo</span>
        </a>
      </div>
    </section>
  );
}
