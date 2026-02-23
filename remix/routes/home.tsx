import { Document } from "../components/document";
import { Footer } from "../components/home/footer";
import { Header } from "../components/home/header";
import { HeroSection } from "../components/home/hero-section";
import { IntroMaskReveal } from "../components/home/intro-mask-reveal";
import { PitchSection } from "../components/home/pitch-section";
import { StayInTheLoopSection } from "../components/home/stay-in-the-loop-section";
import { TimelineSection } from "../components/home/timeline-section";
import { render } from "../utils/render";

export default async function HomeRoute(context?: { request?: Request }) {
  const requestUrl = new URL(
    context?.request?.url ?? "http://localhost:3000/remix-home",
  );
  const pageUrl = `${requestUrl.origin}/remix-home`;
  const previewImage = `${requestUrl.origin}/marketing/remix-3-thumbnail.jpg`;

  return render(<HomePage pageUrl={pageUrl} previewImage={previewImage} />, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}

function HomePage() {
  return (props: { pageUrl: string; previewImage: string }) => (
    <Document
      title="Remix Home (Preview)"
      description="Homepage migration preview built with Remix."
      noIndex
      head={
        <>
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Remix Home (Preview)" />
          <meta
            property="og:description"
            content="Homepage migration preview built with Remix."
          />
          <meta property="og:url" content={props.pageUrl} />
          <meta property="og:image" content={props.previewImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Remix Home (Preview)" />
          <meta
            name="twitter:description"
            content="Homepage migration preview built with Remix."
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
