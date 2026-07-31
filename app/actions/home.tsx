import { css, type Handle } from "remix/ui";
import { FpsCounterToggle } from "../ui/public/fps-counter-toggle.tsx";
import { RemixLandingEnhancements } from "./public/remix-landing/landing-enhancements.tsx";
import { LoadingScreen } from "./public/remix-landing/components/loading-screen.tsx";
import { RUNNER_AVIF_SRC } from "./public/remix-landing/runner-media.ts";
import { colors } from "./public/remix-landing/styles/tokens.ts";
import { Document } from "../ui/document.tsx";
import { styleHrefs } from "../utils/public/style-hrefs.ts";
import { LandingContent } from "./home-landing-content.tsx";

type HomePageProps = {
  pageUrl: string;
  previewImage: string;
};

const HOME_TITLE = "Remix - A Web Framework for Building Anything";
const HOME_DESCRIPTION =
  "Remix is a batteries-included, ultra-productive, zero dependencies and bundler-free framework, ready to develop with in a agent-first world.";

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
      <LoadingScreen />
      <div id="remix-landing-app" mix={[landingShellStyles]}>
        {/* Keep the initially-empty landing enhancements client entry inside
            a stable element so Remix document navigations can hydrate it after
            diffing in from Jam pages. Without the host, the loading screen can
            remain visible forever on client-side transitions to /. */}
        <div>
          <RemixLandingEnhancements />
        </div>
        <FpsCounterToggle />
        <main id="main-content" tabIndex={-1} mix={[landingContentStyles]}>
          <LandingContent />
        </main>
      </div>
    </Document>
  );
}

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
