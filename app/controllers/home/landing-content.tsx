import { FeatureSection } from "../../assets/remix-landing/components/feature-section.tsx";
import { LandingFooter } from "../../assets/remix-landing/components/landing-footer.tsx";
import { LandingHero } from "../../assets/remix-landing/components/landing-hero.tsx";

// TODO: consider how to cleanup this config mess
const storySections = [
  {
    id: "full-stack",
    kicker: "Cohesive frontend and backend",
    title: "Closing the gap between the initial spark and shipping",
    body: "Remix is the world's first truly full-stack JavaScript framework. It includes a server, router, data layer, UI components, testing, and much more. Everything you need to go from idea to launch in a single dependency.",
    align: "left" as const,
    packageLogosAnchor: true,
  },
  {
    id: "ai-ready",
    kicker: "Ready to build right out of the box",
    title: "Built for humans and models",
    body: "Remix ships with skills that help your AI agent learn the API and follow best practices. Whether you let the agent write all the code, or you tweak it by hand, Remix just works. It's one unified stack that speaks Remix end to end, not a patchwork of tools. When you want to change something, explain it in plain language. The framework stays out of your way.",
    align: "left" as const,
  },
  {
    id: "powerful-components",
    kicker: "The next generation of UI",
    title: "High-performance components in plain, beautiful JavaScript",
    body: "Remix components build on web primitives like EventTarget and avoid the runtime semantics of React hooks, giving you back normal JavaScript control flow and execution. This works seamlessly with the web, including web components and third-party libraries. Remix also provides native mixins for the DOM that make it easier than ever to compose and apply complex behavior on native platform elements.",
    align: "left" as const,
    codeSnippet: `import { type Handle, on } from 'remix/ui'
import { Glyph } from 'remix/ui/glyph'
import * as btn from 'remix/ui/button'


function CopyToClipboard(handle: Handle<{ url: string }>) {
  let state: "idle" | "copied" | "error" = "idle";

  return () => {
    let label =
      state === "idle"
        ? "Copy to clipboard"
        : state === "copied"
          ? "Copied"
          : "Error";

    return (
      <button
        aria-label={label}
        aria-live="polite"
        mix={[
          btn.secondaryStyle,
          on("click", async (_, signal) => {
            try {
              await navigator.clipboard.writeText(handle.props.url);
              if (signal.aborted) return;
            } catch (error) {
              state = "error";
              handle.update();
              return;
            }

            state = "copied";
            handle.update();
            setTimeout(() => {
              if (signal.aborted) return;
              state = "idle";
              handle.update();
            }, 2000);
          }),
        ]}
      >
        {state === "copied" ? (
          <Glyph name="check" />
        ) : (
          <Glyph name="clipboard" />
        )}
      </button>
    );
  };
}`,
  },
  {
    id: "use-cases",
    kicker: "One framework for any kind of project",
    title:
      "A store overnight.\nA business in a weekend. The app you always wanted to ship.",
    body: "Whatever you want to build, Remix can meet the project where it is. Start something new, grow it into a business, or bring Remix into an app that already exists. One technology, used in whatever way the project needs.",
    align: "right" as const,
  },
  {
    id: "start-building",
    kicker: "Describe the destination",
    title: "Building with Remix can take you there",
    body: "Remix 3 is currently available as a beta release.",
    align: "left" as const,
    ctaLabel: "Watch the repo",
    ctaHref: "https://github.com/remix-run/remix",
    ctaIcon: "eye" as const,
    secondary: {
      kicker: "Subscribe to our newsletter",
      title: "Stay in the loop",
      body: "Once a month, we write about everything in the world of Remix. Sign up to be notified about progress on Remix 3. No spam. Unsubscribe anytime.",
      newsletter: true,
      newsletterPlaceholder: "name@example.com",
      newsletterButtonLabel: "Subscribe",
    },
  },
];

export function LandingContent() {
  return () => (
    <>
      <LandingHero />
      {storySections.map((section) => (
        <FeatureSection
          key={section.id}
          id={section.id}
          kicker={section.kicker}
          title={section.title}
          body={section.body}
          align={section.align}
          packageLogosAnchor={
            "packageLogosAnchor" in section
              ? section.packageLogosAnchor
              : undefined
          }
          ctaLabel={section.ctaLabel}
          ctaHref={section.ctaHref}
          ctaIcon={section.ctaIcon}
          codeSnippet={section.codeSnippet}
          secondary={section.secondary}
        />
      ))}
      <LandingFooter />
    </>
  );
}
