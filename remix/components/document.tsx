import type { RemixNode } from "remix/component/jsx-runtime";
import { getContext } from "remix/async-context-middleware";

import { DocumentHeadSync } from "../assets/document-head-sync";
import {
  ICONS_SPRITE_HREF,
  MD_CSS_HREF,
  SITE_CSS_HREF,
} from "../constants/static-assets.ts";
import { getManagedHeadTagKey, type ManagedHeadTag } from "./document-head";
import { scriptEntryContextKey } from "../middleware/script-entry.ts";
import { scriptModuleHref } from "../utils/script-href.ts";

let colorSchemeScript = `
  let media = window.matchMedia("(prefers-color-scheme: dark)");
  let sync = () => {
    let theme = document.documentElement.dataset.theme;
    let isDark = theme === "dark" || (theme == null && media.matches);
    document.documentElement.classList.toggle("dark", isDark);
  };
  window.__remixSyncColorScheme = sync;
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
  headTags?: ManagedHeadTag[];
  children?: RemixNode;
}

declare global {
  interface Window {
    __remixSyncColorScheme?: () => void;
  }
}

function readScriptEntry() {
  try {
    let context = getContext();
    if (context.has(scriptEntryContextKey)) {
      return context.get(scriptEntryContextKey);
    }
  } catch {
    // No async request context (e.g. some test setups).
  }
  return {
    entrySrc: scriptModuleHref("remix/assets/entry.ts"),
    preloadHrefs: [] as string[],
  };
}

/**
 * Shared document shell for Remix 3 (remix/component) routes.
 *
 * Global styles come from `pnpm run build:css` (`/site.css`, `/md.css`). Jam routes
 * add `/jam.css` via `JamDocument` only — it overrides `body` background and must not
 * load on marketing/blog pages.
 * Interactive bundles are served by script-server (`/scripts/...`).
 */
export function Document() {
  return ({
    title,
    description,
    noIndex,
    forceTheme,
    headTags = [],
    children,
  }: DocumentProps) => {
    let { entrySrc, preloadHrefs } = readScriptEntry();

    let managedHeadTags: ManagedHeadTag[] = [
      ...(noIndex
        ? [{ kind: "meta" as const, name: "robots", content: "noindex" }]
        : []),
      ...(description
        ? [
            {
              kind: "meta" as const,
              name: "description",
              content: description,
            },
          ]
        : []),
      ...headTags,
    ];
    let bodyClassName = `flex min-h-screen w-full flex-col overflow-x-hidden antialiased selection:bg-blue-200 selection:text-black dark:selection:bg-blue-800 dark:selection:text-white ${
      forceTheme === "dark"
        ? "bg-gray-900 text-gray-200"
        : forceTheme === "light"
          ? "bg-white text-gray-900"
          : "bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-200"
    }`;

    return (
      <html
        lang="en"
        data-theme={forceTheme ?? undefined}
        class={forceTheme === "dark" ? "dark" : undefined}
      >
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,viewport-fit=cover"
          />
          <meta name="theme-color" content="#121212" />
          {title ? <title>{title}</title> : null}

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
          <link rel="preload" as="style" href={MD_CSS_HREF} />
          <link rel="stylesheet" href={SITE_CSS_HREF} />
          <link rel="stylesheet" href={MD_CSS_HREF} />

          {/* RSS */}
          <link
            rel="alternate"
            type="application/rss+xml"
            href="/blog/rss.xml"
          />

          {managedHeadTags.map((tag, index) =>
            tag.kind === "meta" ? (
              <meta
                key={getManagedHeadTagKey(tag, index)}
                data-remix-managed-head="true"
                name={tag.name}
                property={tag.property}
                content={tag.content}
              />
            ) : (
              <link
                key={getManagedHeadTagKey(tag, index)}
                data-remix-managed-head="true"
                rel={tag.rel}
                href={tag.href}
                type={tag.type}
                sizes={tag.sizes}
                as={tag.as}
                crossorigin={tag.crossorigin}
              />
            ),
          )}

          {/* Dark-mode detection (mirrors root.tsx ColorSchemeScript) */}
          <script innerHTML={colorSchemeScript} />
        </head>

        <body class={bodyClassName}>
          <DocumentHeadSync
            title={title}
            forceTheme={forceTheme}
            bodyClassName={bodyClassName}
            headTags={managedHeadTags}
          />
          <img
            src={ICONS_SPRITE_HREF}
            alt=""
            hidden
            // Preload icons sprite so <use href> references resolve (matches app/root.tsx)
            fetchpriority="high"
          />
          {children}
          {preloadHrefs.map((href) => (
            <link key={href} rel="modulepreload" href={href} />
          ))}
          <script type="module" src={entrySrc} />
        </body>
      </html>
    );
  };
}
