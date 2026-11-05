import type { ManagedHeadTag } from "../ui/public/document-head.ts";
import { assetPaths } from "./public/asset-paths.ts";
import { getCanonicalOrigin } from "./public/canonical-url.ts";
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
  let requestUrl = new URL(props.requestUrl);
  let origin = getCanonicalOrigin(requestUrl);
  let pageUrl = props.url ?? `${origin}${requestUrl.pathname}`;
  let imageUrl = resolveUrl(
    props.image ?? assetPaths.marketing.defaultOgImage,
    origin,
  );

  return createSocialHeadTags({
    title: props.title,
    description: props.description,
    url: pageUrl,
    imageUrl,
    imageAlt: props.imageAlt,
    twitterCreator: props.twitterCreator,
    twitterSite: props.twitterSite,
  }) satisfies ManagedHeadTag[];
}

function resolveUrl(value: string, origin: string) {
  if (/^https?:\/\//.test(value)) return value;

  return new URL(value, origin).toString();
}
