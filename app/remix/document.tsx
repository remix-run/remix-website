import type { RemixNode } from "remix/component/jsx-runtime";

interface DocumentProps {
  title: string;
  noIndex?: boolean;
  children?: RemixNode;
}

/**
 * Shared document shell for Remix 3 (remix/component) routes.
 *
 * Mirrors the essential <head> setup from the React Router root
 * (app/root.tsx) so migrated pages look consistent.
 *
 * CSS strategy (dev only for now):
 *   Vite's dev middleware serves `/app/styles/*.css` with full
 *   PostCSS/Tailwind processing, so plain <link> tags work.
 *   Production asset paths are TBD (see plan: asset-strategy).
 */
export function Document() {
  return ({ title, noIndex, children }: DocumentProps) => (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <meta name="theme-color" content="#121212" />
        {noIndex ? <meta name="robots" content="noindex" /> : null}
        <title>{title}</title>

        {/* Favicons */}
        <link rel="icon" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-128.png" sizes="128x128" />
        <link rel="icon" href="/favicon-180.png" sizes="180x180" />
        <link rel="icon" href="/favicon-192.png" sizes="192x192" />
        <link
          rel="apple-touch-icon"
          href="/favicon-180.png"
          sizes="180x180"
        />

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

        {/* Stylesheets — served by Vite in dev */}
        <link rel="stylesheet" href="/app/styles/tailwind.css" />
        <link rel="stylesheet" href="/app/styles/bailwind.css" />
        <link rel="stylesheet" href="/app/styles/marketing.css" />

        {/* RSS */}
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/blog/rss.xml"
        />

        {/* Dark-mode detection (mirrors root.tsx ColorSchemeScript) */}
        <script
          innerHTML={`let m=window.matchMedia("(prefers-color-scheme: dark)");if(m.matches)document.documentElement.classList.add("dark");`}
        />
      </head>

      <body class="flex min-h-screen w-full flex-col overflow-x-hidden antialiased selection:bg-blue-200 selection:text-black dark:selection:bg-blue-800 dark:selection:text-white bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-200">
        {children}
      </body>
    </html>
  );
}
