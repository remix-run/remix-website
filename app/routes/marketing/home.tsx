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

export const handle = { forceTheme: "light" };

export function meta({ matches }: Route.MetaArgs) {
  let { siteUrl } = matches[0].loaderData;

  return getMeta({
    title: "Remix - A Full Stack Framework Built on Web APIs",
    description:
      "Remix 3 is under active development. Remix is a batteries-included, ultra-productive, zero dependency framework ready to use in a model-first world.",
    image: siteUrl ? `${siteUrl}/img/og.1.jpg` : undefined,
  });
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

        <TimelineSection />

        <div className="rmx-home-surface-bg">
          <StayInTheLoopSection />
          <Footer />
        </div>
      </main>
    </div>
  );
}
