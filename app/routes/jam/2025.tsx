import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { getMeta } from "~/lib/meta";
import { getSubscribeStatus } from "~/ui/subscribe";
import { usePrefersReducedMotion } from "./utils";
import { clsx } from "clsx";
import { Keepsakes } from "./keepsakes";
import { Navbar } from "./navbar";

import type { Route } from "./+types/2025";
import type { NewsletterActionData } from "~/routes/[_]actions.newsletter";
import { ScrambleText, SectionLabel, Title } from "./text";

export function meta({ matches }: Route.MetaArgs) {
  const [rootMatch] = matches;
  const { siteUrl } = rootMatch.data;
  return getMeta({
    title: "Remix Jam 2025",
    description: "It's time to get the band back together",
    siteUrl: `${siteUrl}/jam`,
    image: `${siteUrl}/conf-images/2025/og_image.jpg`,
  });
}

export default function RemixJam2025() {
  return (
    <>
      <Navbar className="z-40" />

      <div className="relative z-30">
        <Keepsakes />
      </div>

      <EventDetails />

      <FaqSection className="relative z-10" />

      {/* Spacer */}
      <div className="h-[100px] w-full" />

      <NewsletterSignup className="relative z-10" />
    </>
  );
}

function EventDetails() {
  return (
    <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[170px] text-center md:pt-[200px] lg:pt-[210px]">
      <SectionLabel>Pack Your Bags</SectionLabel>

      <Title>
        <ScrambleText text="Remix Jam" delay={100} color="blue" />
        <span className="flex items-center justify-center gap-3 md:gap-5">
          <ScrambleText text="Toronto" delay={400} color="green" />
          <FadeInBadge delay={1200} />
        </span>
        <ScrambleText
          text="October 10 2025"
          delay={700}
          charDelay={80}
          cyclesToResolve={8}
          color="yellow"
          className="whitespace-nowrap"
        />
      </Title>

      <SectionLabel>Overview</SectionLabel>
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <p className="text-lg font-bold leading-relaxed text-white md:text-3xl">
          Join us in person for a special event — to learn about our shared
          past, present, and future — hosted by the Remix team & Shopify in the
          heart of Toronto.
        </p>
      </div>

      <SectionLabel>Location</SectionLabel>
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <address className="text-lg font-bold not-italic leading-relaxed text-white md:text-3xl">
          620 King St W
          <br />
          Toronto, ON M5V 1M7, Canada
        </address>
      </div>
    </main>
  );
}

/**
 * Simple component that fades in after a delay
 */
function FadeInBadge({ delay = 0 }: { delay?: number }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, prefersReducedMotion]);

  const badgeClasses =
    "rounded-full px-4 py-3 text-xl leading-none ring-4 ring-inset ring-white md:px-8 md:py-5 md:text-4xl md:ring-[6px]";

  return (
    <>
      <span className="sr-only">Event</span>
      <span
        className={clsx(
          badgeClasses,
          !prefersReducedMotion && [
            "transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0",
          ],
        )}
      >
        Event
      </span>
    </>
  );
}

function NewsletterSignup({ className }: { className?: string }) {
  const subscribe = useFetcher<NewsletterActionData>();
  const { isSuccessful, isError, error } = getSubscribeStatus(subscribe);

  return (
    <aside id="newsletter" className="mx-auto max-w-2xl text-center text-base">
      <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
        Sign up for our Newsletter to be stay up to date on any announcements,
        lineup changes, or additional details about Remix Jam
      </h2>

      <subscribe.Form
        className={clsx(
          "top-layer mt-12 flex flex-col items-center",
          className,
        )}
        action="/_actions/newsletter"
        method="POST"
      >
        <input type="hidden" name="tag" value="6280341" />
        <SectionLabel>
          <label htmlFor="email">email</label>
        </SectionLabel>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="your@email.com"
          className="mt-[10px] w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-xl text-white ring-inset placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-brand sm:leading-6"
        />
        <button
          type="submit"
          className="mt-5 w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-xl font-semibold text-white ring-inset transition-colors duration-300 placeholder:text-white hover:bg-blue-brand focus:ring-blue-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:leading-6"
        >
          Sign Up
        </button>

        <div aria-live="polite" className="mt-4 text-sm text-white">
          {isSuccessful && (
            <p>
              You're good to go ✅ Please confirm your email to be notified when
              ticket sales are available.
            </p>
          )}
          {isError && (
            <p className="text-red-400">{error} ⚠️ Please try again.</p>
          )}
        </div>
      </subscribe.Form>
    </aside>
  );
}

function FaqSection({ className }: { className?: string }) {
  return (
    <section
      className={clsx(
        "mx-auto w-full max-w-[800px] overflow-hidden rounded-[32px]",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="rounded-lg bg-black/35">
          <h3 className="flex items-center justify-between p-6 font-conf-mono font-normal text-white">
            FAQ
          </h3>
        </div>
        <FaqItem question="Where can I find the event lineup?">
          Our lineup will be announced in June with a range of speakers and
          topics. Be sure to sign up for the Remix Newsletter to get notified
          about them!
        </FaqItem>
        <FaqItem question="Where will the event be hosted?">
          The Remix team is hosting this event in conjunction with Shopify at
          620 King St W Toronto, ON M5V 1M7, Canada
        </FaqItem>
        <FaqItem question="Will there be a group discount?">
          Ask Brooks!
        </FaqItem>
        <FaqItem question="Where should I stay?">
          We are working with a few trusted partners to set something up. Stay
          tuned for more on this soon!
        </FaqItem>
        <FaqItem question="What's the refund policy?">
          There are no refunds, but tickets will be transferable.
        </FaqItem>
        <FaqItem question="How do I transfer a ticket?">Ask Brooks!</FaqItem>
        <FaqItem question="What if I have other questions?">
          You guessed it, ask Brooks!
        </FaqItem>
      </div>
    </section>
  );
}

function FaqItem({
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
        className="_no-triangle flex cursor-pointer items-center justify-between gap-3 p-4 font-conf-mono font-normal text-white transition-colors hover:bg-black md:p-6"
      >
        {question}
        {/* Plus/Minus Icon - relies solely on group-open state */}
        <div className="relative size-4 shrink-0 rounded-full p-1 opacity-30 ring ring-white/80 group-open:opacity-100 group-hover:opacity-100 md:size-8">
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
        <div className="p-5 pt-0 text-white/80">{children}</div>
      </div>
    </details>
  );
}
