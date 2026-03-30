import { Document } from "../ui/document";
import { Footer } from "../ui/home/footer";
import { Header } from "../ui/home/header";
import { HeroSection } from "../ui/home/hero-section";
import { IntroMaskReveal } from "../ui/home/intro-mask-reveal";
import { PitchSection } from "../ui/home/pitch-section";
import { StayInTheLoopSection } from "../ui/home/stay-in-the-loop-section";
import { TimelineSection } from "../ui/home/timeline-section";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../shared/cache-control.ts";

export async function homeHandler() {
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
      headTags={[
        { kind: "meta", property: "og:type", content: "website" },
        {
          kind: "meta",
          property: "og:title",
          content: "Remix - A Full Stack Framework Built on Web APIs",
        },
        {
          kind: "meta",
          property: "og:description",
          content:
            "Remix 3 is under active development. Remix is a batteries-included, ultra-productive, zero dependency framework ready to use in a model-first world.",
        },
        { kind: "meta", property: "og:url", content: props.pageUrl },
        {
          kind: "meta",
          property: "og:image",
          content: props.previewImage,
        },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          kind: "meta",
          name: "twitter:title",
          content: "Remix - A Full Stack Framework Built on Web APIs",
        },
        {
          kind: "meta",
          name: "twitter:description",
          content:
            "Remix 3 is under active development. Remix is a batteries-included, ultra-productive, zero dependency framework ready to use in a model-first world.",
        },
        {
          kind: "meta",
          name: "twitter:image",
          content: props.previewImage,
        },
      ]}
    >
      <div class="marketing-home">
        <div class="rmx-home-hero-bg">
          <IntroMaskReveal />
          <Header />
          <HeroSection />
        </div>

        <main id="main-content" class="flex flex-1 flex-col" tabIndex={-1}>
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
