import cx from "clsx";

export function TimelineSection() {
  return (
    <section className="px-12 py-16 text-white md:py-24">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 md:gap-16">
        <h2
          className={cx(
            "rmx-heading-xl",
            "text-rmx-neutral-100",
            "text-center",
          )}
        >
          The story so far
        </h2>

        <div className="w-full">
          <div className="flex w-full justify-center xl:hidden">
            <TimelineDiagramMobile />
          </div>
          <div className="hidden w-full rounded-2xl border border-white/10 bg-white/5 p-8 xl:block">
            <TimelineDiagramDesktop />
          </div>
        </div>

        <div
          className={cx(
            "rmx-body-md rmx-body-on-dark",
            "mx-auto w-full max-w-[1024px] space-y-8 md:space-y-12",
          )}
        >
          <p>
            <span className="text-[var(--rmx-highlight-blue)]">
              The first version of Remix was a feature branch of React Router
            </span>
            : a full stack web framework that let you focus on the user
            interface and work back through web standards to deliver a fast,
            slick, and resilient user experience.
          </p>
          <p>
            <span className="text-[var(--rmx-highlight-red)]">
              We've now merged Remix's features directly into React Router
            </span>
            . If you're looking for a full stack, React-based framework built on
            Web APIs, check out React Router. We think it's the best way to ship
            React applications.
          </p>
          <p>
            <span className="text-[var(--rmx-highlight-green)]">
              Remix 3 is our latest full stack framework, built for immediate
              productivity whether you're using a fully agentic workflow or
              completely handwriting every line of code.
            </span>{" "}
            Remix 3 is built on web APIs and composed of multiple single-purpose
            modules, packaged up to give you everything you need to build any
            kind of website. It's lightweight, simple to understand, and
            powerful to wield. If you've ever wished for a development
            experience that feels lighter, faster, and more aligned with how the
            web works, Remix 3 is being built for you.
          </p>
        </div>

        <div className="sr-only">
          TODO: accessible milestone list (for screen readers)
        </div>
      </div>
    </section>
  );
}

function TimelineDiagramMobile() {
  return <div className="h-72 w-full rounded-xl bg-white/5" />;
}

function TimelineDiagramDesktop() {
  return <div className="h-72 w-full rounded-xl bg-white/5" />;
}
