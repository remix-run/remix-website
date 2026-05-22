import type { ManagedHeadTag } from "../../../ui/document-head.ts";
import { assetPaths } from "../../../utils/asset-paths.ts";
import { createSocialHeadTags } from "../../../utils/social-head-tags.ts";
import { styleHrefs } from "../../../utils/style-hrefs.ts";
import { routes } from "../../../routes.ts";

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
const JAM_2026_CANONICAL_ORIGIN = "https://remix.run";

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

export function getJam2026HeadTags(props: Jam2026HeadTagsProps) {
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
  let pageUrl: string = routes.jam.y2026.index.href();
  let imageUrl: string = assetPaths.jam2026.shareImage;

  if (typeof window !== "undefined") {
    let currentUrl = new URL(window.location.href);
    let trustedOrigin = getJam2026TrustedOrigin(currentUrl);
    pageUrl = `${trustedOrigin}${currentUrl.pathname}`;
    imageUrl = new URL(assetPaths.jam2026.shareImage, trustedOrigin).href;
  }

  return [
    { kind: "meta", name: "description", content: head.description },
    { kind: "link", rel: "stylesheet", href: styleHrefs.global },
    ...getJam2026HeadTags({
      ...head,
      pageUrl,
      imageUrl,
    }),
  ] satisfies ManagedHeadTag[];
}

export function getJam2026ServerHeadTags(props: {
  title: string;
  description: string;
  requestUrl: string;
}) {
  let requestUrl = new URL(props.requestUrl);
  let trustedOrigin = getJam2026TrustedOrigin(requestUrl);

  return getJam2026HeadTags({
    title: props.title,
    description: props.description,
    pageUrl: `${trustedOrigin}${requestUrl.pathname}`,
    imageUrl: new URL(assetPaths.jam2026.shareImage, trustedOrigin).toString(),
  });
}

function getJam2026TrustedOrigin(url: URL) {
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]"
  ) {
    return url.origin;
  }
  return JAM_2026_CANONICAL_ORIGIN;
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
