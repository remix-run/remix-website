import type { RemixNode } from "remix/component/jsx-runtime";
import { Frame } from "remix/component";

import clientAssets from "../assets/entry.ts?assets=client";
import { AppNavigation } from "../assets/app-navigation";
import documentAssets from "./document.tsx?assets=ssr";
import { APP_FRAME_NAME } from "../shared/app-navigation";
import {
  DOCUMENT_THEME_META_NAME,
  getDocumentThemeConfig,
} from "../shared/document-theme";
import iconsHref from "../shared/icons.svg";

import "../shared/styles/tailwind.css";
import "../shared/styles/bailwind.css";
import "../shared/styles/marketing.css";

let assets = clientAssets.merge(documentAssets);
let colorSchemeScript = `
  let media = window.matchMedia("(prefers-color-scheme: dark)");
  let sync = () => {
    document.documentElement.classList.toggle("dark", media.matches);
  };
  sync();
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", sync);
  } else if (typeof media.addListener === "function") {
    media.addListener(sync);
  }
`;

interface DocumentProps {
  title?: string;
  description?: string;
  noIndex?: boolean;
  forceTheme?: "dark" | "light";
  head?: RemixNode;
  appFrameSrc?: string;
  children?: RemixNode;
}

/**
 * Shared document shell for Remix 3 (remix/component) routes.
 *
 * Mirrors the essential <head> setup from the React Router root
 * (app/root.tsx) so migrated pages look consistent.
 *
 * CSS strategy (dev only for now):
 *   Vite's dev middleware serves `/remix/shared/styles/*.css` with full
 *   PostCSS/Tailwind processing, so plain <link> tags work.
 *   Production asset paths are TBD (see plan: asset-strategy).
 */
export function Document() {
  return ({
    title,
    description,
    noIndex,
    forceTheme,
    head,
    appFrameSrc,
    children,
  }: DocumentProps) => {
    let documentTheme = getDocumentThemeConfig(forceTheme);

    return (
      <html
        lang="en"
        data-theme={documentTheme.htmlDataTheme}
        class={documentTheme.htmlClass}
      >
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,viewport-fit=cover"
          />
          <meta name="theme-color" content="#121212" />
          <meta
            name={DOCUMENT_THEME_META_NAME}
            content={documentTheme.metaContent}
          />
          {noIndex ? <meta name="robots" content="noindex" /> : null}
          {description ? <meta name="description" content={description} /> : null}
          {title ? <title>{title}</title> : null}

          {/* Favicons */}
          <link rel="icon" href="/favicon-32.png" sizes="32x32" />
          <link rel="icon" href="/favicon-128.png" sizes="128x128" />
          <link rel="icon" href="/favicon-180.png" sizes="180x180" />
          <link rel="icon" href="/favicon-192.png" sizes="192x192" />
          <link rel="apple-touch-icon" href="/favicon-180.png" sizes="180x180" />

          {/* Font preloads */}
          <link
            rel="preload"
            as="font"
            href="/font/inter-roman-latin-var.woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            href="/font/inter-italic-latin-var.woff2"
            crossorigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            href="/font/jet-brains-mono.woff2"
            crossorigin="anonymous"
          />

          {/* Styles */}
          {assets.css.map(({ href }) => (
            <link key={href} rel="stylesheet" href={href} />
          ))}

          {/* RSS */}
          <link rel="alternate" type="application/rss+xml" href="/blog/rss.xml" />

          {/* Dark-mode detection (mirrors root.tsx ColorSchemeScript) */}
          {documentTheme.usesSystemThemeScript ? (
            <script innerHTML={colorSchemeScript} />
          ) : null}

          {/* Route-specific head elements */}
          {head}
        </head>

        <body class={documentTheme.bodyClass}>
          <img
            src={iconsHref}
            alt=""
            hidden
            // Preload icons sprite so <use href> references resolve (matches app/root.tsx)
            fetchpriority="high"
          />
          {appFrameSrc ? (
            <>
              <AppNavigation setup={{ frameName: APP_FRAME_NAME }} />
              <Frame name={APP_FRAME_NAME} src={appFrameSrc} />
            </>
          ) : (
            children
          )}
          {assets.js.map((asset) => (
            <link key={asset.href} rel="modulepreload" href={asset.href} />
          ))}
          <script type="module" src={assets.entry} />
        </body>
      </html>
    );
  };
}
