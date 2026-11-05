import type { ManagedHeadTag } from "../ui/public/document/document-head.ts";
import { assetPaths } from "./public/asset-paths.ts";
import { getCanonicalPageUrls } from "./public/canonical-url.ts";
import { createSocialHeadTags } from "./public/social-head-tags.ts";

type SocialHeadTagsForRequestProps = {
  requestUrl: string | URL;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  twitterCreator?: string;
  twitterSite?: string;
};

/**
 * Social tags for a server-rendered page. The page URL defaults to the
 * request path, and the page and image URLs use the canonical origin so they
 * agree with the page's `<link rel="canonical">`.
 */
export function getSocialHeadTagsForRequest(
  props: SocialHeadTagsForRequestProps,
) {
  let canonical = getCanonicalPageUrls(
    new URL(props.requestUrl),
    props.image ?? assetPaths.marketing.defaultOgImage,
  );

  return createSocialHeadTags({
    title: props.title,
    description: props.description,
    url: props.url ?? canonical.pageUrl,
    imageUrl: canonical.imageUrl,
    imageAlt: props.imageAlt,
    twitterCreator: props.twitterCreator,
    twitterSite: props.twitterSite,
  }) satisfies ManagedHeadTag[];
}
