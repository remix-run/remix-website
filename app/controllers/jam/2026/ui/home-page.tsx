import { css, Frame, type Handle } from "remix/ui";
import { theme } from "remix/ui/theme";
import { FpsCounterToggle } from "../../../../assets/fps-counter-toggle.tsx";
import { Jam2026CloudBackdrop } from "../../../../assets/jam/2026/cloud-backdrop.tsx";
import { Jam2026Header } from "../../../../assets/jam/2026/header.tsx";
import { Jam2026NewsletterSignup } from "../../../../assets/jam/2026/newsletter-signup.tsx";
import { Jam2026PhotoMoments } from "../../../../assets/jam/2026/photo-moments.tsx";
import { Jam2026TicketsModalFrame } from "../../../../assets/jam/2026/tickets-modal.tsx";
import { routes } from "../../../../routes.ts";
import { Document } from "../../../../ui/document.tsx";
import { Footer } from "../../../../ui/footer.tsx";
import { getJam2026HeadContent } from "../head-content.ts";
import { getJam2026HeadTags } from "../head.server.ts";
import { jamTheme, jamThemeStyle, type Jam2026ThemeMode } from "../theme.ts";
import { ticketModalConfig } from "../tickets-modal-contract.ts";
import { Jam2026Faq } from "./faq.tsx";
import { Jam2026FloatingTicketCta } from "./floating-ticket-cta.tsx";
import { Jam2026Hero } from "./hero.tsx";

type Jam2026HomePageProps = {
  requestUrl: string;
  ticketsModalOpen?: boolean;
  ticketCheckout?: {
    availableForSale: boolean;
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
        <div class="jam-2026-page" mix={[jamThemeStyle, pageStyle]}>
          <Jam2026CloudBackdrop />
          <FpsCounterToggle dataAttribute="data-jam-2026-performance-tools" />
          <div
            id={ticketModalConfig.pageBackgroundId}
            aria-hidden={ticketsModalOpen ? "true" : undefined}
            inert={ticketsModalOpen || undefined}
            mix={pageBackgroundStyle}
          >
            <Jam2026Header initialTheme={handle.props.theme} />
            <main id="main-content" tabIndex={-1} mix={mainStyle}>
              <Jam2026Hero />
              <Jam2026PhotoMoments />
              <Jam2026FloatingTicketCta />
              <Jam2026Faq />
              <Jam2026NewsletterSignup />
            </main>
            <Footer mix={footerStyle} />
          </div>
          {ticketsModalOpen && handle.props.ticketCheckout?.error ? (
            <Jam2026TicketsModalFrame
              animateEntrance={false}
              open
              ticketCheckout={handle.props.ticketCheckout}
            />
          ) : (
            <Frame
              name={ticketModalConfig.frameName}
              src={
                ticketsModalOpen
                  ? routes.jam.y2026.ticket.index.href()
                  : routes.jam.y2026.index.href()
              }
            />
          )}
        </div>
      </Document>
    );
  };
}

let pageStyle = css({
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
});

let pageBackgroundStyle = css({
  display: "flex",
  minHeight: "100svh",
  flex: "1 1 auto",
  flexDirection: "column",
});

let mainStyle = css({
  width: "100%",
  marginInline: "auto",
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
});

let footerStyle = css({
  position: "relative",
  zIndex: 1,
  paddingTop: "40px",
  backgroundColor: jamTheme.surfaceRaised,
  color: jamTheme.ink,
});
