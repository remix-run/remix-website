import { Fragment, useEffect, useRef } from "react";
import { Address, usePrefersReducedMotion } from "./utils";
import clsx from "clsx";

export function FAQ({
  className,
  /** List of Questions, always placed above the default questions */
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={clsx(
        "mx-auto w-full max-w-[800px] overflow-hidden rounded-[32px] text-sm md:text-base",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="rounded-lg bg-black/35">
          <h3 className="flex items-center justify-between p-6 font-conf-mono font-normal text-white">
            FAQ
          </h3>
        </div>
        {children}
        <Question question="Where can I find the event lineup?">
          Our lineup will be announced in July with a range of speakers and
          topics. Be sure to sign up for the Remix Newsletter to get notified
          when it's announced!
        </Question>
        <Question question="Will there be a CFP?">
          No, there will not be a CFP.
          <br />
          <br />
          We are putting together a great "set list" of speakers and topics
          exploring the past, present, and future of Remix and the web. You can
          expect to hear from the founders, well known members of the community,
          and other industry experts.
          <br />
          <br />
          The full lineup will be announced in July.
        </Question>
        <Question question="Where will the event be hosted?">
          The Remix team is hosting this event in conjunction with Shopify at{" "}
          <Address className="inline" />.
        </Question>
        <Question question="Where should I stay?">
          We have 2 hotel blocks for the event:
          <ul className="list-disc pl-5 pt-4">
            <li>
              <a
                href="https://reservation.germainhotels.com/ibe/details.aspx?propertyid=17522&nights=2&checkin=10/09/2025&group=2510SHOPIF&lang=en-us&adults=2"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Le Germain Mercer
              </a>{" "}
              — $259/night
            </li>
            <li>
              <a
                href="https://www.hyatt.com/en-US/group-booking/TORRT/G-SH0F"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Hyatt Regency Toronto
              </a>{" "}
              — $279/night
            </li>
          </ul>
          <br />
          <strong className="font-bold">
            You must select the dates Oct 9-11.
          </strong>
        </Question>
        <Question question="What airport should I fly into?">
          The closest airport is Toronto Pearson International Airport (YYZ).
        </Question>
        <Question question="What's the refund policy?">
          There are no refunds, but tickets will be transferable.
        </Question>
        <Question question="How do I transfer a ticket?">Ask Brooks!</Question>
        <Question question="What if I have other questions?">
          You guessed it, ask Brooks!
        </Question>
      </div>
    </section>
  );
}

export function Question({
  question,
  className,
  children,
}: {
  question: string;
  className?: string;
  children: React.ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const animation = useRef<Animation | null>(null);

  const animateAccordion = (open: boolean) => {
    const details = detailsRef.current;

    // Ensure elements exist before animating
    if (!details) return;

    // Cancel any previous animations
    animation.current?.cancel();

    const startHeight = `${details.offsetHeight}px`;
    // Set the target open state *before* measuring end height
    details.open = open;
    const endHeight = `${details.offsetHeight}px`;

    // If height doesn't change, skip animation (e.g., empty content)
    if (startHeight === endHeight) {
      details.style.height = "";
      details.style.overflow = "";
      return;
    }

    const duration = 200; // Consistent duration
    details.style.overflow = "hidden"; // Prevent content spill during animation

    animation.current = details.animate(
      { height: [startHeight, endHeight] },
      { duration, easing: "ease-out" },
    );

    // Clean up inline styles on completion
    animation.current.onfinish = () => {
      details.style.height = "";
      details.style.overflow = "";
      animation.current = null;
    };
  };

  const handleSummaryClick = (event: React.MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    if (!details) return;

    // Allow default behavior if motion is reduced
    if (prefersReducedMotion) {
      return;
    }

    // Prevent default instant toggle only if animating
    event.preventDefault();

    const targetOpenState = !details.open;
    animateAccordion(targetOpenState);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    const currentAnimation = animation.current;
    return () => {
      currentAnimation?.cancel();
    };
  }, []);

  return (
    <details
      ref={detailsRef}
      className={clsx(
        "group overflow-hidden rounded-xl bg-black/35 open:bg-black",
        className,
      )}
    >
      <summary
        onClick={handleSummaryClick}
        className="_no-triangle group flex cursor-pointer items-center justify-between gap-3 p-4 font-conf-mono font-normal text-white outline-none transition-colors hover:bg-black focus-visible:bg-black md:p-6"
      >
        {question}
        {/* Plus/Minus Icon - relies solely on group-open state */}
        <div className="relative size-4 shrink-0 rounded-full p-1 opacity-30 ring ring-white/80 group-open:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100 md:size-8">
          <span className="absolute left-1/2 top-1/2 block h-[2px] w-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80" />
          <span
            className={clsx(
              "absolute left-1/2 top-1/2 block h-1/2 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white/80",
              "transition-transform duration-300 ease-in-out group-open:rotate-90", // Use group-open for styling
            )}
          />
        </div>
      </summary>
      <div>
        <div className="p-5 pt-0 text-white/80">
          {replaceBrooksWithLink(children)}
        </div>
      </div>
    </details>
  );
}

// Really wanting RSC right now
function replaceBrooksWithLink(children: React.ReactNode): React.ReactNode {
  if (typeof children !== "string") return children;

  const parts = children.split("Brooks");
  if (parts.length === 1) return children;

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <address className="inline-block not-italic">
              <a
                className="text-blue-400 hover:underline"
                href="mailto:brooks.lybrand@shopify.com"
              >
                Brooks
              </a>
            </address>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}
