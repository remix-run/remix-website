import { clsx } from "clsx";
import { getSchedule } from "./jam-schedule.server";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { JamDocument, ScrambleText, Title } from "./jam-shared";
import ogImageSrc from "../../app/routes/jam/images/og-thumbnail-1.jpg";
import iconsHref from "../../shared/icons.svg";

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
                    <span class="text-xs font-normal text-white/60">(UTC-04:00)</span>
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
    <details class="group overflow-hidden border-t border-white/10" data-accordion-item>
      <summary
        class={clsx(
          "_no-triangle grid cursor-pointer select-none p-4 text-sm font-bold text-white outline-none transition-colors duration-300 hover:bg-gray-900 sm:p-6 sm:text-base md:p-8 md:text-lg lg:p-9 lg:text-2xl",
          gridColsClassName,
        )}
      >
        <span>{item.time}</span>
        <span>{item.title}</span>
        <span>{item.speaker}</span>
        <div class="flex justify-end">
          <svg
            class="size-4 rotate-90 text-white transition-transform group-open:-rotate-90 sm:size-5 lg:size-6"
            aria-hidden="true"
          >
            <use href={`${iconsHref}#chevron-r`} />
          </svg>
        </div>
      </summary>
      <div class="pb-8 transition-colors duration-300 group-hover:bg-gray-900">
        <div class={clsx("p-4 sm:p-6 md:p-8 lg:p-9", gridColsClassName)}>
          <div
            class="col-span-full flex flex-col gap-4 text-sm text-white sm:col-span-1 sm:col-start-2 sm:gap-6 sm:text-base md:text-lg lg:text-xl [&_a:hover]:underline [&_a]:text-blue-400"
            innerHTML={item.description}
          />
          {item.imgSrc ? (
            <div class="col-span-full flex flex-col gap-4 sm:col-span-1 sm:col-start-3">
              <img
                src={item.imgSrc}
                alt={item.speaker}
                class="aspect-square w-full rounded-2xl object-cover sm:max-w-none"
              />
              {item.bio ? (
                <div
                  class="flex flex-col gap-4 text-xs text-white sm:gap-6 sm:text-sm md:text-base lg:font-mono [&_a:hover]:underline [&_a]:text-blue-400"
                  innerHTML={item.bio}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}
