import type { RemixNode } from "remix/component/jsx-runtime";

import { DocumentHeadSync } from "../assets/document-head-sync";
import { getAssetEntry } from "../middleware/asset-entry";
import { getManagedHeadTagKey, type ManagedHeadTag } from "./document-head";
import { assetPaths } from "../utils/asset-paths";
import { getRequestContext } from "../utils/request-context";
import { styleHrefs } from "../utils/style-hrefs";

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
  previewImage?: string;
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

/**
 * Shared document shell for Remix 3 (remix/component) routes.
 *
 * Mirrors the essential <head> setup from the React Router root
 * (app/root.tsx) so migrated pages look consistent.
 *
 * Plain stylesheet assets are compiled into `public/styles`.
 * Route code links to them through `app/utils/style-hrefs.ts`.
 */
export function Document() {
  return ({
    title,
    description,
    previewImage = assetPaths.brand.defaultOgImage,
    noIndex,
    forceTheme,
    headTags = [],
    children,
  }: DocumentProps) => {
    let assetEntry = getAssetEntry();
    let resolvedPreviewImage = resolvePreviewImage(previewImage);
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
      ...(noIndex
        ? []
        : getDefaultSocialHeadTags(
            { title, description, previewImage: resolvedPreviewImage },
            headTags,
          )),
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

          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link
            rel="icon"
            href="/favicon.svg"
            type="image/svg+xml"
            sizes="any"
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
          <link rel="preload" as="style" href={styleHrefs.app} />
          <link rel="preload" as="style" href={styleHrefs.md} />
          <link rel="preload" as="style" href={styleHrefs.jam} />
          {/* Styles */}
          <link rel="stylesheet" href={styleHrefs.app} />

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

          {assetEntry.preloads.map((href) => (
            <link key={href} rel="modulepreload" href={href} />
          ))}
          <script type="module" async src={assetEntry.src} />

          {/* Dark-mode detection (mirrors root.tsx ColorSchemeScript) */}
          <script innerHTML={colorSchemeScript} />
        </head>

        <body class={bodyClassName}>
          <a
            href="#main-content"
            class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:h-12 focus:items-center focus:rounded-lg focus:border focus:border-black/10 focus:bg-white focus:px-5 focus:text-black focus:shadow-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rmx-button-surface-primary)] dark:focus:border-white/10 dark:focus:bg-gray-900 dark:focus:text-white"
          >
            Skip to main content
          </a>
          <DocumentHeadSync
            title={title}
            forceTheme={forceTheme}
            bodyClassName={bodyClassName}
            headTags={managedHeadTags}
          />
          <img
            src={assetPaths.iconsSprite}
            alt=""
            hidden
            // Preload icons sprite so <use href> references resolve (matches app/root.tsx)
            fetchpriority="high"
          />
          {children}
        </body>
      </html>
    );
  };
}

function resolvePreviewImage(previewImage: string) {
  if (/^https?:\/\//.test(previewImage)) return previewImage;

  let { request } = getRequestContext();
  return new URL(previewImage, request.url).toString();
}

function getDefaultSocialHeadTags(
  props: Pick<DocumentProps, "title" | "description" | "previewImage">,
  headTags: ManagedHeadTag[],
): ManagedHeadTag[] {
  let tags: ManagedHeadTag[] = [];

  if (!hasManagedMeta(headTags, "property", "og:type")) {
    tags.push({ kind: "meta", property: "og:type", content: "website" });
  }

  if (props.title && !hasManagedMeta(headTags, "property", "og:title")) {
    tags.push({ kind: "meta", property: "og:title", content: props.title });
  }

  if (
    props.description &&
    !hasManagedMeta(headTags, "property", "og:description")
  ) {
    tags.push({
      kind: "meta",
      property: "og:description",
      content: props.description,
    });
  }

  if (props.previewImage && !hasManagedMeta(headTags, "property", "og:image")) {
    tags.push(
      { kind: "meta", property: "og:image", content: props.previewImage },
      { kind: "meta", property: "og:image:width", content: "1200" },
      { kind: "meta", property: "og:image:height", content: "630" },
    );
  }

  if (!hasManagedMeta(headTags, "name", "twitter:card")) {
    tags.push({
      kind: "meta",
      name: "twitter:card",
      content: "summary_large_image",
    });
  }

  if (props.title && !hasManagedMeta(headTags, "name", "twitter:title")) {
    tags.push({ kind: "meta", name: "twitter:title", content: props.title });
  }

  if (
    props.description &&
    !hasManagedMeta(headTags, "name", "twitter:description")
  ) {
    tags.push({
      kind: "meta",
      name: "twitter:description",
      content: props.description,
    });
  }

  if (
    props.previewImage &&
    !hasManagedMeta(headTags, "name", "twitter:image")
  ) {
    tags.push({
      kind: "meta",
      name: "twitter:image",
      content: props.previewImage,
    });
  }

  return tags;
}

function hasManagedMeta(
  headTags: ManagedHeadTag[],
  attribute: "name" | "property",
  value: string,
) {
  return headTags.some(
    (tag) => tag.kind === "meta" && tag[attribute] === value,
  );
}
