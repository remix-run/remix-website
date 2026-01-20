import cx from "clsx";
import { TimelineDiagramMobile } from "./mobile";
import { TimelineDiagramDesktop } from "./desktop";

export function TimelineSection() {
  return (
    <section
      className={cx(
        "rmx-home-timeline-bg",
        "overflow-x-clip bg-[var(--rmx-neutral-950)] text-white",
      )}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 pt-16 md:gap-16 md:pt-24">
        <h2
          className={cx(
            "rmx-heading-xl",
            "text-rmx-neutral-100",
            "text-center",
          )}
        >
          The story so far
        </h2>

        <div className="xl:hidden">
          <TimelineDiagramMobile />
        </div>

        <div className="hidden overflow-visible xl:flex xl:justify-center">
          <TimelineDiagramDesktop className="shrink-0" />
        </div>

        <div
          className={cx(
            "rmx-body-md rmx-body-on-dark",
            "mx-auto w-full max-w-[1024px] space-y-8 px-12 pb-16 md:space-y-12 md:pb-24",
          )}
        >
          <p>
            <a
              href="https://v2.remix.run/"
              className="text-[var(--rmx-highlight-blue)] hover:underline"
            >
              The first version of Remix
            </a>{" "}
            was a feature branch of React Router: a full stack web framework
            that let you focus on the user interface and work back through web
            standards to deliver a fast, slick, and resilient user experience.
          </p>
          <p>
            We've now merged Remix's features directly into{" "}
            <a
              href="https://reactrouter.com/"
              className="text-[var(--rmx-highlight-red)] hover:underline"
            >
              React Router
            </a>
            . If you're looking for a full stack, React-based framework built on
            Web APIs, check out React Router. We think it's the best way to ship
            React applications.
          </p>
          <p>
            <a
              href="https://github.com/remix-run/remix"
              className="text-[var(--rmx-highlight-green)] hover:underline"
            >
              Remix 3
            </a>{" "}
            is our latest full stack framework, built for immediate productivity
            whether you're using a fully agentic workflow or completely
            handwriting every line of code. Remix 3 is built on web APIs and
            composed of multiple single-purpose modules, packaged up to give you
            everything you need to build any kind of website. It's lightweight,
            simple to understand, and powerful to wield. If you've ever wished
            for a development experience that feels lighter, faster, and more
            aligned with how the web works, Remix 3 is being built for you.
          </p>
        </div>

        <div className="sr-only">
          <h3>Timeline milestones</h3>
          <ul>
            <li>2017: React Router v4 released</li>
            <li>2019: React Router v5 released</li>
            <li>2020: React Router v6 released</li>
            <li>2021: Remix v1 released</li>
            <li>2023: Remix v2 released</li>
            <li>
              2024: React Router v7 released (Remix features merged into React
              Router)
            </li>
            <li>2025: Remix 3 in development</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
