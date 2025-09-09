import { useEffect, useRef } from "react";
import { getMeta } from "~/lib/meta";
import ogImageSrc from "../images/og-thumbnail-1.jpg";
import { usePrefersReducedMotion } from "../utils";

import type { Route } from "./+types/2025.lineup";
import { getSchedule } from "../schedule.server";
import { ScrambleText, Title } from "../text";
import { clsx } from "clsx";

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

export default function JamLineupPage({ loaderData }: Route.ComponentProps) {
  let { schedule } = loaderData;

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-20 pt-[120px] md:pt-[180px] lg:pt-[200px]">
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

      <div className="z-10 mt-32 flex w-full flex-col gap-2 py-9">
        <h1 className="text-3xl text-white">Friday</h1>
        <h2 className="text-5xl font-bold text-white">Oct 10 2025</h2>
      </div>

      <Schedule items={schedule} />
    </main>
  );
}

let gridColsClassName = "grid grid-cols-[150px_1fr_1fr_auto] gap-8";

function Schedule({
  items,
}: {
  items: Route.ComponentProps["loaderData"]["schedule"];
}) {
  return (
    <section className="z-10 w-full">
      <div className="-mx-10 border-y-2 border-white/20">
        <div
          className={clsx(
            "p-9 font-mono uppercase text-white/40",
            gridColsClassName,
          )}
        >
          <div>Time</div>
          <div>Topic</div>
          <div className="col-span-2">Speaker</div>
        </div>

        {items.map((item) => {
          const key = `${item.time}-${item.title}`;
          return <ScheduleItem key={key} item={item} />;
        })}
      </div>
    </section>
  );
}

function ScheduleItem({
  item,
}: {
  item: Route.ComponentProps["loaderData"]["schedule"][number];
}) {
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
          "_no-triangle group cursor-pointer p-9 text-2xl font-bold text-white outline-none transition-colors duration-300 group-hover:bg-gray-900",
          gridColsClassName,
        )}
      >
        <span>{item.time}</span>
        <span>{item.title}</span>
        <span>
          {item.type === "talk" && item.speakers.length > 0
            ? item.speakers[0].name
            : item.type === "simple" && item.speakers.length > 0
              ? item.speakers[0]
              : ""}
        </span>
        <div className="flex justify-end">
          <svg
            className="h-5 w-5 text-white transition-transform group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </summary>
      <div className="transition-colors duration-300 group-hover:bg-gray-900">
        <div className={clsx("p-9", gridColsClassName)}>
          <div
            className="col-start-2 flex flex-col gap-6 text-2xl text-white"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />

          {item.type === "talk" && item.speakers.length > 0 && (
            <div className="col-start-3 flex flex-col">
              <img
                src={item.speakers[0].imgSrc}
                alt={item.speakers[0].name}
                className="mb-6 w-full rounded-2xl object-cover"
                loading="lazy"
              />
              {item.bio && (
                <div
                  className="flex flex-col gap-6 font-mono text-white"
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
