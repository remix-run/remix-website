import { css, type Handle } from "remix/ui";
import { FpsCounterToggle } from "../../assets/fps-counter-toggle.tsx";
import { RemixLandingEnhancements } from "../../assets/remix-landing/landing-enhancements.tsx";
import { LoadingScreen } from "../../assets/remix-landing/components/loading-screen.tsx";
import { RUNNER_AVIF_SRC } from "../../assets/remix-landing/runner-media.ts";
import { colors } from "../../assets/remix-landing/styles/tokens.ts";
import { Document } from "../../ui/document.tsx";
import { styleHrefs } from "../../utils/style-hrefs.ts";
import { LandingContent } from "./landing-content.tsx";

type HomePageProps = {
  pageUrl: string;
  previewImage: string;
};

const HOME_TITLE = "Remix - A Web Framework for Building Anything";
const HOME_DESCRIPTION =
  "Remix is a batteries-included, ultra-productive, zero dependencies and bundler-free framework, ready to develop with in a agent-first world.";

const landingShellStyles = css({
  position: "relative",
  minHeight: "100vh",
  background: colors.bg,
  color: colors.fg,
  overflowX: "clip",
});

const landingContentStyles = css({
  position: "relative",
  zIndex: "10",
});

export function HomePage(handle: Handle<HomePageProps>) {
  return () => (
    <Document
      title={HOME_TITLE}
      description={HOME_DESCRIPTION}
      forceTheme="dark"
      stylesheets={[styleHrefs.home]}
      headTags={[
        {
          kind: "link",
          rel: "preload",
          as: "image",
          href: RUNNER_AVIF_SRC,
          type: "image/avif",
          fetchpriority: "high",
        },
        { kind: "meta", property: "og:type", content: "website" },
        {
          kind: "meta",
          property: "og:title",
          content: HOME_TITLE,
        },
        {
          kind: "meta",
          property: "og:description",
          content: HOME_DESCRIPTION,
        },
        { kind: "meta", property: "og:url", content: handle.props.pageUrl },
        {
          kind: "meta",
          property: "og:image",
          content: handle.props.previewImage,
        },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          kind: "meta",
          name: "twitter:title",
          content: HOME_TITLE,
        },
        {
          kind: "meta",
          name: "twitter:description",
          content: HOME_DESCRIPTION,
        },
        {
          kind: "meta",
          name: "twitter:image",
          content: handle.props.previewImage,
        },
      ]}
    >
      <div id="remix-landing-app" mix={[landingShellStyles]}>
        <RemixLandingEnhancements />
        <FpsCounterToggle />
        <main id="main-content" tabIndex={-1} mix={[landingContentStyles]}>
          <LandingContent />
        </main>
        <LoadingScreen />
      </div>
    </Document>
  );
}
