import { Document } from "../../ui/document.tsx";
import { Footer } from "../../ui/footer.tsx";
import { Header } from "../../ui/header.tsx";
import { HeroSection } from "./hero-section.tsx";
import { IntroMaskReveal } from "./intro-mask-reveal.tsx";
import { PitchSection } from "./pitch-section.tsx";
import { StayInTheLoopSection } from "./stay-in-the-loop-section.tsx";
import { TimelineSection } from "./timeline-section/index.tsx";
import { getSocialHeadTags } from "../../utils/social-head-tags.server.ts";
import { render } from "../../utils/render.ts";
import { CACHE_CONTROL } from "../../utils/cache-control.ts";

export async function remix3ActiveDevelopmentHandler() {
  return render.document(<Remix3ActiveDevelopmentPage />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function Remix3ActiveDevelopmentPage() {
  return () => (
    <Document
      title="Remix - A Web Framework for Building Anything"
      description="Remix is a batteries-included, ultra-productive, zero dependencies and bundler-free framework, ready to develop with in a agent-first world."
      forceTheme="light"
      headTags={getSocialHeadTags({
        title: "Remix - A Web Framework for Building Anything",
        description:
          "Remix is a batteries-included, ultra-productive, zero dependencies and bundler-free framework, ready to develop with in a agent-first world.",
      })}
    >
      <div class="marketing-remix3-active-development">
        <div class="rmx-remix3-active-development-hero-bg">
          <IntroMaskReveal />
          <Header />
          <HeroSection />
        </div>

        <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
          <div class="rmx-remix3-active-development-text-bg">
            <PitchSection />
          </div>

          <TimelineSection />

          <div class="rmx-remix3-active-development-surface-bg">
            <StayInTheLoopSection />
            <Footer />
          </div>
        </main>
      </div>
    </Document>
  );
}
