import { useEffect, useRef } from "react";
import { getMeta } from "~/lib/meta";
import ogImageSrc from "../images/og-thumbnail-1.jpg";
import { usePrefersReducedMotion } from "../utils";

import type { Route } from "./+types/2025.lineup";
import { getSchedule } from "../schedule.server";
import { ScrambleText, Title } from "../text";
import { clsx } from "clsx";
import iconsHref from "~/icons.svg";

export async function loader() {
  let schedule = await getSchedule();

  return { schedule };
}

export function meta({ matches }: Route.MetaArgs) {
  let [rootMatch] = matches;
  let { siteUrl } = rootMatch.data;

  let image = `${siteUrl}${ogImageSrc}`;

  return getMeta({
    title: "Schedule & Lineup | Remix Jam 2025",
    description: "Schedule & Speaker Lineup for Remix Jam 2025",
    siteUrl: `${siteUrl}/jam`,
    image,
  });
}

export let handle = {
  hideBackground: true,
};

export default function JamLineupPage({ loaderData }: Route.ComponentProps) {
  let { schedule } = loaderData;

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col items-center py-20 pt-[120px] md:pt-[180px] lg:pt-[200px]">
      <Title className="text-center">
        <ScrambleText
          className="whitespace-nowrap"
          text="Schedule"
          delay={100}
          charDelay={70}
          cyclesToResolve={8}
          color="blue"
        />
        <ScrambleText
          text="& Lineup"
          delay={300}
          charDelay={70}
          cyclesToResolve={8}
          color="green"
        />
      </Title>

      <div className="mt-16 flex w-full flex-col gap-1 py-6 sm:mt-24 sm:px-2 sm:py-9 md:mt-24">
        <h1 className="text-lg text-white sm:text-3xl">Friday</h1>
        <h2 className="text-xl font-bold text-white sm:text-4xl md:text-5xl">
          Oct 10 2025
        </h2>
      </div>

      <Schedule items={schedule} />
    </main>
  );
}

let gridColsClassName =
  "grid grid-cols-[65px_1fr_auto] gap-4 sm:grid-cols-[100px_1fr_1fr_24px] sm:gap-6 md:grid-cols-[120px_1fr_1fr_24px] md:gap-8 lg:grid-cols-[150px_1fr_1fr_24px] lg:gap-12";

function Schedule({
  items,
}: {
  items: Route.ComponentProps["loaderData"]["schedule"];
}) {
  return (
    <>
      {/* Mobile view */}
      <section className="z-10 w-full sm:hidden">
        <div className="-mx-10 border-y-2 border-white/20 px-4">
          <div
            className={clsx(
              "p-6 font-mono text-xs uppercase text-white/40",
              gridColsClassName,
            )}
          >
            <div>Time</div>
            <div>Topic</div>
            <div>Speaker</div>
          </div>

          {items.map((item) => {
            const key = `${item.time}-${item.title}`;
            return <ScheduleItemMobile key={key} item={item} />;
          })}
        </div>
      </section>

      {/* Desktop view */}
      <section className="z-10 hidden w-full px-4 sm:block">
        <div className="-mx-10 border-y-2 border-white/20">
          <div
            className={clsx(
              "p-4 font-mono text-xs uppercase text-white/40 sm:p-6 sm:text-sm md:p-8 lg:p-9",
              gridColsClassName,
            )}
          >
            <div>Time</div>
            <div>Topic</div>
            <div>Speaker</div>
          </div>

          {items.map((item) => {
            const key = `${item.time}-${item.title}`;
            return <ScheduleItemDesktop key={key} item={item} />;
          })}
        </div>
      </section>
    </>
  );
}

type ScheduleItemProps = {
  item: Route.ComponentProps["loaderData"]["schedule"][number];
};

function ScheduleItemMobile({ item }: ScheduleItemProps) {
  return (
    <div className="overflow-hidden">
      <div
        className={clsx(
          "my-2 border-t border-white/10 p-6 text-sm font-bold text-white",
          gridColsClassName,
        )}
      >
        <span className="font-normal text-white/60">{item.time}</span>
        <span>{item.title}</span>
        <span className="font-normal text-white/60">{item.speaker}</span>
      </div>
      <div className="pb-6">
        <div className={clsx("px-6", gridColsClassName)}>
          <div
            className="col-span-full flex flex-col gap-4 text-sm text-white [&_a:hover]:underline [&_a]:text-blue-400"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {item.imgSrc ? (
            <img
              src={item.imgSrc}
              alt={item.speaker}
              className="col-span-full aspect-square w-full rounded-2xl object-cover"
              loading="lazy"
            />
          ) : null}

          {item.bio ? (
            <div
              className="col-span-full flex flex-col gap-4 font-mono text-xs leading-5 text-white [&_a:hover]:underline [&_a]:text-blue-400"
              dangerouslySetInnerHTML={{ __html: item.bio }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ScheduleItemDesktop({ item }: ScheduleItemProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animation = useRef<Animation | null>(null);

  const animateAccordion = (open: boolean) => {
    const details = detailsRef.current;
    if (!details) return;

    animation.current?.cancel();

    const startHeight = `${details.offsetHeight}px`;
    details.open = open;
    const endHeight = `${details.offsetHeight}px`;

    if (startHeight === endHeight) {
      details.style.height = "";
      details.style.overflow = "";
      return;
    }

    const duration = 200;
    details.style.overflow = "hidden";

    animation.current = details.animate(
      { height: [startHeight, endHeight] },
      { duration, easing: "ease-out" },
    );

    animation.current.onfinish = () => {
      details.style.height = "";
      details.style.overflow = "";
      animation.current = null;
    };
  };

  const handleSummaryClick = (event: React.MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    if (!details || prefersReducedMotion) return;

    event.preventDefault();
    const targetOpenState = !details.open;
    animateAccordion(targetOpenState);
  };

  useEffect(() => {
    const currentAnimation = animation.current;
    return () => {
      currentAnimation?.cancel();
    };
  }, []);

  return (
    <details ref={detailsRef} className="group overflow-hidden">
      <summary
        onClick={handleSummaryClick}
        className={clsx(
          "_no-triangle group cursor-pointer select-none p-4 text-sm font-bold text-white outline-none transition-colors duration-300 group-hover:bg-gray-900 sm:p-6 sm:text-base md:p-8 md:text-lg lg:p-9 lg:text-2xl",
          gridColsClassName,
        )}
      >
        <span>{item.time}</span>
        <span>{item.title}</span>
        <span>{item.speaker}</span>
        <div className="flex justify-end">
          <svg
            className="size-4 rotate-90 text-white transition-transform group-open:-rotate-90 sm:size-5 lg:size-6"
            aria-hidden="true"
          >
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
        </div>
      </summary>
      <div className="transition-colors duration-300 group-hover:bg-gray-900">
        <div className={clsx("p-4 sm:p-6 md:p-8 lg:p-9", gridColsClassName)}>
          <div
            className="col-span-full flex flex-col gap-4 text-sm text-white sm:col-span-1 sm:col-start-2 sm:gap-6 sm:text-base md:text-lg lg:text-xl [&_a:hover]:underline [&_a]:text-blue-400"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {item.imgSrc && (
            <div className="col-span-full flex flex-col gap-4 sm:col-span-1 sm:col-start-3">
              <img
                src={item.imgSrc}
                alt={item.speaker}
                className="aspect-square w-full rounded-2xl object-cover sm:max-w-none"
              />
              {item.bio && (
                <div
                  className="flex flex-col gap-4 text-xs text-white sm:gap-6 sm:text-sm md:text-base lg:font-mono [&_a:hover]:underline [&_a]:text-blue-400"
                  dangerouslySetInnerHTML={{ __html: item.bio }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </details>
  );
}
