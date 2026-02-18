/** @jsxImportSource remix/component */
import { Document } from "./document";
import { render } from "./render";
import { Footer } from "./home/footer";
import { Header } from "./home/header";
import {
  HeroSection,
  IntroMaskReveal,
  PitchSection,
  StayInTheLoopSection,
  TimelineSection,
} from "./home";

export default async function HomePresentationalRoute(context?: {
  request?: Request;
}) {
  const requestUrl = new URL(
    context?.request?.url ?? "http://localhost:3000/remix-home-presentational",
  );
  const pageUrl = `${requestUrl.origin}/remix-home-presentational`;
  const previewImage = `${requestUrl.origin}/marketing/remix-3-thumbnail.jpg`;

  return render(
    <HomePresentationalPage pageUrl={pageUrl} previewImage={previewImage} />,
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}

function HomePresentationalPage() {
  return (props: { pageUrl: string; previewImage: string }) => (
    <Document
      title="Remix Home (Presentational Preview)"
      description="Phase 1 presentational migration preview for Remix home."
      noIndex
      head={
        <>
          <meta property="og:type" content="website" />
          <meta
            property="og:title"
            content="Remix Home (Presentational Preview)"
          />
          <meta
            property="og:description"
            content="Phase 1 presentational migration preview for Remix home."
          />
          <meta property="og:url" content={props.pageUrl} />
          <meta property="og:image" content={props.previewImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Remix Home (Presentational Preview)"
          />
          <meta
            name="twitter:description"
            content="Phase 1 presentational migration preview for Remix home."
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
