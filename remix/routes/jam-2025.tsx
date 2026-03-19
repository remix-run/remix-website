import clsx from "clsx";
import type { RemixNode } from "remix/component/jsx-runtime";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../shared/cache-control";
import {
  AddressMain,
  JamDocument,
  ScrambleText,
  SectionLabel,
  Title,
} from "./jam-shared";
import { JamKeepsakes } from "../assets/jam-keepsakes";
import { JamFadeInBadge } from "../assets/jam-fade-in-badge";
import { JamNewsletterSubscribeForm } from "../assets/jam-newsletter-subscribe";
import {
  ICONS_SPRITE_HREF,
  JAM_OG_THUMB_JPG,
} from "../constants/static-assets.ts";

let ogImageSrc = JAM_OG_THUMB_JPG;
let iconsHref = ICONS_SPRITE_HREF;

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

const badgeText: Record<EventStatus, RemixNode> = {
  before: "Event",
  live: "Live",
  after: (
    <>
      Rewind
      <svg class="size-6 rotate-180 md:size-12 lg:size-14" aria-hidden="true">
        <use href={`${iconsHref}#fast-forward`} />
      </svg>
    </>
  ),
};

function Jam2025Page() {
  return ({ eventStatus }: { eventStatus: EventStatus }) => (
    <>
      <div class="relative z-30">
        <JamKeepsakes />
      </div>

      <main class="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[170px] text-center md:pt-[200px] lg:pt-[210px]">
        <SectionLabel>{sectionLabelText[eventStatus]}</SectionLabel>
        <Title>
          <ScrambleText
            setup={{ text: "Remix Jam", delay: 100, color: "blue" }}
          />
          <span class="flex items-center justify-center gap-3 md:gap-5">
            <ScrambleText
              setup={{ text: "Toronto", delay: 400, color: "green" }}
            />
            <JamFadeInBadge
              setup={1200}
              data-jam-event-badge
              class={clsx(
                "flex items-center justify-center gap-2 md:gap-4",
                eventStatus === "live"
                  ? "bg-red-brand text-white"
                  : "text-white ring-4 ring-inset ring-white md:ring-[6px]",
              )}
            >
              {badgeText[eventStatus]}
            </JamFadeInBadge>
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

      <aside
        id="newsletter"
        class="relative z-10 mx-auto max-w-2xl text-center text-base"
      >
        <h2 class="text-2xl font-bold tracking-tight text-white md:text-3xl">
          Sign up for our Newsletter for the latest Remix Jam news and updates
        </h2>
        <JamNewsletterSubscribeForm class="top-layer mt-12 flex flex-col items-center" />
      </aside>
    </>
  );
}
