import { css, type Handle, type RemixNode } from "remix/ui";
import { theme } from "remix/ui/theme";

import { DocumentHeadSync } from "../assets/document-head-sync.tsx";
import { getAssetEntry } from "../middleware/asset-entry.ts";
import { getManagedHeadTagKey, type ManagedHeadTag } from "./document-head.ts";
import { assetPaths } from "../utils/asset-paths.ts";
import { styleHrefs } from "../utils/style-hrefs.ts";
import { RemixTheme } from "./theme.ts";

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
  stylesheets?: string[];
  children?: RemixNode;
}

declare global {
  interface Window {
    __remixSyncColorScheme?: () => void;
  }
}

/**
 * Shared document shell for Remix 3 UI routes.
 *
 * Mirrors the essential <head> setup from the React Router root
 * (app/root.tsx) so migrated pages look consistent.
 *
 * Plain stylesheet assets are compiled into `public/styles`.
 * Route code links to them through `app/utils/style-hrefs.ts`.
 */
export function Document(handle: Handle<DocumentProps>) {
  let { props } = handle;
  return () => {
    let {
      title,
      description,
      noIndex,
      forceTheme,
      headTags = [],
      stylesheets = [],
      children,
    } = props;
    let assetEntry = getAssetEntry();

    stylesheets = [...new Set([styleHrefs.global, ...stylesheets])];
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
      ...stylesheets.map((href) => ({
        kind: "link" as const,
        rel: "stylesheet",
        href,
      })),
      ...headTags,
    ];
    return (
      <html
        lang="en"
        data-theme={forceTheme ?? undefined}
        class={forceTheme === "dark" ? "dark" : undefined}
        style={{ colorScheme: forceTheme ?? "light dark" }}
      >
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,viewport-fit=cover"
          />
          <meta name="theme-color" content="#121212" />
          <RemixTheme.Style />
          {title ? <title>{title}</title> : null}

          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link
            rel="icon"
            href="/favicon.svg"
            type="image/svg+xml"
            sizes="any"
          />

          {Object.values(styleHrefs).map((href) => (
            <link key={href} rel="preload" as="style" href={href} />
          ))}

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
                fetchpriority={tag.fetchpriority}
              />
            ),
          )}

          {assetEntry.preloads.map((href) => (
            <link key={href} rel="modulepreload" href={href} />
          ))}
          <script type="module" async src={assetEntry.src} />

          {/* Dark-mode detection (mirrors root.tsx ColorSchemeScript) */}
          <script innerHTML={colorSchemeScript} />
        </head>

        <body mix={documentBodyStyle}>
          <DocumentHeadSync
            title={title}
            forceTheme={forceTheme}
            headTags={managedHeadTags}
          />
          <img
            src={assetPaths.iconsSprite}
            alt=""
            hidden
            // Inline so route-local theme resets emitted later cannot reveal the sprite.
            style={{ display: "none" }}
            // Preload icons sprite so <use href> references resolve.
            fetchpriority="high"
          />
          {children}
        </body>
      </html>
    );
  };
}

// These values intentionally mirror the old Tailwind body utilities so shared
// document chrome does not depend on app.css being loaded.
let documentBodyStyle = css({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  flexDirection: "column",
  overflowX: "hidden",
  backgroundColor: theme.surface.lvl0,
  color: theme.colors.text.primary,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  "&::selection": {
    backgroundColor: "light-dark(#bce0ff, #1747b6)",
    color: "light-dark(#000000, #ffffff)",
  },
});
