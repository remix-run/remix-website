import { css } from "remix/component";
import { RemixLandingEnhancements } from "../../assets/remix-landing/landing-enhancements";
import { LoadingScreen } from "../../assets/remix-landing/components/loading-screen";
import { colors } from "../../assets/remix-landing/styles/tokens";
import { Document } from "../../ui/document";
import { styleHrefs } from "../../utils/style-hrefs";
import { LandingContent } from "./landing-content";

type HomePageProps = {
  pageUrl: string;
  previewImage: string;
};

const HOME_TITLE = "Remix - A Web Framework for Building Anything";
const HOME_DESCRIPTION =
  "Remix gives you the power and tools to build anything you can dream of.";

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

export function HomePage() {
  return (props: HomePageProps) => (
    <Document
      title={HOME_TITLE}
      description={HOME_DESCRIPTION}
      forceTheme="dark"
      stylesheets={[styleHrefs.home]}
      headTags={[
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
          content: props.previewImage,
        },
      ]}
    >
      <div id="remix-landing-app" mix={[landingShellStyles]}>
        <RemixLandingEnhancements />
        <main id="main-content" tabIndex={-1} mix={[landingContentStyles]}>
          <LandingContent />
        </main>
        <LoadingScreen />
      </div>
    </Document>
  );
}
