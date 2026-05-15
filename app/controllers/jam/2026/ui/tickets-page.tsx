import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { Jam2026Header } from "../../../../assets/jam-2026-header.tsx";
import { Document } from "../../../../ui/document.tsx";
import { Footer } from "../../../../ui/footer.tsx";
import { jamTheme, jamThemeStyle } from "../theme.ts";

export function Jam2026TicketsPage() {
  return () => (
    <Document
      title="Remix Jam 2026 Tickets"
      description="Remix Jam 2026 tickets are not available yet."
    >
      <div class="jam-2026-page" mix={[jamThemeStyle, pageStyle]}>
        <Jam2026Header />
        <main id="main-content" tabIndex={-1} mix={mainStyle}>
          <div mix={placeholderStyle}>
            <h1 mix={headingStyle}>Remix Jam 2026 Tickets</h1>
            <p mix={copyStyle}>Tickets are not available yet.</p>
          </div>
        </main>
        <Footer mix={footerStyle} />
      </div>
    </Document>
  );
}

let pageStyle = css({
  display: "flex",
  minHeight: "100svh",
  flexDirection: "column",
  backgroundColor: jamTheme.surface,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
});

let mainStyle = css({
  width: "100%",
  marginInline: "auto",
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
});

let placeholderStyle = css({
  maxWidth: "42rem",
  paddingBlock: "clamp(4rem, 12vw, 8rem)",
});

let headingStyle = css({
  margin: 0,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: "clamp(2.25rem, 7vw, 4rem)",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: theme.letterSpacing.tight,
  lineHeight: theme.lineHeight.tight,
});

let copyStyle = css({
  marginBlock: `${theme.space.lg} 0`,
  color: jamTheme.inkMuted,
  fontFamily: theme.fontFamily.sans,
  fontSize: "1.125rem",
  lineHeight: theme.lineHeight.relaxed,
});

let footerStyle = css({
  backgroundColor: jamTheme.surfaceRaised,
  color: jamTheme.ink,
});
