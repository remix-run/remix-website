import { css, type Handle } from "remix/ui";

import { textBoxTrim } from "../ui/public/css-mixins.ts";
import { breakpointMedia, theme } from "../ui/public/theme.ts";
import { FeatureSection } from "./public/remix-landing/components/feature-section.tsx";
import { LandingFooter } from "./public/remix-landing/components/landing-footer.tsx";
import { LandingHero } from "./public/remix-landing/components/landing-hero.tsx";
import { StackExplorer } from "./public/remix-landing/components/stack-explorer.tsx";
import { landingContent } from "./public/remix-landing/landing-content.ts";
import type { StackExplorerCodeHighlights } from "./public/remix-landing/components/stack-explorer-content.tsx";
import {
  colors,
  glowWhite,
  pageMaxWidth,
} from "./public/remix-landing/styles/tokens.ts";

const differentiatorInlineCodeStyles = css({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.92em",
  color: "#ffffff",
});

type LandingContentProps = {
  explorerCodeHighlights?: StackExplorerCodeHighlights;
};

export function LandingContent(handle: Handle<LandingContentProps>) {
  return () => (
    <>
      <LandingHero />
      <StackExplorer codeHighlights={handle.props.explorerCodeHighlights} />
      <FeatureSection {...landingContent.storySections[0]} />
      <DifferentiatorSection />
      {landingContent.storySections.slice(1).map((section) => (
        <FeatureSection key={section.id} {...section} />
      ))}
      <LandingFooter />
    </>
  );
}

function DifferentiatorSection() {
  return () => (
    <section
      id="re-rethinking-best-practices"
      mix={[differentiatorShellStyles]}
    >
      <div data-home-card="" mix={[differentiatorContentStyles]}>
        <div mix={[differentiatorHeaderStyles]}>
          <h2 mix={[differentiatorTitleStyles]}>
            {landingContent.differentiators.title}
          </h2>
          <p mix={[differentiatorIntroStyles]}>
            {landingContent.differentiators.body}
          </p>
        </div>
        <ul data-card-grid="" mix={[differentiatorListStyles]}>
          {landingContent.differentiators.items.map((item) => (
            <li
              key={item.title}
              data-card-item=""
              mix={[differentiatorItemStyles]}
            >
              <h3 mix={[differentiatorItemTitleStyles]}>{item.title}</h3>
              <p mix={[differentiatorItemBodyStyles]}>
                {item.body.split(/`([^`]+)`/).map((part, index) =>
                  index % 2 === 0 ? (
                    part
                  ) : (
                    <code key={index} mix={[differentiatorInlineCodeStyles]}>
                      {part}
                    </code>
                  ),
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const differentiatorShellStyles = css({
  width: pageMaxWidth,
  minHeight: "100vh",
  margin: "0 auto",
  padding: "128px 0",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  [breakpointMedia.md]: {
    padding: "160px 0",
  },
});

const differentiatorContentStyles = css({
  width: "min(1040px, 100%)",
  margin: "0 auto",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderTop: "3px solid var(--brand-cycle, #7ce95a)",
  borderRadius: "28px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: colors.cardBg,
  overflow: "hidden",
});

const differentiatorHeaderStyles = css({
  padding: "32px 24px 24px",
  [breakpointMedia.md]: {
    padding: "48px 48px 32px",
  },
});

const differentiatorTitleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: colors.fg,
  fontSize: "32px",
  lineHeight: "1.04",
  letterSpacing: "-0.025em",
  textShadow: glowWhite,
  textWrap: "balance",
  ...textBoxTrim,
  [breakpointMedia.md]: {
    fontSize: "clamp(36px, 4vw, 54px)",
  },
});

const differentiatorIntroStyles = css({
  maxWidth: "760px",
  margin: "36px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: colors.fg,
  fontSize: "18px",
  lineHeight: "1.55",
  ...textBoxTrim,
});

const differentiatorListStyles = css({
  display: "grid",
  gridTemplateColumns: "1fr",
  margin: "0",
  padding: "0",
  borderTop: "1px solid rgba(255, 255, 255, 0.12)",
  listStyle: "none",
  [breakpointMedia.md]: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
});

const differentiatorItemStyles = css({
  boxSizing: "border-box",
  padding: "24px",
  borderRight: "0",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  "&:nth-last-child(2)": {
    paddingBottom: "24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  "&:last-child": {
    paddingBottom: "32px",
    borderBottom: "0",
  },
  [breakpointMedia.md]: {
    padding: "32px 48px",
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
    "&:nth-child(even)": {
      borderRight: "0",
    },
    "&:nth-last-child(-n + 2)": {
      paddingBottom: "48px",
      borderBottom: "0",
    },
  },
});

const differentiatorItemTitleStyles = css({
  maxWidth: "none",
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: "#ffffff",
  fontSize: "18px",
  lineHeight: "1.3",
  letterSpacing: "-0.015em",
  ...textBoxTrim,
  [breakpointMedia.md]: {
    maxWidth: "28ch",
  },
});

const differentiatorItemBodyStyles = css({
  margin: "20px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: "rgba(255, 255, 255, 0.76)",
  fontSize: "16px",
  lineHeight: "1.5",
  ...textBoxTrim,
});
