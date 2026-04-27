import { RemixLandingApp } from "../assets/remix-landing/home-app";
import { Document } from "../ui/document";
import { CACHE_CONTROL } from "../utils/cache-control";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";

let landingGlobalStyles = `
  @property --brand-cycle {
    syntax: "<color>";
    inherits: true;
    initial-value: #2dacf9;
  }

  @keyframes landing-brand-cycle {
    0% { --brand-cycle: #2dacf9; }
    20% { --brand-cycle: #7ce95a; }
    40% { --brand-cycle: #ffdf5f; }
    60% { --brand-cycle: #fa73da; }
    80% { --brand-cycle: #ff3c32; }
    100% { --brand-cycle: #2dacf9; }
  }

  :root {
    animation: landing-brand-cycle 10s linear infinite;
  }

  ::selection {
    background: var(--brand-cycle);
    color: #000;
  }

  #remix-landing-app :where(*) {
    all: revert-layer;
  }
`;

export async function homeHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/`;

  return render.document(<HomePage pageUrl={pageUrl} />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function HomePage() {
  return (props: { pageUrl: string }) => (
    <Document
      title="Remix - A Web Framework for Building Anything"
      description="Remix gives you the power and tools to build anything you can dream of."
      forceTheme="dark"
      headTags={[
        { kind: "meta", property: "og:type", content: "website" },
        {
          kind: "meta",
          property: "og:title",
          content: "Remix - A Web Framework for Building Anything",
        },
        {
          kind: "meta",
          property: "og:description",
          content:
            "Remix gives you the power and tools to build anything you can dream of.",
        },
        { kind: "meta", property: "og:url", content: props.pageUrl },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary",
        },
      ]}
    >
      <LandingGlobalStyles />
      <RemixLandingApp />
    </Document>
  );
}

function LandingGlobalStyles() {
  return () => <style innerHTML={landingGlobalStyles} />;
}
