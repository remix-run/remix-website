import { css } from "remix/ui";

import { textBoxTrim } from "../ui/public/css-mixins.ts";
import { theme } from "../ui/public/theme.ts";
import { FeatureSection } from "./public/remix-landing/components/feature-section.tsx";
import { LandingFooter } from "./public/remix-landing/components/landing-footer.tsx";
import { LandingHero } from "./public/remix-landing/components/landing-hero.tsx";
import {
  colors,
  glowWhite,
  pageMaxWidth,
} from "./public/remix-landing/styles/tokens.ts";

const toolkitGroups = [
  {
    title: "Server & runtime",
    body: "Fetch-based HTTP servers and portable Web APIs that run across modern JavaScript runtimes.",
  },
  {
    title: "Routing & middleware",
    body: "Typed routes, controllers, request context, and composable middleware from one coherent model.",
  },
  {
    title: "Data & databases",
    body: "Runtime validation and typed relational data for SQLite, PostgreSQL, and MySQL.",
  },
  {
    title: "Auth & sessions",
    body: "Authentication, OAuth, cookies, sessions, storage adapters, and security middleware.",
  },
  {
    title: "UI framework, components & styling",
    body: "Server rendering, HTML-first Frames, composable styles, accessible components, forms, and animation.",
  },
  {
    title: "Assets & development",
    body: "On-demand TypeScript, JSX, and CSS compilation with HMR and a first-party CLI.",
  },
  {
    title: "Files & storage",
    body: "Streaming uploads, web-standard File APIs, local storage, and S3 integration.",
  },
  {
    title: "Testing & production",
    body: "A test framework, logging, compression, static files, and production server tooling.",
  },
] as const;

const differentiatorInlineCodeStyles = css({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "0.92em",
  color: "#ffffff",
});

const differentiators = [
  {
    title: "State is just JavaScript",
    body: "A component runs setup once, then returns a function that renders JSX. Keep state in ordinary JavaScript variables, objects, or classes rather than hooks or a prescribed state container.",
  },
  {
    title: "Updates are explicit",
    body: (
      <>
        Your code decides when the UI renders. Call{" "}
        <code mix={[differentiatorInlineCodeStyles]}>handle.update()</code>{" "}
        after changing state, and await it when your next step depends on the
        updated DOM.
      </>
    ),
  },
  {
    title: "Not everything needs a component",
    body: "Mixins attach reusable behavior di events, styles, refs, and accessibility behavior directly to individual elements. This keeps the markup intact without introducing another component.",
  },
  {
    title: "Client components with visible boundaries",
    body: "You define how hydrated client components map to browser code in the server runtime. The client boundary stays visible in your code.",
  },
  {
    title: "HTML over the wire",
    body: (
      <>
        Use <code mix={[differentiatorInlineCodeStyles]}>{"<Frame>"}</code> to
        update regions of a page independently with server-rendered HTML from
        ordinary routes.
      </>
    ),
  },
  {
    title: "HTTP is the interface",
    body: "Routes, middleware, assets, and integrations all use standard Request and Response objects for HTML, JSON, files, redirects, and more. The server contract stays portable and inspectable.",
  },
  {
    title: "Assets compile when requested",
    body: "Start your server immediately. TypeScript, JSX, and CSS compile on demand in development and production, so there is no application build step.",
  },
  {
    title: "Modules stay modules",
    body: "Native JavaScript modules and module preloads let the browser own loading and caching. Each module can be cached independently instead of invalidating an entire bundle.",
  },
] as const;

const storySections = [
  {
    id: "smaller-mental-model",
    title: "A bigger toolkit with a smaller mental model",
    body: "Building a complete web app shouldn't mean learning a different system at every layer. Remix gives you more of the stack with fewer concepts.",
    align: "left" as const,
    points: [
      {
        title: "Web APIs throughout",
        body: "Use standard requests, responses, streams, and files across the stack.",
      },
      {
        title: "Runtime-first",
        body: "Run source directly without making a bundler the center of the architecture.",
      },
      {
        title: "Composable packages",
        body: "Use the complete framework or adopt focused parts independently.",
      },
      {
        title: "One coherent model",
        body: "Server, data, UI, assets, and testing are designed to work together.",
      },
    ],
  },
  {
    id: "humans-and-agents",
    title: "Better for humans. Better for agents.",
    body: "Remix keeps the important parts of your app visible: standard Web APIs, explicit updates, runtime boundaries, and recognizable source modules. Humans and coding agents can trace how the system works and take control when the defaults aren't enough.",
    align: "right" as const,
    points: [
      {
        title: "Built to be understood",
        body: "Trace behavior through ordinary code and web standards instead of hidden framework machinery.",
      },
      {
        title: "Built to be changed",
        body: "Follow the defaults, replace a layer, or take control of the logic when your app needs it.",
      },
      {
        title: "Built for coding agents",
        body: "Remix skills teach agents the framework’s APIs, conventions, and workflows.",
      },
    ],
  },
  {
    id: "test-drive",
    title: "Take Remix for a test drive",
    body: "Build your first app with the step-by-step guide, then explore the API when you want to go deeper.",
    align: "left" as const,
    ctaLabel: "Get started",
    ctaHref: "https://guides.remix.run/start-here/",
    secondary: {
      title: "Stay in the loop",
      body: "Get a monthly update on releases, technical work, events, and what is coming next. No spam. Unsubscribe anytime.",
      newsletter: true,
    },
  },
];

export function LandingContent() {
  return () => (
    <>
      <LandingHero />
      <ToolkitSection />
      <FeatureSection {...storySections[0]} />
      <DifferentiatorSection />
      {storySections.slice(1).map((section) => (
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
          <h2 data-card-title="" mix={[differentiatorTitleStyles]}>
            Re-rethinking best practices
          </h2>
          <p mix={[differentiatorIntroStyles]}>
            Web frameworks have accumulated layers of complexity and indirection
            that now feel inevitable. Remix revisits those assumptions with APIs
            and boundaries you can follow all the way down to web standards.
          </p>
        </div>
        <ul data-card-grid="" mix={[differentiatorListStyles]}>
          {differentiators.map((item) => (
            <li
              key={item.title}
              data-card-item=""
              mix={[differentiatorItemStyles]}
            >
              <h3 mix={[differentiatorItemTitleStyles]}>{item.title}</h3>
              <p mix={[differentiatorItemBodyStyles]}>{item.body}</p>
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
  padding: "160px 0",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  "@media (max-width: 760px)": {
    padding: "128px 0",
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
  background: "rgba(0, 0, 0, 0.58)",
  overflow: "hidden",
});

const differentiatorHeaderStyles = css({
  padding: "48px 48px 32px",
  "@media (max-width: 760px)": {
    padding: "32px 24px 24px",
  },
});

const differentiatorTitleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: colors.fg,
  fontSize: "clamp(36px, 4vw, 54px)",
  lineHeight: "1.04",
  letterSpacing: "-0.025em",
  textShadow: glowWhite,
  textWrap: "balance",
  ...textBoxTrim,
  "@media (max-width: 760px)": {
    fontSize: "32px",
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
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  margin: "0",
  padding: "0",
  borderTop: "1px solid rgba(255, 255, 255, 0.12)",
  listStyle: "none",
  "@media (max-width: 760px)": {
    gridTemplateColumns: "1fr",
  },
});

const differentiatorItemStyles = css({
  boxSizing: "border-box",
  padding: "32px 48px",
  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  "&:nth-child(even)": {
    borderRight: "0",
  },
  "&:nth-last-child(-n + 2)": {
    paddingBottom: "48px",
    borderBottom: "0",
  },
  "@media (max-width: 760px)": {
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
  },
});

const differentiatorItemTitleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: "#ffffff",
  fontSize: "18px",
  lineHeight: "1.3",
  letterSpacing: "-0.015em",
  ...textBoxTrim,
  "@media (max-width: 760px)": {
    maxWidth: "none",
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

function ToolkitSection() {
  return () => (
    <section id="everything-you-need" mix={[toolkitShellStyles]}>
      <div data-home-card="" mix={[toolkitContentStyles]}>
        <div mix={[toolkitHeaderStyles]}>
          <h2 data-card-title="" mix={[toolkitTitleStyles]}>
            Everything you need, all in a single package
          </h2>
          <p mix={[toolkitIntroStyles]}>
            Remix provides the core systems you need to build, run, and maintain
            a modern web application. Use the complete framework or reach for
            individual packages when you need them.
          </p>
        </div>
        <div data-card-grid="" mix={[toolkitGridStyles]}>
          {toolkitGroups.map((group) => (
            <div key={group.title} data-card-item="" mix={[toolkitCardStyles]}>
              <h3 mix={[toolkitCardTitleStyles]}>{group.title}</h3>
              <p mix={[toolkitCardBodyStyles]}>{group.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        aria-hidden="true"
        data-package-logos-panel="true"
        mix={[packageLogoStageStyles]}
      />
    </section>
  );
}

const toolkitShellStyles = css({
  width: pageMaxWidth,
  minHeight: "100vh",
  scrollMarginTop: "clamp(72px, 10vh, 112px)",
  margin: "0 auto",
  padding: "160px 0",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  "@media (max-width: 760px)": {
    padding: "128px 0",
  },
});

const packageLogoStageStyles = css({
  width: "min(720px, 100%)",
  height: "clamp(720px, 64vw, 820px)",
  margin: "144px auto 0",
  flexShrink: "0",
  "@media (max-width: 760px)": {
    height: "680px",
    marginTop: "112px",
  },
});

const toolkitContentStyles = css({
  width: "min(840px, 100%)",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "0",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderTop: "3px solid var(--brand-cycle, #7ce95a)",
  borderRadius: "28px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: "rgba(0, 0, 0, 0.56)",
  overflow: "hidden",
});

const toolkitHeaderStyles = css({
  width: "100%",
  margin: "0",
  boxSizing: "border-box",
  padding: "48px 48px 32px",
  background: "transparent",
  textAlign: "left",
  "@media (max-width: 760px)": {
    padding: "32px 24px 24px",
  },
});

const toolkitTitleStyles = css({
  margin: "0",
  maxWidth: "720px",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: colors.fg,
  fontSize: "clamp(34px, 4vw, 52px)",
  lineHeight: "1.04",
  letterSpacing: "-0.025em",
  textShadow: glowWhite,
  textWrap: "balance",
  ...textBoxTrim,
  "@media (max-width: 760px)": {
    fontSize: "32px",
  },
});

const toolkitIntroStyles = css({
  maxWidth: "58ch",
  margin: "36px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: colors.fg,
  fontSize: "18px",
  lineHeight: "1.55",
  ...textBoxTrim,
});

const toolkitGridStyles = css({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "0",
  borderTop: "1px solid rgba(255, 255, 255, 0.12)",
  "@media (max-width: 760px)": {
    gridTemplateColumns: "1fr",
  },
});

const toolkitCardStyles = css({
  minHeight: "0",
  boxSizing: "border-box",
  padding: "32px 48px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  background: "transparent",
  "&:nth-child(odd)": {
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  },
  "&:nth-last-child(-n + 2)": {
    paddingBottom: "48px",
    borderBottom: "0",
  },
  "@media (max-width: 760px)": {
    padding: "24px",
    borderRight: "0",
    "&:nth-child(odd)": {
      borderRight: "0",
    },
    "&:nth-last-child(2)": {
      paddingBottom: "24px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    "&:last-child": {
      paddingBottom: "32px",
    },
  },
});

const toolkitCardTitleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: "#ffffff",
  fontSize: "18px",
  lineHeight: "1.3",
  letterSpacing: "-0.012em",
  ...textBoxTrim,
});

const toolkitCardBodyStyles = css({
  margin: "20px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: "rgba(255, 255, 255, 0.76)",
  fontSize: "16px",
  lineHeight: "1.5",
  ...textBoxTrim,
});
