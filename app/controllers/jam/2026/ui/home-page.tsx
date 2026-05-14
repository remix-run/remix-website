import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { Document } from "../../../../ui/document.tsx";
import { Footer } from "../../../../ui/footer.tsx";
import { jamTheme, jamThemeStyle } from "../theme.ts";
import { Jam2026Faq } from "./faq.tsx";
import { Jam2026Header } from "./header.tsx";
import { Jam2026Hero } from "./hero.tsx";

export function Jam2026HomePage() {
  return () => (
    <Document
      title="Remix Jam 2026"
      description="Remix Jam returns to Toronto on October 1-2, 2026."
    >
      <div class="jam-2026-page" mix={[jamThemeStyle, pageStyle]}>
        <Jam2026Header />
        <main id="main-content" tabIndex={-1} mix={mainStyle}>
          <Jam2026Hero />
          <Jam2026Faq />
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

let footerStyle = css({
  backgroundColor: jamTheme.surfaceRaised,
  color: jamTheme.ink,
});
