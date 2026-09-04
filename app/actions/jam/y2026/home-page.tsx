import { css, Frame, type Handle } from "remix/ui";
import { theme } from "../../../ui/public/theme.ts";
import { FpsCounterToggle } from "../../../ui/public/fps-counter-toggle.tsx";
import { Jam2026CloudBackdrop } from "./public/cloud-backdrop.tsx";
import { Jam2026Header } from "./public/header.tsx";
import { NewsletterSubscribeFrameHost } from "../../../ui/public/newsletter-subscribe.tsx";
import { Jam2026PhotoMoments } from "./public/photo-moments.tsx";
import { Jam2026TicketsModalFrame } from "./public/tickets-modal.tsx";
import { routes } from "../../../routes.ts";
import { Document } from "../../../ui/document.tsx";
import { Footer } from "../../../ui/footer.tsx";
import { getJam2026HeadContent } from "./public/head-content.ts";
import { getJam2026HeadTags } from "./head.ts";
import {
  jamTheme,
  jamThemeStyle,
  type Jam2026ThemeMode,
} from "./public/theme.ts";
import { ticketModalConfig } from "./public/tickets-modal-contract.ts";
import { Jam2026Faq } from "./faq.tsx";
import { Jam2026FloatingTicketCta } from "./floating-ticket-cta.tsx";
import { Jam2026Hero } from "./hero.tsx";
import { Jam2026Schedule } from "./schedule.tsx";
import type { getJam2026Schedule } from "../../../data/jam-schedule-2026.ts";

type Jam2026HomePageProps = {
  requestUrl: string;
  schedule: Awaited<ReturnType<typeof getJam2026Schedule>>;
  ticketsModalOpen?: boolean;
  ticketCheckout?: {
    availableForSale: boolean;
    discountCode?: string;
    error?: string;
    initialQuantity: number;
    maxQuantity: number;
    productId?: string;
  };
  theme?: Jam2026ThemeMode;
};

export function Jam2026HomePage(handle: Handle<Jam2026HomePageProps>) {
  return () => {
    let { ticketsModalOpen = false } = handle.props;
    let head = getJam2026HeadContent({ ticketsModalOpen });
    // Carry the discount code into the frame URL so the server-resolved modal
    // shows it on the first paint, before the cookie round-trips.
    let discountCode = handle.props.ticketCheckout?.discountCode;
    let ticketsFrameSrc = ticketsModalOpen
      ? routes.jam.y2026.ticket.index.href() +
        (discountCode ? `?discount=${encodeURIComponent(discountCode)}` : "")
      : routes.jam.y2026.index.href();

    return (
      <Document
        title={head.title}
        description={head.description}
        forceTheme={handle.props.theme}
        headTags={getJam2026HeadTags({
          ...head,
          requestUrl: handle.props.requestUrl,
        })}
      >
        <div
          mix={[
            jamThemeStyle,
            css({
              position: "relative",
              isolation: "isolate",
              display: "flex",
              minHeight: "100svh",
              flexDirection: "column",
              color: jamTheme.ink,
              fontFamily: theme.fontFamily.sans,
              overflowX: "clip",
              "&::before": {
                content: '""',
                position: "fixed",
                inset: 0,
                zIndex: -3,
                pointerEvents: "none",
                background: `linear-gradient(180deg, ${jamTheme.skyTop} 0%, ${jamTheme.skyMiddle} 43%, ${jamTheme.skyHorizon} 72%, ${jamTheme.skyGround} 100%)`,
              },
            }),
          ]}
        >
          <Jam2026CloudBackdrop />
          <FpsCounterToggle />
          <div
            id={ticketModalConfig.pageBackgroundId}
            aria-hidden={ticketsModalOpen ? "true" : undefined}
            inert={ticketsModalOpen || undefined}
            mix={css({
              display: "flex",
              minHeight: "100svh",
              flex: "1 1 auto",
              flexDirection: "column",
            })}
          >
            <Jam2026Header initialTheme={handle.props.theme} />
            <main
              tabIndex={-1}
              mix={css({
                width: "100%",
                marginInline: "auto",
                flex: "1 1 auto",
                display: "flex",
                flexDirection: "column",
              })}
            >
              <Jam2026Hero />
              <Jam2026PhotoMoments />
              <Jam2026FloatingTicketCta />
              <Jam2026Schedule items={handle.props.schedule} />
              <Jam2026Faq />
              <NewsletterSubscribeFrameHost
                src={routes.jam.y2026.newsletterSignup.href()}
              />
            </main>
            <Footer
              mix={css({
                position: "relative",
                zIndex: 1,
                paddingTop: "40px",
                backgroundColor: jamTheme.surfaceRaised,
                color: jamTheme.ink,
              })}
            />
          </div>
          <div>
            {ticketsModalOpen && handle.props.ticketCheckout?.error ? (
              <Jam2026TicketsModalFrame
                animateEntrance={false}
                open
                ticketCheckout={handle.props.ticketCheckout}
              />
            ) : (
              <Frame name={ticketModalConfig.frameName} src={ticketsFrameSrc} />
            )}
          </div>
        </div>
      </Document>
    );
  };
}
