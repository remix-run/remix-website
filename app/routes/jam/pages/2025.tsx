import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { getMeta } from "~/lib/meta";
import { getSubscribeStatus } from "~/ui/subscribe";
import { AddressMain, usePrefersReducedMotion } from "../utils";
import { clsx } from "clsx";
import { Keepsakes } from "../keepsakes";
import { Navbar } from "../navbar";
import { ScrambleText, SectionLabel, Title, InfoText } from "../text";
import ogImageSrc from "../images/og-thumbnail-1.jpg";

import type { Route } from "./+types/2025";
import type { NewsletterActionData } from "~/routes/[_]actions.newsletter";

export function meta({ matches }: Route.MetaArgs) {
  const [rootMatch] = matches;
  const { siteUrl } = rootMatch.data;

  let image = `${siteUrl}${ogImageSrc}`;

  return getMeta({
    title: "Remix Jam 2025",
    description: "It's time to get the band back together",
    siteUrl: `${siteUrl}/jam`,
    image,
  });
}

export default function RemixJam2025() {
  return (
    <>
      <Navbar className="z-40" showTicketLink />

      <div className="relative z-30">
        <Keepsakes />
      </div>

      <EventDetails />

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
      <InfoText>
        Join us in person for a special event — to learn about our shared past,
        present, and future — hosted by the Remix team & Shopify in the heart of
        Toronto.
      </InfoText>

      <SectionLabel>Location</SectionLabel>
      <div className="z-10 flex flex-col items-center gap-6 md:gap-8">
        <AddressMain />
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
          className="mt-[10px] w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-lg text-white ring-inset placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-brand sm:leading-6"
        />
        <button
          type="submit"
          className="mt-5 w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-lg font-semibold text-white ring-inset transition-colors duration-300 placeholder:text-white hover:bg-blue-brand focus:ring-blue-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:leading-6"
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
