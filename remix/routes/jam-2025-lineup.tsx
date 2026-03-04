import { clsx } from "clsx";
import { getSchedule } from "./jam-schedule.server";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { JamDocument, ScrambleText, Title } from "./jam-shared";
import ogImageSrc from "./jam/images/og-thumbnail-1.jpg";
import { JamLineupAccordionItem } from "../assets/jam-lineup-accordion-item";

let gridColsClassName =
  "grid grid-cols-[75px_1fr_auto] gap-4 sm:grid-cols-[100px_1fr_1fr_24px] sm:gap-6 md:grid-cols-[120px_1fr_1fr_24px] md:gap-8 lg:grid-cols-[150px_1fr_1fr_24px] lg:gap-12";

type Schedule = Awaited<ReturnType<typeof getSchedule>>;

export async function jam2025LineupHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/lineup`;
  let previewImage = `${requestUrl.origin}${ogImageSrc}`;
  let schedule = await getSchedule();

  return render.document(
    <JamDocument
      title="Schedule and Lineup | Remix Jam 2025"
      description="Schedule and Speaker Lineup for Remix Jam 2025"
      pageUrl={pageUrl}
      previewImage={previewImage}
      activePath="/jam/2025/lineup"
      hideBackground
      showSeats
    >
      <main class="mx-auto flex max-w-[1200px] flex-col items-center py-20 pt-[120px] md:pt-[180px] lg:pt-[200px]">
        <Title className="text-center">
          <ScrambleText text="Schedule" delay={100} color="blue" />
          <ScrambleText text="& Lineup" delay={300} color="green" />
        </Title>

        <div class="mt-16 flex w-full flex-col gap-1 py-6 sm:mt-24 sm:px-2 sm:py-9 md:mt-24">
          <h1 class="text-lg text-white sm:text-3xl">Friday</h1>
          <h2 class="text-xl font-bold text-white sm:text-4xl md:text-5xl">
            Oct 10 2025
          </h2>
        </div>

        <ScheduleTable items={schedule} />
      </main>
    </JamDocument>,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

function ScheduleTable() {
  return ({ items }: { items: Schedule }) => (
    <>
      <section class="z-10 w-full sm:hidden">
        <div class="-mx-10 border-y-2 border-white/20 px-4">
          <div
            class={clsx(
              "p-6 font-mono text-xs uppercase text-white/40",
              gridColsClassName,
            )}
          >
            <div>Time</div>
            <div>Topic</div>
            <div>Speaker</div>
          </div>

          {items.map((item) => {
            let key = `${item.time}-${item.title}`;
            return (
              <div key={key} class="overflow-hidden">
                <div
                  class={clsx(
                    "my-2 border-t border-white/10 p-6 text-sm font-bold text-white",
                    gridColsClassName,
                  )}
                >
                  <span>
                    {item.time}
                    <br />
                    <span class="text-xs font-normal text-white/60">
                      (UTC-04:00)
                    </span>
                  </span>
                  <span>{item.title}</span>
                  <span>{item.speaker}</span>
                </div>
                <div class="pb-6">
                  <div class={clsx("px-6", gridColsClassName)}>
                    <div
                      class="col-span-full flex flex-col gap-4 text-sm text-white [&_a:hover]:underline [&_a]:text-blue-400"
                      innerHTML={item.description}
                    />
                    {item.imgSrc ? (
                      <img
                        src={item.imgSrc}
                        alt={item.speaker}
                        class="col-span-full aspect-square w-full rounded-2xl object-cover"
                        loading="lazy"
                      />
                    ) : null}
                    {item.bio ? (
                      <div
                        class="col-span-full flex flex-col gap-4 font-mono text-xs leading-5 text-white [&_a:hover]:underline [&_a]:text-blue-400"
                        innerHTML={item.bio}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section class="z-10 hidden w-full px-4 sm:block">
        <div class="-mx-10 border-y-2 border-white/20">
          <div
            class={clsx(
              "p-4 font-mono text-xs uppercase text-white/40 sm:p-6 sm:text-sm md:p-8 lg:p-9",
              gridColsClassName,
            )}
          >
            <div>Time (UTC-04:00)</div>
            <div>Topic</div>
            <div>Speaker</div>
            <div />
          </div>
          {items.map((item) => {
            let key = `${item.time}-${item.title}`;
            return <DesktopScheduleItem key={key} item={item} />;
          })}
        </div>
      </section>
    </>
  );
}

function DesktopScheduleItem() {
  return ({ item }: { item: Schedule[number] }) => (
    <JamLineupAccordionItem item={item} gridColsClassName={gridColsClassName} />
  );
}
