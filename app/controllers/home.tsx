import { Document } from "../ui/document";
import { RemixLandingApp } from "../assets/remix-landing/home-app";
import { CACHE_CONTROL } from "../utils/cache-control";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";

const HOME_TITLE = "Remix - A Web Framework for Building Anything";
const HOME_DESCRIPTION =
  "Remix gives you the power and tools to build anything you can dream of.";

const landingGlobalStyles = `
  @property --brand-cycle {
    syntax: '<color>';
    inherits: true;
    initial-value: #2dacf9;
  }

  @keyframes brand-cycle {
    0%   { --brand-cycle: #2dacf9; }
    20%  { --brand-cycle: #7ce95a; }
    40%  { --brand-cycle: #ffdf5f; }
    60%  { --brand-cycle: #fa73da; }
    80%  { --brand-cycle: #ff3c32; }
    100% { --brand-cycle: #2dacf9; }
  }

  :root {
    color-scheme: dark;
    animation: brand-cycle 10s linear infinite;
  }

  html,
  body {
    min-height: 100%;
    margin: 0;
    background: #000;
    color: #dee2e6;
  }

  body {
    overflow-x: hidden;
    font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body > a[href="#main-content"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  body > a[href="#main-content"]:focus {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 100;
    width: auto;
    height: 48px;
    margin: 0;
    padding: 0 20px;
    clip: auto;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    background: #fff;
    color: #000;
    outline: 2px solid var(--brand-cycle);
    outline-offset: 2px;
    text-decoration: none;
  }

  ::selection {
    background: var(--brand-cycle);
    color: #000;
  }
`;

export async function homeHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/`;
  let previewImage = `${requestUrl.origin}/blog-images/social-background.png`;

  return render.document(
    <HomePage pageUrl={pageUrl} previewImage={previewImage} />,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

function HomePage() {
  return (props: { pageUrl: string; previewImage: string }) => (
    <Document
      title={HOME_TITLE}
      description={HOME_DESCRIPTION}
      forceTheme="dark"
      includeDefaultStyles={false}
      headStyles={[landingGlobalStyles]}
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
        {
          kind: "link",
          rel: "icon",
          href: "/landing/favicon-dark-mode.svg",
          type: "image/svg+xml",
        },
        {
          kind: "link",
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          kind: "link",
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          kind: "link",
          rel: "preload",
          as: "style",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",
        },
        {
          kind: "link",
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",
        },
      ]}
    >
      <RemixLandingApp />
    </Document>
  );
}
