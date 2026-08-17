import { createController } from "remix/router";
import type { Handle } from "remix/ui";

import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { HeroSection } from "./hero-section.tsx";
import { IntroMaskReveal } from "./intro-mask-reveal.tsx";
import { PitchSection } from "./pitch-section.tsx";
import { StayInTheLoopSection } from "./stay-in-the-loop-section.tsx";
import { TimelineSection } from "./timeline-section.tsx";
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
      stylesheets={["app"]}
      headTags={getSocialHeadTags({
        requestUrl: handle.props.requestUrl,
        title: "The History of Remix",
        description:
          "How Remix got here: a React Router feature branch that became a full stack framework, merged into React Router, and reimagined as Remix 3.",
      })}
    >
      <div class="marketing-remix-history">
        <div class="rmx-remix-history-hero-bg">
          <IntroMaskReveal />
          <Header />
          <HeroSection />
        </div>

        <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
          <div class="rmx-remix-history-text-bg">
            <PitchSection />
          </div>

          <TimelineSection />

          <div class="rmx-remix-history-surface-bg">
            <StayInTheLoopSection />
            <Footer />
          </div>
        </main>
      </div>
    </Document>
  );
}
