import { css, type Handle } from "remix/ui";
import { RemixLandingEnhancements } from "./public/remix-landing/landing-enhancements.tsx";
import { RUNNER_AVIF_SRC } from "./public/remix-landing/runner-media.ts";
import { colors } from "./public/remix-landing/styles/tokens.ts";
import { Document } from "../ui/document.tsx";
import { LandingContent } from "./home-landing-content.tsx";

type HomePageProps = {
  pageUrl: string;
  previewImage: string;
};

const HOME_TITLE = "Remix - The Fully-Stacked Web Framework";
const HOME_DESCRIPTION = "The fully-stacked web framework";

export function HomePage(handle: Handle<HomePageProps>) {
  return () => (
    <Document
      title={HOME_TITLE}
      description={HOME_DESCRIPTION}
      forceTheme="dark"
      stylesheets={["home"]}
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
      <div mix={[landingShellStyles]}>
        {/* Keep a stable host so this entry hydrates after document navigations. */}
        <div>
          <RemixLandingEnhancements />
        </div>
        <main mix={[landingContentStyles, cardGlassStyles]}>
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

const cardGlassStyles = css({
  "--glass-wash":
    "radial-gradient(ellipse 76% 68% at 12% -28%, color-mix(in srgb, var(--brand-cycle, #7ce95a) 7.8%, transparent) 0%, color-mix(in srgb, var(--brand-cycle, #7ce95a) 2.1%, transparent) 48%, transparent 76%), linear-gradient(145deg, rgba(10,27,48,.44), rgba(4,12,26,.24) 58%, rgba(2,7,16,.14))",
  "--glass-rim":
    "radial-gradient(ellipse 44% 135% at 12% 0%, color-mix(in srgb, var(--brand-cycle, #7ce95a) 27.5%, rgba(105,160,220,.13)) 0%, rgba(85,140,200,.075) 48%, transparent 82%), linear-gradient(180deg, rgba(95,150,215,.105), rgba(50,90,140,.04) 58%, rgba(70,120,175,.08))",
  "--glass-top-catch": "rgba(105,160,220,.2)",
  "--glass-side-catch": "rgba(55,105,165,.085)",
  "--glass-border-base": "rgba(95,145,205,.275)",
  "--glass-divider":
    "color-mix(in srgb, var(--brand-cycle, #7ce95a) 2.7%, rgba(82,130,185,.09))",
  "--glass-depth":
    "inset 0 0 42px rgba(255,255,255,.018), inset 0 0 0 2px rgba(0,0,0,.16), 0 32px 100px rgba(0,0,0,.24)",
  "& [data-home-card]": {
    position: "relative",
    borderColor: "var(--glass-border-base) !important",
    borderTopWidth: "1px !important",
    backgroundImage: "var(--glass-wash) !important",
    boxShadow:
      "inset 0 1px 0 var(--glass-top-catch), inset 1px 0 0 var(--glass-side-catch), var(--glass-depth)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: "0",
      zIndex: "1",
      padding: "1px",
      borderRadius: "inherit",
      background: "var(--glass-rim)",
      WebkitMask:
        "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
    },
  },
  "& [data-card-grid]": {
    borderTopColor: "var(--glass-divider) !important",
  },
  "& [data-card-item]": {
    borderColor: "var(--glass-divider) !important",
  },
});
