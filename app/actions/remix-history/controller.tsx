import { createController } from "remix/router";
import { css, type Handle } from "remix/ui";

import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { HeroSection } from "./hero-section.tsx";
import { IntroMaskReveal } from "./intro-mask-reveal.tsx";
import { PitchSection } from "./pitch-section.tsx";
import { StayInTheLoopSection } from "./stay-in-the-loop-section.tsx";
import { TimelineSection } from "./timeline-section.tsx";
import { theme } from "../../ui/public/theme.ts";
import { getSocialHeadTags } from "../../utils/social-head-tags.ts";
import { routes } from "../../routes.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";

export default createController(routes.remixHistory, {
  actions: {
    index({ render, request }) {
      return render(<RemixHistoryPage requestUrl={request.url} />, {
        headers: { "Cache-Control": CACHE_CONTROL.DEFAULT },
      });
    },
  },
});

function RemixHistoryPage(handle: Handle<{ requestUrl: string }>) {
  return () => (
    <Document
      title="The History of Remix"
      description="How Remix got here: a React Router feature branch that became a full stack framework, merged into React Router, and reimagined as Remix 3."
      forceTheme="light"
      headTags={getSocialHeadTags({
        requestUrl: handle.props.requestUrl,
        title: "The History of Remix",
        description:
          "How Remix got here: a React Router feature branch that became a full stack framework, merged into React Router, and reimagined as Remix 3.",
      })}
    >
      <div mix={historyPageStyle}>
        <div mix={heroBackgroundStyle}>
          <IntroMaskReveal />
          <Header />
          <HeroSection />
        </div>

        <main id="main-content" mix={historyMainStyle} tabIndex={-1}>
          <div mix={pitchBackgroundStyle}>
            <PitchSection />
          </div>

          <TimelineSection />

          <div mix={surfaceBackgroundStyle}>
            <StayInTheLoopSection />
            <Footer />
          </div>
        </main>
      </div>
    </Document>
  );
}

let historyPageStyle = css({
  "--rmx-text-primary": "#313539",
  "--rmx-text-secondary": "#63676b",
  "--rmx-text-tertiary": "#7c8084",
  "--rmx-neutral-50": theme.colors.neutral[50],
  "--rmx-neutral-100": theme.colors.neutral[100],
  "--rmx-neutral-200": theme.colors.neutral[200],
  "--rmx-neutral-750": theme.colors.neutral[750],
  "--rmx-neutral-950": theme.colors.neutral[950],
  "--rmx-highlight-blue": theme.colors.action.primary,
  "--rmx-highlight-green": "#06ea8a",
  "--rmx-highlight-red": "#d92c49",
  "--rmx-shade-blue": "#0b2f48",
  "--rmx-shade-green": "#024629",
  "--rmx-shade-red": "#410d16",
  "--rmx-intro-black-hold": "150ms",
  "--rmx-intro-black-fade": "400ms",
  "--rmx-intro-logo-duration": "1500ms",
  "--rmx-intro-logo-easing": "cubic-bezier(0.85, 0, 0.15, 1)",
  "--rmx-intro-logo-start": "700ms",
  "--rmx-intro-r-fade-duration": "600ms",
  "--rmx-hero-fade-delay": "1450ms",
  "--rmx-hero-fade-duration": "750ms",
  "@keyframes rmx-history-fade-in": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@keyframes rmx-history-fade-out": {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  "@keyframes rmx-history-intro-scale": {
    from: { transform: "translate(0, 0) scale(1)" },
    to: { transform: "translate(-55%, 100%) scale(80)" },
  },
  "@keyframes rmx-history-intro-reveal": {
    "0%": { visibility: "visible", opacity: 1 },
    "65%": { visibility: "visible", opacity: 1 },
    "100%": { visibility: "hidden", opacity: 0 },
  },
});

let heroBackgroundStyle = css({
  background:
    "linear-gradient(180deg, var(--rmx-neutral-200) 0%, var(--rmx-neutral-100) 30%, var(--rmx-neutral-50) 60%, #ffffff 100%)",
});

let historyMainStyle = css({
  display: "flex",
  flex: 1,
  flexDirection: "column",
});

let pitchBackgroundStyle = css({
  background: "linear-gradient(180deg, #ffffff 0%, var(--rmx-neutral-50) 100%)",
});

let surfaceBackgroundStyle = css({ background: theme.surface.lvl3 });
