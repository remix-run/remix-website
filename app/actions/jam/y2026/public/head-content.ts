import type { ManagedHeadTag } from "../../../../ui/public/document/document-head.ts";
import { assetPaths } from "../../../../utils/public/asset-paths.ts";
import { getCanonicalPageUrls } from "../../../../utils/public/canonical-url.ts";
import { createSocialHeadTags } from "../../../../utils/public/social-head-tags.ts";
import { routes } from "../../../../routes.ts";

type Jam2026HeadContentProps = {
  ticketsModalOpen?: boolean;
};

type Jam2026HeadTagsProps = {
  title: string;
  description: string;
  pageUrl: string;
  imageUrl: string;
};

const JAM_2026_SHARE_IMAGE_ALT = "Remix Jam 2026 in Toronto";

export function getJam2026HeadContent(props: Jam2026HeadContentProps = {}) {
  let { ticketsModalOpen = false } = props;
  return ticketsModalOpen
    ? {
        title: "Remix Jam 2026 Tickets",
        description: "Get tickets for Remix Jam 2026 in Toronto.",
      }
    : {
        title: "Remix Jam 2026",
        description: "Remix Jam returns to Toronto on October 2, 2026.",
      };
}

function buildJam2026HeadTags(props: Jam2026HeadTagsProps) {
  return [
    { kind: "link", rel: "canonical", href: props.pageUrl },
    ...createSocialHeadTags({
      title: props.title,
      description: props.description,
      url: props.pageUrl,
      imageUrl: props.imageUrl,
      imageAlt: JAM_2026_SHARE_IMAGE_ALT,
    }),
    ...jam2026IconHeadTags,
  ] satisfies ManagedHeadTag[];
}

export function getJam2026ClientManagedHeadTags(head: {
  title: string;
  description: string;
}) {
  let urls =
    typeof window === "undefined"
      ? {
          pageUrl: routes.jam.y2026.index.href(),
          imageUrl: assetPaths.jam2026.shareImage,
        }
      : getCanonicalPageUrls(
          new URL(window.location.href),
          assetPaths.jam2026.shareImage,
        );

  return [
    { kind: "meta", name: "description", content: head.description },
    ...buildJam2026HeadTags({ ...head, ...urls }),
  ] satisfies ManagedHeadTag[];
}

export function getJam2026ServerHeadTags(props: {
  title: string;
  description: string;
  requestUrl: string | URL;
}) {
  return buildJam2026HeadTags({
    title: props.title,
    description: props.description,
    ...getCanonicalPageUrls(
      new URL(props.requestUrl),
      assetPaths.jam2026.shareImage,
    ),
  });
}

const jam2026IconHeadTags: ManagedHeadTag[] = [
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
