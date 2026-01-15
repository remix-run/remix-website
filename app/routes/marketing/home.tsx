import { getMeta } from "~/lib/meta";
import { DocSearchModal } from "~/ui/docsearch";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";
import {
  HeroSection,
  IntroMaskReveal,
  PitchSection,
  StayInTheLoopSection,
  TimelineSection,
} from "~/ui/marketing/home";
import { CACHE_CONTROL } from "~/lib/http.server";
import type { Route } from "./+types/home";
import type { HeadersFunction } from "react-router";

export function meta({ matches }: Route.MetaArgs) {
  let { siteUrl } = matches[0].loaderData;
  let title = "Remix";
  let image = undefined;
  let description = "TODO: 2026 homepage meta description";

  return getMeta({ title, description, siteUrl, image });
}

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function HomePage() {
  return (
    <div className="marketing-home">
      <DocSearchModal />
      <div className="rmx-home-hero-bg">
        <IntroMaskReveal />
        <Header />
        <HeroSection />
      </div>

      <main className="flex flex-1 flex-col" tabIndex={-1}>
        <div className="rmx-home-text-bg">
          <PitchSection />
        </div>

        <div className="rmx-home-timeline-bg">
          <TimelineSection />
        </div>

        <div className="rmx-home-surface-bg">
          <StayInTheLoopSection />
          <Footer />
        </div>
      </main>
    </div>
  );
}
