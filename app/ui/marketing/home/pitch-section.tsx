import cx from "clsx";
import { GitHub } from "~/ui/icons";

export function PitchSection() {
  return (
    <section className="flex flex-col items-center px-12 py-12 md:px-12 md:pb-24 md:pt-12">
      <div
        className={cx(
          "text-rmx-primary",
          "flex w-full max-w-[1024px] flex-col items-center gap-12 text-base leading-[1.6] tracking-wide md:text-2xl md:leading-[1.4] md:tracking-normal xl:text-4xl xl:leading-[1.4] xl:tracking-tight",
        )}
      >
        <p className="w-full">
          We are building Remix to be a batteries-included, ultra-productive,
          zero dependencies and bundler-free framework, ready to develop with in
          a model-first world.
        </p>
        <p className="w-full">
          Remix 3 is a reimagining of what a web framework can be;
          <br aria-hidden="true" />a fresh foundation shaped by decades of
          experience building for the web. Our focus is on simplicity, clarity,
          and performance, without giving up the power developers need.
        </p>
        <a
          href="https://github.com/remix-run/remix"
          className={cx(
            "rmx-bg-button-primary rmx-text-button-primary rmx-shadow-mid",
            "inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-black/10 px-4 py-4 text-xl font-semibold leading-none tracking-tight no-underline",
            "transition-all hover:opacity-90",
            "active:scale-[0.98] active:opacity-80",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rmx-button-surface-primary)]",
            "sm:w-auto sm:whitespace-nowrap",
          )}
        >
          <GitHub className="size-6 shrink-0" aria-hidden="true" />
          <span>Watch the repo</span>
        </a>
      </div>
    </section>
  );
}
