import { cx } from "../../../utils/cx.ts";
import type { Handle, RemixNode } from "remix/ui";
import { render } from "../../../utils/render.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { JamDocument } from "./document.tsx";
import { AddressMain, ScrambleText, SectionLabel, Title } from "./shared.tsx";
import { JamKeepsakes } from "../../../assets/jam/2025/keepsakes.tsx";
import { JamFadeInBadge } from "../../../assets/jam/2025/fade-in-badge.tsx";
import { JamNewsletterSubscribeForm } from "../../../assets/jam/2025/newsletter-subscribe.tsx";
import { assetPaths } from "../../../utils/asset-paths.ts";

type EventStatus = "before" | "live" | "after";

export async function jam2025Handler() {
  let eventStatus = getEventStatus();

  return render.document(
    <JamDocument
      title="Remix Jam 2025"
      description="It's time to get the band back together"
      previewImage={assetPaths.jam2025.ogThumbnail1}
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

// Toronto is on EDT (UTC-04:00) in October, so these are absolute instants for
// the event day. Comparing against Date.now() is timezone-independent and does
// not depend on the server's local timezone.
const EVENT_START = new Date("2025-10-10T00:00:00-04:00").getTime();
const EVENT_END = new Date("2025-10-10T18:00:00-04:00").getTime();

export function getEventStatus(now = Date.now()): EventStatus {
  if (now < EVENT_START) return "before";
  if (now < EVENT_END) return "live";
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
        <use href={`${assetPaths.iconsSprite}#fast-forward`} />
      </svg>
    </>
  ),
};

function Jam2025Page(handle: Handle<{ eventStatus: EventStatus }>) {
  return () => (
    <>
      <div class="relative z-30">
        <JamKeepsakes />
      </div>

      <main
        id="main-content"
        class="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[170px] text-center md:pt-[200px] lg:pt-[210px]"
        tabIndex={-1}
      >
        <SectionLabel>
          {sectionLabelText[handle.props.eventStatus]}
        </SectionLabel>
        <Title>
          <ScrambleText text="Remix Jam" delay={100} color="blue" />
          <span class="flex items-center justify-center gap-3 md:gap-5">
            <ScrambleText text="Toronto" delay={400} color="green" />
            <JamFadeInBadge
              delay={1200}
              class={cx(
                "flex items-center justify-center gap-2 md:gap-4",
                handle.props.eventStatus === "live"
                  ? "bg-red-brand text-white"
                  : "text-white ring-4 ring-inset ring-white md:ring-[6px]",
              )}
            >
              {badgeText[handle.props.eventStatus]}
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

        {handle.props.eventStatus === "before" ? (
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
