import { Document } from "../components/document";
import { Footer } from "../components/home/footer";
import { Header } from "../components/home/header";
import { HeroSection } from "../components/home/hero-section";
import { IntroMaskReveal } from "../components/home/intro-mask-reveal";
import { PitchSection } from "../components/home/pitch-section";
import { StayInTheLoopSection } from "../components/home/stay-in-the-loop-section";
import { TimelineSection } from "../components/home/timeline-section";
import { getRequestContext } from "../utils/request-context";
import { isAppFrameRequest, render } from "../utils/render";
import { CACHE_CONTROL } from "../shared/cache-control.ts";
import { DOCUMENT_THEME_META_NAME } from "../shared/document-theme";

const HOME_TITLE = "Remix - A Full Stack Framework Built on Web APIs";
const HOME_DESCRIPTION =
  "Remix 3 is under active development. Remix is a batteries-included, ultra-productive, zero dependency framework ready to use in a model-first world.";
const HOME_DOCUMENT_THEME = "light";

export async function homeHandler() {
  let request = getRequestContext().request;
  let requestUrl = new URL(request.url);
  let pageUrl = `${requestUrl.origin}/`;
  let previewImage = `${requestUrl.origin}/marketing/remix-3-thumbnail.jpg`;

  if (isAppFrameRequest(request)) {
    return render.frame(<HomePageFrame pageUrl={pageUrl} previewImage={previewImage} />, {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    });
  }

  return render.document(<Document forceTheme="light" appFrameSrc={request.url} />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function HomePageFrame() {
  return (props: { pageUrl: string; previewImage: string }) => (
    <>
      <meta name={DOCUMENT_THEME_META_NAME} content={HOME_DOCUMENT_THEME} />
      <title>{HOME_TITLE}</title>
      <meta name="description" content={HOME_DESCRIPTION} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={HOME_TITLE} />
      <meta property="og:description" content={HOME_DESCRIPTION} />
      <meta property="og:url" content={props.pageUrl} />
      <meta property="og:image" content={props.previewImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={HOME_TITLE} />
      <meta name="twitter:description" content={HOME_DESCRIPTION} />
      <meta name="twitter:image" content={props.previewImage} />
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
    </>
  );
}
