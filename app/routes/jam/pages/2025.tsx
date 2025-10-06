import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { getMeta } from "~/lib/meta";
import { getSubscribeStatus } from "~/ui/subscribe";
import { AddressMain, usePrefersReducedMotion } from "../utils";
import { clsx } from "clsx";
import { Keepsakes } from "../keepsakes";
import { ScrambleText, SectionLabel, Title } from "../text";
import ogImageSrc from "../images/og-thumbnail-1.jpg";
import iconsHref from "~/icons.svg";

import type { Route } from "./+types/2025";
import type { NewsletterActionData } from "~/routes/[_]actions.newsletter";

type EventStatus = "before" | "live" | "after";

export function loader() {
  // Get current time in Toronto timezone
  const now = new Date();

  // Get the current time in Toronto timezone as an ISO string
  const torontoTimeString = now.toLocaleString("en-US", {
    timeZone: "America/Toronto",
  });
  const torontoNow = new Date(torontoTimeString);

  // Event is October 10, 2025
  const eventStartDate = new Date(2025, 9, 10, 0, 0, 0); // Oct 10 at midnight
  const eventEndDate = new Date(2025, 9, 10, 18, 0, 0); // Oct 10 at 6 PM

  let eventStatus: EventStatus;
  if (torontoNow < eventStartDate) {
    eventStatus = "before";
  } else if (torontoNow >= eventStartDate && torontoNow < eventEndDate) {
    eventStatus = "live";
  } else {
    eventStatus = "after";
  }

  return { eventStatus };
}

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

export default function RemixJam2025({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="relative z-30">
        <Keepsakes />
      </div>

      <EventDetails eventStatus={loaderData.eventStatus} />

      {/* Spacer */}
      <div className="h-[100px] w-full" />

      <NewsletterSignup className="relative z-10" />
    </>
  );
}

const sectionLabelText: Record<EventStatus, string> = {
  before: "Pack Your Bags",
  live: "Streaming from Shopify Toronto",
  after: "In Case You Missed It",
};

const badgeText: Record<EventStatus, React.ReactNode> = {
  before: "Event",
  live: "Live",
  after: (
    <>
      Rewind
      <svg
        className="size-6 rotate-180 md:size-12 lg:size-14"
        aria-hidden="true"
      >
        <use href={`${iconsHref}#fast-forward`} />
      </svg>
    </>
  ),
};

function EventDetails({ eventStatus }: { eventStatus: EventStatus }) {
  return (
    <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[170px] text-center md:pt-[200px] lg:pt-[210px]">
      <SectionLabel>{sectionLabelText[eventStatus]}</SectionLabel>

      <Title>
        <ScrambleText text="Remix Jam" delay={100} color="blue" />
        <span className="flex items-center justify-center gap-3 md:gap-5">
          <ScrambleText text="Toronto" delay={400} color="green" />

          <FadeInBadge
            delay={1200}
            className={clsx(
              "flex items-center justify-center gap-2 md:gap-4",
              eventStatus === "live"
                ? "bg-red-brand text-white"
                : "text-white ring-4 ring-inset ring-white md:ring-[6px]",
            )}
          >
            {badgeText[eventStatus]}
          </FadeInBadge>
        </span>
      </Title>

      <div className="z-10 w-full">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/xt_iEOn2a6Y?si=paROll6GT5taxAdl"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      {eventStatus === "before" ? (
        <>
          <SectionLabel>Location</SectionLabel>
          <div className="z-10 flex flex-col items-center gap-6 md:gap-8">
            <AddressMain />
          </div>
        </>
      ) : null}
    </main>
  );
}

/**
 * Simple component that fades in after a delay
 */
function FadeInBadge({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, prefersReducedMotion]);

  return (
    <>
      <span
        className={clsx(
          "rounded-full px-4 py-3 text-xl leading-none md:px-8 md:py-5 md:text-4xl",
          !prefersReducedMotion && [
            "transition-opacity duration-500",
            isVisible ? "opacity-100" : "opacity-0",
          ],
          className,
        )}
      >
        {children}
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
        Sign up for our Newsletter for the latest Remix Jam news and updates
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
