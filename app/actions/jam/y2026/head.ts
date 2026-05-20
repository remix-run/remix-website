import type { ManagedHeadTag } from "../../../ui/document-head.ts";
import { assetPaths } from "../../../utils/asset-paths.ts";
import { getSocialHeadTags } from "../../../utils/social-head-tags.server.ts";

type Jam2026HeadTagsProps = {
  title: string;
  description: string;
};

export function getJam2026HeadTags(props: Jam2026HeadTagsProps) {
  return [
    ...getSocialHeadTags({
      title: props.title,
      description: props.description,
      image: assetPaths.jam2026.shareImage,
      imageAlt: "Remix Jam 2026 in Toronto",
    }),
    ...jam2026IconHeadTags,
  ];
}

let jam2026IconHeadTags: ManagedHeadTag[] = [
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
