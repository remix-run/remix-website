import { createController } from "remix/router";
import { css, type Handle, type RemixNode } from "remix/ui";

import { getSchedule } from "../../../data/jam-schedule.ts";
import { routes } from "../../../routes.ts";
import { CACHE_CONTROL } from "../../../utils/cache-control.ts";
import { NewsletterSubscribeFrameHost } from "../../../ui/public/newsletter-subscribe.tsx";
import { getNewsletterSubscriptionStatus } from "../../newsletter/subscription.tsx";
import { Jam2025CocPage } from "./coc.tsx";
import { Jam2025FaqPage } from "./faq.tsx";
import { Jam2025LineupPage } from "./lineup.tsx";
import { JamDocument } from "./document.tsx";
import {
  AddressMain,
  ScrambleText,
  SectionLabel,
  Title,
} from "./public/shared.tsx";
import { JamKeepsakes } from "./public/keepsakes.tsx";
import { JamFadeInBadge } from "./public/fade-in-badge.tsx";
import { JamNewsletterSubscribeForm } from "./public/newsletter-subscribe.tsx";
import { assetPaths } from "../../../utils/public/asset-paths.ts";
import { Icon } from "../../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../../ui/public/theme.ts";

type EventStatus = "before" | "live" | "after";

let cacheHeaders = { headers: { "Cache-Control": CACHE_CONTROL.DEFAULT } };

export default createController(routes.jam.y2025, {
  actions: {
    index({ render, request }) {
      return render(
        <JamDocument
          title="Remix Jam 2025"
          description="It's time to get the band back together"
          previewImage={assetPaths.jam2025.ogThumbnail1}
          requestUrl={request.url}
          activePath={routes.jam.y2025.index.href()}
        >
          <Jam2025Page eventStatus={getEventStatus()} />
        </JamDocument>,
        cacheHeaders,
      );
    },

    newsletterSignup({ render, request }) {
      return render(
        <JamNewsletterSubscribeForm
          status={getNewsletterSubscriptionStatus(request)}
        />,
        { headers: { "Cache-Control": "no-store" } },
      );
    },

    coc({ render, request }) {
      return render(<Jam2025CocPage requestUrl={request.url} />, cacheHeaders);
    },

    faq({ render, request }) {
      return render(<Jam2025FaqPage requestUrl={request.url} />, cacheHeaders);
    },

    async lineup({ render, request }) {
      return render(
        <Jam2025LineupPage
          requestUrl={request.url}
          schedule={await getSchedule()}
        />,
        cacheHeaders,
      );
    },
  },
});

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

function Jam2025Page(handle: Handle<{ eventStatus: EventStatus }>) {
  return () => (
    <>
      <div mix={keepsakesLayerStyle}>
        <JamKeepsakes />
      </div>

      <main id="main-content" mix={jamHomeMainStyle} tabIndex={-1}>
        <SectionLabel>
          {sectionLabelText[handle.props.eventStatus]}
        </SectionLabel>
        <Title>
          <ScrambleText text="Remix Jam" delay={100} color="blue" />
          <span mix={titleRowStyle}>
            <ScrambleText text="Toronto" delay={400} color="green" />
            <JamFadeInBadge
              delay={1200}
              live={handle.props.eventStatus === "live"}
            >
              {getBadgeText(handle.props.eventStatus)}
            </JamFadeInBadge>
          </span>
        </Title>

        <div mix={videoLayerStyle}>
          <div mix={videoFrameStyle}>
            <iframe
              mix={videoStyle}
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
            <div mix={locationStyle}>
              <AddressMain />
            </div>
          </>
        ) : null}
      </main>

      <div mix={newsletterSpacerStyle} />

      <aside id="newsletter" mix={newsletterSectionStyle}>
        <h2 mix={newsletterHeadingStyle}>
          Sign up for our Newsletter for the latest Remix Jam news and updates
        </h2>
        <NewsletterSubscribeFrameHost
          src={routes.jam.y2025.newsletterSignup.href()}
          mix={jamNewsletterFrameStyle}
        />
      </aside>
    </>
  );
}

function getBadgeText(eventStatus: EventStatus): RemixNode {
  if (eventStatus === "before") return "Event";
  if (eventStatus === "live") return "Live";
  return (
    <>
      Rewind
      <Icon name="fast-forward" mix={rewindIconStyle} aria-hidden="true" />
    </>
  );
}

let keepsakesLayerStyle = css({ position: "relative", zIndex: 30 });

let jamHomeMainStyle = css({
  display: "flex",
  maxWidth: "800px",
  marginInline: "auto",
  flexDirection: "column",
  alignItems: "center",
  gap: "48px",
  paddingBlock: "80px",
  paddingTop: "170px",
  textAlign: "center",
  [breakpointMedia.md]: { paddingTop: "200px" },
  [breakpointMedia.lg]: { paddingTop: "210px" },
});

let titleRowStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  [breakpointMedia.md]: { gap: "20px" },
});

let rewindIconStyle = css({
  width: "24px",
  height: "24px",
  transform: "rotate(180deg)",
  [breakpointMedia.md]: { width: "48px", height: "48px" },
  [breakpointMedia.lg]: { width: "56px", height: "56px" },
});

let videoLayerStyle = css({ zIndex: 10, width: "100%" });

let videoFrameStyle = css({
  position: "relative",
  width: "100%",
  overflow: "hidden",
  borderRadius: "8px",
  aspectRatio: "16 / 9",
});

let videoStyle = css({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
});

let locationStyle = css({
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  [breakpointMedia.md]: { gap: "32px" },
});

let newsletterSpacerStyle = css({ width: "100%", height: "100px" });

let newsletterSectionStyle = css({
  position: "relative",
  zIndex: 10,
  maxWidth: "672px",
  marginInline: "auto",
  fontSize: "1rem",
  textAlign: "center",
});

let newsletterHeadingStyle = css({
  color: "#ffffff",
  fontSize: "1.5rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.333,
  letterSpacing: "-0.025em",
  [breakpointMedia.md]: { fontSize: "1.875rem", lineHeight: 1.2 },
});

let jamNewsletterFrameStyle = css({ marginTop: "48px" });
