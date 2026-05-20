import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { Jam2026Header } from "../../../assets/jam/2026/header.tsx";
import { Jam2026PhotoMoments } from "../../../assets/jam/2026/photo-moments.tsx";
import { Document } from "../../../ui/document.tsx";
import { Footer } from "../../../ui/footer.tsx";
import { getJam2026HeadTags } from "./head.ts";
import { jamTheme, jamThemeStyle } from "./theme.ts";
import { Jam2026Faq } from "./faq.tsx";
import { Jam2026FloatingTicketCta } from "./floating-ticket-cta.tsx";
import { Jam2026Hero } from "./hero.tsx";

export function Jam2026HomePage() {
  let title = "Remix Jam 2026";
  let description = "Remix Jam returns to Toronto on October 1-2, 2026.";

  return () => (
    <Document
      title={title}
      description={description}
      headTags={getJam2026HeadTags({ title, description })}
    >
      <div class="jam-2026-page" mix={[jamThemeStyle, pageStyle]}>
        <Jam2026Header />
        <main id="main-content" tabIndex={-1} mix={mainStyle}>
          <Jam2026Hero />
          <Jam2026PhotoMoments />
          <Jam2026FloatingTicketCta />
          <Jam2026Faq />
        </main>
        <Footer mix={footerStyle} />
      </div>
    </Document>
  );
}

let pageStyle = css({
  position: "relative",
  isolation: "isolate",
  display: "flex",
  minHeight: "100svh",
  flexDirection: "column",
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  "&::before": {
    content: '""',
    position: "fixed",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    background: `linear-gradient(180deg, ${jamTheme.skyTop} 0%, ${jamTheme.skyMiddle} 43%, ${jamTheme.skyHorizon} 72%, ${jamTheme.skyGround} 100%)`,
  },
});

let mainStyle = css({
  width: "100%",
  marginInline: "auto",
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
});

let footerStyle = css({
  backgroundColor: jamTheme.surfaceRaised,
  color: jamTheme.ink,
});
