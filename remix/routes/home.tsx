import { Document } from "../components/document";
import { Footer } from "../components/home/footer";
import { Header } from "../components/home/header";
import { HeroSection } from "../components/home/hero-section";
import { IntroMaskReveal } from "../components/home/intro-mask-reveal";
import { PitchSection } from "../components/home/pitch-section";
import { StayInTheLoopSection } from "../components/home/stay-in-the-loop-section";
import { TimelineSection } from "../components/home/timeline-section";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control.ts";

export default async function HomeRoute() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/`;
  let previewImage = `${requestUrl.origin}/marketing/remix-3-thumbnail.jpg`;

  return render.document(
    <HomePage pageUrl={pageUrl} previewImage={previewImage} />,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

function HomePage() {
  return (props: { pageUrl: string; previewImage: string }) => (
    <Document
      title="Remix - A Full Stack Framework Built on Web APIs"
      description="Remix 3 is under active development. Remix is a batteries-included, ultra-productive, zero dependency framework ready to use in a model-first world."
      forceTheme="light"
      head={
        <>
          <meta property="og:type" content="website" />
          <meta
            property="og:title"
            content="Remix - A Full Stack Framework Built on Web APIs"
          />
          <meta
            property="og:description"
            content="Remix 3 is under active development. Remix is a batteries-included, ultra-productive, zero dependency framework ready to use in a model-first world."
          />
          <meta property="og:url" content={props.pageUrl} />
          <meta property="og:image" content={props.previewImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Remix - A Full Stack Framework Built on Web APIs"
          />
          <meta
            name="twitter:description"
            content="Remix 3 is under active development. Remix is a batteries-included, ultra-productive, zero dependency framework ready to use in a model-first world."
          />
          <meta name="twitter:image" content={props.previewImage} />
        </>
      }
    >
      <div class="marketing-home">
        <div class="rmx-home-hero-bg">
          <IntroMaskReveal />
          <Header />
          <HeroSection />
        </div>

        <main class="flex flex-1 flex-col" tabIndex={-1}>
          <div class="rmx-home-text-bg">
            <PitchSection />
          </div>

          <TimelineSection />

          <div class="rmx-home-surface-bg">
            <StayInTheLoopSection />
            <Footer />
          </div>
        </main>
      </div>
    </Document>
  );
}
