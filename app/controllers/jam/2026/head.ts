import type { ManagedHeadTag } from "../../../ui/document-head.ts";
import { assetPaths } from "../../../utils/asset-paths.ts";

export let jam2026HeadTags: ManagedHeadTag[] = [
  {
    kind: "link",
    rel: "apple-touch-icon",
    href: assetPaths.jam2026.favicons.appleTouchIcon,
  },
  {
    kind: "link",
    rel: "icon",
    href: assetPaths.jam2026.favicons.favicon32,
    sizes: "32x32",
    type: "image/png",
  },
  {
    kind: "link",
    rel: "icon",
    href: assetPaths.jam2026.favicons.favicon16,
    sizes: "16x16",
    type: "image/png",
  },
  {
    kind: "link",
    rel: "icon",
    href: assetPaths.jam2026.favicons.faviconIco,
    sizes: "any",
  },
];
