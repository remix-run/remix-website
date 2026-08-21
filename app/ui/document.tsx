import { css, type Handle, type Props, type RemixNode } from "remix/ui";

import {
  getAssetEntry,
  type StylesheetName,
} from "../middleware/asset-entry.ts";
import { routes } from "../routes.ts";
import { DocumentSync } from "./public/document-sync.tsx";
import {
  getManagedHeadTagKey,
  type ManagedHeadTag,
} from "./public/document-head.ts";
import { theme } from "./public/theme.ts";

let colorSchemeScript = `
  let media = window.matchMedia("(prefers-color-scheme: dark)");
  let sync = () => {
    let theme = document.documentElement.dataset.theme;
    let isDark = theme === "dark" || (theme == null && media.matches);
    document.documentElement.classList.toggle("dark", isDark);
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
  headTags?: ManagedHeadTag[];
  stylesheets?: StylesheetName[];
  mix?: Props<"html">["mix"];
  children?: RemixNode;
}

/**
 * Shared document shell for Remix UI routes.
 *
 * PostCSS generates stylesheet sources that are served by `remix/assets`.
 */
export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let {
      title,
      description,
      noIndex = false,
      forceTheme,
      headTags = [],
      stylesheets: requestedStylesheets = [],
      mix,
      children,
    } = handle.props;
    let assetEntry = getAssetEntry();
    let stylesheetNames = new Set<StylesheetName>(["global"]);
    for (let name of requestedStylesheets) stylesheetNames.add(name);

    let managedHeadTags: ManagedHeadTag[] = [];
    if (noIndex) {
      managedHeadTags.push({
        kind: "meta",
        name: "robots",
        content: "noindex",
      });
    }
    if (description) {
      managedHeadTags.push({
        kind: "meta",
        name: "description",
        content: description,
      });
    }
    managedHeadTags.push(...headTags);

    return (
      <html
        lang="en"
        data-theme={forceTheme}
        data-remix-icons-sprite={assetEntry.iconsSpriteHref}
        class={forceTheme === "dark" ? "dark" : undefined}
        style={{ colorScheme: forceTheme ?? "light dark" }}
        mix={mix}
      >
        <head>
          <meta charset="utf-8" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,viewport-fit=cover"
          />
          <meta name="theme-color" content="#121212" />
          {title ? <title>{title}</title> : null}

          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link
            rel="icon"
            href="/favicon.svg"
            type="image/svg+xml"
            sizes="any"
          />

          {/* Keep persistent stylesheets attached across document diffs. */}
          {(Object.keys(assetEntry.stylesheets) as StylesheetName[]).map(
            (name) => (
              <link
                key={name}
                data-key={`stylesheet:${name}`}
                data-remix-stylesheet={name}
                rmx-preserve-dom=""
                rel="stylesheet"
                href={assetEntry.stylesheets[name].href}
                media={stylesheetNames.has(name) ? undefined : "not all"}
              />
            ),
          )}

          {/* RSS */}
          <link
            rel="alternate"
            type="application/rss+xml"
            href={routes.blog.rss.href()}
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

          {/* Apply the system color scheme before first paint. */}
          <script innerHTML={colorSchemeScript} />
        </head>

        <body mix={documentBodyStyle}>
          <DocumentSync
            forceTheme={forceTheme}
            stylesheets={Array.from(stylesheetNames)}
          />
          <img
            src={assetEntry.iconsSpriteHref}
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
