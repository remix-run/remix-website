import clsx from "clsx";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";
import {
  AddressMain,
  JamButton,
  JamDocument,
  KeepsakesStatic,
  ScrambleText,
  SectionLabel,
  Title,
} from "./jam-shared";
import ogImageSrc from "../../app/routes/jam/images/og-thumbnail-1.jpg";

type EventStatus = "before" | "live" | "after";

export async function jam2025Handler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025`;
  let previewImage = `${requestUrl.origin}${ogImageSrc}`;
  let eventStatus = getEventStatus();

  return render.document(
    <JamDocument
      title="Remix Jam 2025"
      description="It's time to get the band back together"
      pageUrl={pageUrl}
      previewImage={previewImage}
      activePath="/jam/2025"
    >
      <Jam2025Page eventStatus={eventStatus} />
    </JamDocument>,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

function getEventStatus(): EventStatus {
  let now = new Date();
  let torontoTimeString = now.toLocaleString("en-US", {
    timeZone: "America/Toronto",
  });
  let torontoNow = new Date(torontoTimeString);
  let eventStartDate = new Date(2025, 9, 10, 0, 0, 0);
  let eventEndDate = new Date(2025, 9, 10, 18, 0, 0);

  if (torontoNow < eventStartDate) return "before";
  if (torontoNow >= eventStartDate && torontoNow < eventEndDate) return "live";
  return "after";
}

const sectionLabelText: Record<EventStatus, string> = {
  before: "Pack Your Bags",
  live: "Streaming from Shopify Toronto",
  after: "In Case You Missed It",
};

const badgeText: Record<EventStatus, string> = {
  before: "Event",
  live: "Live",
  after: "Rewind",
};

function Jam2025Page() {
  return ({ eventStatus }: { eventStatus: EventStatus }) => (
    <>
      <div class="relative z-30">
        {/* TODO(remix-jam-interactions): Re-enable draggable keepsakes and jiggle affordances. */}
        <KeepsakesStatic />
      </div>

      <main class="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[170px] text-center md:pt-[200px] lg:pt-[210px]">
        <SectionLabel>{sectionLabelText[eventStatus]}</SectionLabel>
        <Title>
          {/* TODO(remix-jam-interactions): Restore scramble text animation sequencing. */}
          <ScrambleText text="Remix Jam" />
          <span class="flex items-center justify-center gap-3 md:gap-5">
            <ScrambleText text="Toronto" />
            {/* TODO(remix-jam-interactions): Restore delayed badge fade-in and icon variant behavior. */}
            <span
              class={clsx(
                "rounded-full px-4 py-3 text-xl leading-none md:px-8 md:py-5 md:text-4xl",
                "flex items-center justify-center gap-2 md:gap-4",
                eventStatus === "live"
                  ? "bg-red-brand text-white"
                  : "text-white ring-4 ring-inset ring-white md:ring-[6px]",
              )}
            >
              {badgeText[eventStatus]}
            </span>
          </span>
        </Title>

        <div class="z-10 w-full">
          <div class="relative aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              class="absolute inset-0 h-full w-full"
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
            <div class="z-10 flex flex-col items-center gap-6 md:gap-8">
              <AddressMain />
            </div>
          </>
        ) : null}
      </main>

      <div class="h-[100px] w-full" />

      <aside id="newsletter" class="relative z-10 mx-auto max-w-2xl text-center text-base">
        <h2 class="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Sign up for our Newsletter for the latest Remix Jam news and updates
        </h2>
        {/* TODO(remix-jam-interactions): Re-enable newsletter submission flow and status messaging. */}
        <form class="top-layer mt-12 flex flex-col items-center" action="#" method="post">
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
            class="mt-[10px] w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-lg text-white ring-inset placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-brand sm:leading-6"
            disabled
          />
          <JamButton className="mt-5 w-full max-w-sm" disabled>
            Sign Up
          </JamButton>
        </form>
      </aside>
    </>
  );
}
