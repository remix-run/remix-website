import { useEffect, useRef } from "react";
import { getMeta } from "~/lib/meta";
import ogImageSrc from "../images/og-thumbnail-1.jpg";
import { usePrefersReducedMotion } from "../utils";

import type { Route } from "./+types/2025.lineup";
import { getSchedule } from "../schedule.server";
import { ScrambleText, Title } from "../text";

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
    <main className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 px-4 py-20 pt-[120px] md:pt-[180px] lg:pt-[200px]">
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

      <div className="w-full space-y-4">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Friday</h1>
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          Oct 10 2025
        </h2>
      </div>

      <Schedule items={schedule} />
    </main>
  );
}

function Schedule({
  items,
}: {
  items: Route.ComponentProps["loaderData"]["schedule"];
}) {
  return (
    <section className="z-10 w-full">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/40">
        {/* Header */}
        <div className="grid grid-cols-[120px,1fr,200px] gap-4 border-b border-white/20 bg-black/60 p-4 text-xs font-semibold uppercase tracking-wider text-white/60 md:grid-cols-[150px,1fr,250px] md:p-6">
          <div>Time</div>
          <div>Topic</div>
          <div className="text-right">Speaker</div>
        </div>
        {/* Items */}
        <div className="divide-y divide-white/10">
          {items.map((item) => {
            const key = `${item.time}-${item.title}`;
            return <ScheduleItem key={key} item={item} />;
          })}
        </div>
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
        className="_no-triangle group grid cursor-pointer grid-cols-[120px,1fr,200px] gap-4 p-4 text-white outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/5 md:grid-cols-[150px,1fr,250px] md:p-6"
      >
        <span className="text-sm text-white/80">{item.time}</span>
        <span className="text-base font-medium">{item.title}</span>
        <div className="flex items-center justify-end gap-3">
          {item.type === "talk" && item.speakers.length > 0 && (
            <span className="text-sm text-white/80">
              {item.speakers[0].name}
            </span>
          )}
          <svg
            className="h-5 w-5 text-white/60 transition-transform group-open:rotate-180"
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
      <div className="border-t border-white/10 bg-black/20">
        <div className="grid grid-cols-[120px,1fr] gap-4 p-4 md:grid-cols-[150px,1fr] md:p-6">
          <div></div>
          <div className="space-y-6">
            <div
              className="prose prose-invert max-w-none text-white/80"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />

            {item.type === "talk" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {item.speakers.map((s) => (
                    <div key={s.name} className="flex items-center gap-3">
                      <img
                        src={s.imgSrc}
                        alt={s.name}
                        className="h-10 w-10 rounded-full object-cover"
                        loading="lazy"
                      />
                      <span className="text-white/90">{s.name}</span>
                    </div>
                  ))}
                </div>

                {item.bio && (
                  <div
                    className="prose prose-invert max-w-none text-sm text-white/70"
                    dangerouslySetInnerHTML={{ __html: item.bio }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
