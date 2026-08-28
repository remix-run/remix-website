import * as fs from "node:fs";
import * as path from "node:path";
import { attrs, css, type Handle, type Props, type RemixNode } from "remix/ui";

import {
  getAssetEntry,
  type StylesheetName,
} from "../middleware/asset-entry.ts";
import { routes } from "../routes.ts";
import { DocumentSync } from "./public/document-sync.tsx";
import {
  getManagedHeadTagKey,
  type ManagedHeadTag,
  type ManagedLinkTag,
} from "./public/document-head.ts";
import { theme } from "./public/theme.ts";

// Inlined once per document so `<use href="#name">` icon references resolve
// immediately, with no separate sprite request or per-deploy URL plumbing.
let iconsSpriteHtml = fs.readFileSync(
  path.resolve(import.meta.dirname, "icons.svg"),
  "utf8",
);

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
    let { href: scriptHref, importMap, preloads } = assetEntry.scriptEntry;
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
    let priorityHeadTags = managedHeadTags.filter(
      (tag): tag is ManagedLinkTag =>
        tag.kind === "link" && tag.rel === "preload",
    );
    let otherHeadTags = managedHeadTags.filter(
      (tag) => tag.kind !== "link" || tag.rel !== "preload",
    );

    return (
      <html
        lang="en"
        data-theme={forceTheme}
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

          {/* Route-critical preloads belong before fonts and stylesheets so the
              browser can start fetching the LCP resource immediately. */}
          {priorityHeadTags.map((tag, index) => (
            <link
              key={getManagedHeadTagKey(tag, index)}
              data-rmx-key={getManagedHeadTagKey(tag, index)}
              data-remix-managed-head="true"
              rel={tag.rel}
              href={tag.href}
              type={tag.type}
              sizes={tag.sizes}
              imageSrcSet={tag.imageSrcSet}
              mix={
                tag.imageSizes
                  ? attrs({ imagesizes: tag.imageSizes })
                  : undefined
              }
              as={tag.as}
              crossorigin={tag.crossorigin}
              fetchpriority={tag.fetchpriority}
            />
          ))}

          {/* The normal Inter face is used above the fold on every page. Preload
              only this critical face; the browser discovers other variants from
              the declarations below if the page actually uses them. */}
          <link
            data-rmx-key="font-preload:inter-roman"
            rel="preload"
            href={assetEntry.fonts.interRoman.href}
            as="font"
            type="font/woff2"
            crossorigin="anonymous"
          />

          {/* Keep font declarations in the document head so they do not require
              an additional stylesheet discovery step. The Inter Fallback metrics
              normalize Arial's average width and vertical metrics to reduce CLS. */}
          <style
            key="fonts"
            data-rmx-key="fonts"
            data-remix-fonts=""
            data-rmx-preserve-dom=""
            innerHTML={`
              @font-face {
                font-family: "Inter";
                font-style: normal;
                font-weight: 100 900;
                font-display: swap;
                src: url("${assetEntry.fonts.interRoman.href}") format("woff2");
              }
              @font-face {
                font-family: "Inter";
                font-style: italic;
                font-weight: 100 900;
                font-display: swap;
                src: url("${assetEntry.fonts.interItalic.href}") format("woff2");
              }
              @font-face {
                font-family: "Inter Fallback";
                font-style: normal;
                src: local("Arial");
                ascent-override: 90.44%;
                descent-override: 22.52%;
                line-gap-override: 0%;
                size-adjust: 107.12%;
              }
              @font-face {
                font-family: "Inter Fallback";
                font-style: italic;
                src: local("Arial Italic");
                ascent-override: 90.44%;
                descent-override: 22.52%;
                line-gap-override: 0%;
                size-adjust: 107.12%;
              }
              @font-face {
                font-family: "JetBrains Mono";
                font-style: normal;
                font-weight: 100 800;
                font-display: swap;
                src: url("${assetEntry.fonts.jetBrainsMono.href}") format("woff2");
              }
            `}
          />

          {/* Keep persistent stylesheets attached across document diffs. */}
          {(Object.keys(assetEntry.stylesheets) as StylesheetName[]).map(
            (name) => (
              <link
                key={name}
                data-rmx-key={`stylesheet:${name}`}
                data-remix-stylesheet={name}
                data-rmx-preserve-dom=""
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

          {otherHeadTags.map((tag, index) =>
            tag.kind === "meta" ? (
              <meta
                key={getManagedHeadTagKey(tag, index)}
                data-rmx-key={getManagedHeadTagKey(tag, index)}
                data-remix-managed-head="true"
                name={tag.name}
                property={tag.property}
                content={tag.content}
              />
            ) : (
              <link
                key={getManagedHeadTagKey(tag, index)}
                data-rmx-key={getManagedHeadTagKey(tag, index)}
                data-remix-managed-head="true"
                rel={tag.rel}
                href={tag.href}
                type={tag.type}
                sizes={tag.sizes}
                imageSrcSet={tag.imageSrcSet}
                mix={
                  tag.imageSizes
                    ? attrs({ imagesizes: tag.imageSizes })
                    : undefined
                }
                as={tag.as}
                crossorigin={tag.crossorigin}
                fetchpriority={tag.fetchpriority}
              />
            ),
          )}

          <script type="importmap">{JSON.stringify(importMap)}</script>
          {preloads.map((href) => (
            <link
              key={href}
              data-rmx-key={`modulepreload:${href}`}
              rel="modulepreload"
              href={href}
            />
          ))}

          {/* Apply the system color scheme before first paint. */}
          <script innerHTML={colorSchemeScript} />
        </head>

        <body mix={documentBodyStyle}>
          <DocumentSync
            forceTheme={forceTheme}
            stylesheets={Array.from(stylesheetNames)}
          />
          {/* Inline so route-local theme resets emitted later cannot reveal the sprite. */}
          <div style={{ display: "none" }} innerHTML={iconsSpriteHtml} />
          {children}
          <script type="module" src={scriptHref} />
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
