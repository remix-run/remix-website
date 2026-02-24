import type { RemixNode } from "remix/component/jsx-runtime";

import clientAssets from "../assets/entry.ts?assets=client";
import documentAssets from "./document.tsx?assets=ssr";

import "../../shared/tailwind.css";
import "../../shared/bailwind.css";
import "../../shared/marketing.css";

let assets = clientAssets.merge(documentAssets);
let isDev = import.meta.env.DEV;

interface DocumentProps {
  title: string;
  description?: string;
  noIndex?: boolean;
  head?: RemixNode;
  children?: RemixNode;
}

/**
 * Shared document shell for Remix 3 (remix/component) routes.
 *
 * Mirrors the essential <head> setup from the React Router root
 * (app/root.tsx) so migrated pages look consistent.
 *
 * CSS strategy (dev only for now):
 *   Vite's dev middleware serves `/shared/*.css` with full
 *   PostCSS/Tailwind processing, so plain <link> tags work.
 *   Production asset paths are TBD (see plan: asset-strategy).
 */
export function Document() {
  return ({ title, description, noIndex, head, children }: DocumentProps) => (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <meta name="theme-color" content="#121212" />
        {noIndex ? <meta name="robots" content="noindex" /> : null}
        {description ? <meta name="description" content={description} /> : null}
        <title>{title}</title>

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
        <script
          innerHTML={`let m=window.matchMedia("(prefers-color-scheme: dark)");if(m.matches)document.documentElement.classList.add("dark");`}
        />

        {isDev ? (
          <>
            {/*
              Dev-only stub for Vite's React fast-refresh preamble check.
              @vitejs/plugin-react injects a guard into transformed .tsx modules:
                if (!window.__vite_plugin_react_preamble_installed__) throw ...
              Since this HTML is streamed outside Vite's HTML transform pipeline,
              we set the flag manually in development.
            */}
            <script
              innerHTML={`
                window.$RefreshReg$ = () => {}
                window.$RefreshSig$ = () => (type) => type
                window.__vite_plugin_react_preamble_installed__ = true
              `}
            />
          </>
        ) : null}

        {/* Route-specific head elements */}
        {head}
      </head>

      <body class="flex min-h-screen w-full flex-col overflow-x-hidden bg-white text-gray-900 antialiased selection:bg-blue-200 selection:text-black dark:bg-gray-900 dark:text-gray-200 dark:selection:bg-blue-800 dark:selection:text-white">
        {children}
        {assets.js.map((asset) => (
          <link key={asset.href} rel="modulepreload" href={asset.href} />
        ))}
        <script type="module" src={assets.entry} />
      </body>
    </html>
  );
}
