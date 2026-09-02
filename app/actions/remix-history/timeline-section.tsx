import { css } from "remix/ui";

import {
  bodyMediumStyle,
  bodyOnDarkStyle,
  headingExtraLargeStyle,
} from "../../ui/public/marketing-styles.ts";
import { breakpointMedia, theme } from "../../ui/public/theme.ts";
import { TimelineDiagramDesktop } from "./timeline-section-desktop.tsx";
import { TimelineDiagramMobile } from "./timeline-section-mobile.tsx";

export function TimelineSection() {
  return () => (
    <section mix={timelineSectionStyle}>
      <div mix={timelineContentStyle}>
        <h2 mix={[headingExtraLargeStyle, timelineHeadingStyle]}>
          The story so far
        </h2>

        <div mix={mobileTimelineStyle}>
          <TimelineDiagramMobile />
        </div>

        <div mix={desktopTimelineStyle}>
          <TimelineDiagramDesktop mix={desktopDiagramStyle} />
        </div>

        <div mix={[bodyMediumStyle, bodyOnDarkStyle, timelineCopyStyle]}>
          <p>
            <a
              href="https://v2.remix.run/"
              mix={[timelineLinkStyle, remixLinkStyle]}
            >
              The first manifestation of Remix
            </a>{" "}
            was a feature branch of React Router: a full stack web framework
            that let you focus on the user interface and work back through web
            standards to deliver a fast, slick, and resilient user experience.
          </p>
          <p>
            We&apos;ve now merged Remix&apos;s features directly into{" "}
            <a
              href="https://reactrouter.com/"
              mix={[timelineLinkStyle, reactRouterLinkStyle]}
            >
              React Router
            </a>
            . If you&apos;re looking for a full stack, React-based framework
            built on Web APIs, check out React Router. We think it&apos;s the
            best way to ship React applications.
          </p>
          <p>
            <a
              href="https://github.com/remix-run/remix"
              mix={[timelineLinkStyle, remixThreeLinkStyle]}
            >
              Remix 3
            </a>{" "}
            is our latest full stack framework, built for immediate productivity
            whether you&apos;re using a fully agentic workflow or completely
            handwriting every line of code. Remix 3 is built on web APIs and
            composed of multiple single-purpose modules, packaged up to give you
            everything you need to build any kind of website. It&apos;s
            lightweight, simple to understand, and powerful to wield. If
            you&apos;ve ever wished for a development experience that feels
            lighter, faster, and more aligned with how the web works, Remix 3 is
            for you.
          </p>
        </div>

        <div mix={screenReaderOnlyStyle}>
          <h3>Timeline milestones</h3>
          <ul>
            <li>2017: React Router v4 released</li>
            <li>2019: React Router v5 released</li>
            <li>2020: React Router v6 released</li>
            <li>2021: Remix v1 released</li>
            <li>2023: Remix v2 released</li>
            <li>
              2024: React Router v7 released (Remix features merged into React
              Router)
            </li>
            <li>2025: Remix 3 released</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

let timelineSectionStyle = css({
  overflowX: "clip",
  background:
    "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-neutral-950) 70%, var(--rmx-neutral-750) 100%)",
  color: "#ffffff",
  [breakpointMedia.xl]: {
    background:
      "linear-gradient(180deg, var(--rmx-neutral-950) 0%, var(--rmx-neutral-950) 50%, var(--rmx-neutral-750) 100%)",
  },
});

let timelineContentStyle = css({
  display: "flex",
  width: "100%",
  maxWidth: "1400px",
  marginInline: "auto",
  flexDirection: "column",
  gap: "48px",
  paddingTop: "64px",
  [breakpointMedia.md]: { gap: "64px", paddingTop: "96px" },
});

let timelineHeadingStyle = css({
  color: "var(--rmx-neutral-100)",
  textAlign: "center",
});

let mobileTimelineStyle = css({
  [breakpointMedia.xl]: { display: "none" },
});

let desktopTimelineStyle = css({
  display: "none",
  overflow: "visible",
  [breakpointMedia.xl]: { display: "flex", justifyContent: "center" },
});

let desktopDiagramStyle = css({ flexShrink: 0 });

let timelineCopyStyle = css({
  width: "100%",
  maxWidth: "1024px",
  marginInline: "auto",
  paddingInline: "48px",
  paddingBottom: "64px",
  "& > * + *": { marginTop: "32px" },
  [breakpointMedia.md]: {
    paddingBottom: "96px",
    "& > * + *": { marginTop: "48px" },
  },
});

let timelineLinkStyle = css({
  fontWeight: theme.fontWeight.bold,
  "&:hover": { textDecoration: "underline" },
});

let remixLinkStyle = css({ color: "var(--rmx-highlight-blue)" });
let reactRouterLinkStyle = css({ color: "var(--rmx-highlight-red)" });
let remixThreeLinkStyle = css({ color: "var(--rmx-highlight-green)" });

let screenReaderOnlyStyle = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
});
