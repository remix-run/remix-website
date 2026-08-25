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
    title: "UI & interaction",
    body: "Server rendering, HTML-first Frames, accessible components, forms, and animation.",
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
    body: "A component runs its setup once, then returns a function that renders JSX. Store state however you like in ordinary JavaScript variables—without hooks or a reactive state system.",
  },
  {
    title: "Rendering is explicit",
    body: (
      <>
        Changing state doesn&apos;t trigger rendering. Store it however you
        like, then call{" "}
        <code mix={[differentiatorInlineCodeStyles]}>handle.update()</code> when
        the UI should change. You decide when state reaches the screen.
      </>
    ),
  },
  {
    title: "Not everything needs a component",
    body: "Mixins attach reusable behavior directly to individual elements—events, styles, refs, and accessibility—without changing the markup or introducing another component.",
  },
  {
    title: "Client components, without the bundler magic",
    body: "Your server runtime decides how hydrated client components map to browser code—without a bundler hiding the boundary from you.",
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
    title: "HTTP stays HTTP",
    body: "Routes receive standard Requests and return standard Responses—HTML, JSON, files, redirects, or anything else. The server contract stays portable and inspectable.",
  },
  {
    title: "Assets compile when requested",
    body: "Start your server immediately. TypeScript, JSX, and CSS compile only when requested, in development and production—no application build step required.",
  },
  {
    title: "Modules stay modules",
    body: "Native JavaScript modules, Import Maps, and module preloads let the browser own loading and caching. Each module can be cached independently instead of invalidating an entire bundle.",
  },
] as const;

const storySections = [
  {
    id: "ai-ready",
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
    id: "use-cases",
    title: "Better for humans. Better for agents.",
    body: "Remix keeps the important parts of your app visible: standard Web APIs, explicit updates, runtime boundaries, and source modules that stay recognizable. Humans can reason about the system, agents can change it with confidence, and both can take control when the defaults aren't enough.",
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
    ],
  },
  {
    id: "start-building",
    title: "Take Remix for a test drive",
    body: "Remix 3 is available in beta. Build your first app with the step-by-step guides, then explore the API when you want to go deeper.",
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
    <section id="powerful-components" mix={[differentiatorShellStyles]}>
      <div mix={[differentiatorContentStyles]}>
        <div mix={[differentiatorHeaderStyles]}>
          <h2 mix={[differentiatorTitleStyles]}>
            Re-rethinking best practices
          </h2>
          <p mix={[differentiatorIntroStyles]}>
            The web framework playbook has accumulated layers of complexity and
            indirection that are now treated as inevitable. Remix revisits those
            assumptions with explicit APIs, visible boundaries, and web
            standards you can follow all the way down.
          </p>
        </div>
        <ul mix={[differentiatorListStyles]}>
          {differentiators.map((item) => (
            <li key={item.title} mix={[differentiatorItemStyles]}>
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
  padding: "112px 0",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
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
  padding: "52px 48px 48px",
  "@media (max-width: 760px)": {
    padding: "32px 24px",
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
  margin: "32px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: colors.fg,
  fontSize: "18px",
  lineHeight: "1.55",
  ...textBoxTrim,
  "@media (max-width: 760px)": {
    marginTop: "24px",
  },
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
  minHeight: "220px",
  boxSizing: "border-box",
  padding: "42px 48px 44px",
  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  "&:nth-child(even)": {
    borderRight: "0",
  },
  "&:nth-last-child(-n + 2)": {
    borderBottom: "0",
  },
  "@media (max-width: 760px)": {
    minHeight: "0",
    padding: "36px 24px 38px",
    borderRight: "0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    "&:nth-last-child(2)": {
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    "&:last-child": {
      borderBottom: "0",
    },
  },
});

const differentiatorItemTitleStyles = css({
  maxWidth: "24ch",
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: "#ffffff",
  fontSize: "24px",
  lineHeight: "1.3",
  letterSpacing: "-0.015em",
  ...textBoxTrim,
  "@media (max-width: 760px)": {
    maxWidth: "none",
    fontSize: "20px",
    lineHeight: "1.3",
  },
});

const differentiatorItemBodyStyles = css({
  margin: "18px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: "rgba(255, 255, 255, 0.76)",
  fontSize: "16px",
  lineHeight: "1.5",
  ...textBoxTrim,
});

function ToolkitSection() {
  return () => (
    <section id="full-stack" mix={[toolkitShellStyles]}>
      <div mix={[toolkitContentStyles]}>
        <div mix={[toolkitHeaderStyles]}>
          <h2 mix={[toolkitTitleStyles]}>
            Everything you need, all in one framework
          </h2>
          <p mix={[toolkitIntroStyles]}>
            Remix brings together the core systems you need to build, run, and
            maintain a modern web application. Use the complete framework or
            reach for individual packages when you need them.
          </p>
        </div>
        <div mix={[toolkitGridStyles]}>
          {toolkitGroups.map((group) => (
            <div key={group.title} mix={[toolkitCardStyles]}>
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
  padding: "112px 0",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
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
  padding: "52px 48px 48px",
  background: "transparent",
  textAlign: "left",
  "@media (max-width: 760px)": {
    padding: "36px 24px 32px",
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
  margin: "28px 0 0",
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
  padding: "38px 48px 42px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  background: "transparent",
  "&:nth-child(odd)": {
    borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  },
  "&:nth-last-child(-n + 2)": {
    borderBottom: "0",
  },
  "@media (max-width: 760px)": {
    padding: "30px 24px 34px",
    borderRight: "0",
    "&:nth-child(odd)": {
      borderRight: "0",
    },
    "&:nth-last-child(2)": {
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
});

const toolkitCardTitleStyles = css({
  margin: "0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.bold,
  color: "#ffffff",
  fontSize: "20px",
  lineHeight: "1.2",
  letterSpacing: "-0.012em",
  ...textBoxTrim,
});

const toolkitCardBodyStyles = css({
  margin: "16px 0 0",
  fontFamily: theme.fontFamily.sans,
  fontWeight: theme.fontWeight.normal,
  color: "rgba(255, 255, 255, 0.76)",
  fontSize: "16px",
  lineHeight: "1.5",
  ...textBoxTrim,
});
