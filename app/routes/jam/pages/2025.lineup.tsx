import { ScrambleText, Title } from "../text";
import { getMeta } from "~/lib/meta";
import ogImageSrc from "../images/og-thumbnail-1.jpg";

import type { Route } from "./+types/2025.lineup";
import { getSchedule } from "../schedule.server";

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
    <main className="mx-auto flex max-w-[900px] flex-col items-center gap-12 py-20 pt-[120px] md:pt-[220px] lg:pt-[240px]">
      <Title className="text-center">
        <ScrambleText
          className="whitespace-nowrap"
          text="Schedule & Lineup"
          delay={100}
          charDelay={70}
          cyclesToResolve={8}
          color="blue"
        />
      </Title>

      <div className="z-10 w-full divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        {schedule.map((item) => {
          const key =
            item.type === "talk"
              ? `${item.time}-${item.talkTitle}`
              : `${item.time}-${item.title}`;
          return (
            <details key={key} className="group">
              <summary className="grid cursor-pointer grid-cols-[auto,1fr,auto] items-center gap-4 p-5 md:p-6">
                <span className="text-xs font-medium tracking-wide text-white/70 md:text-sm">
                  {item.time}
                </span>
                <span className="text-lg font-semibold text-white md:text-xl">
                  {item.title}
                </span>
                <svg
                  className="h-5 w-5 text-white/70 transition-transform group-open:rotate-180"
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
              </summary>

              <div className="space-y-6 bg-white/5 p-5 md:p-6">
                <div
                  className="prose prose-invert max-w-none text-white/90"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />

                {item.type === "talk" ? (
                  <div className="space-y-4">
                    {item.bio ? (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold tracking-wide text-white/80">
                          Speaker Bio
                        </h4>
                        <div
                          className="prose prose-invert max-w-none text-white/85"
                          dangerouslySetInnerHTML={{ __html: item.bio }}
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-5">
                      {item.speakers.map((s) => (
                        <div key={s.name} className="flex items-center gap-3">
                          <img
                            src={s.imgSrc}
                            alt={s.name}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20"
                            loading="lazy"
                          />
                          <span className="text-white/95">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </main>
  );
}
