import type { ManagedHeadTag } from "../ui/document-head.ts";
import { assetPaths } from "./asset-paths.ts";
import { createSocialHeadTags } from "./social-head-tags.ts";

type SocialHeadTagsProps = {
  requestUrl: string | URL;
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  twitterCreator?: string;
  twitterSite?: string;
};

export function getSocialHeadTags(props: SocialHeadTagsProps) {
  let requestUrl = new URL(props.requestUrl);
  let pageUrl = props.url ?? `${requestUrl.origin}${requestUrl.pathname}`;
  let imageUrl = resolveUrl(
    props.image ?? assetPaths.marketing.defaultOgImage,
    requestUrl,
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

function resolveUrl(value: string, requestUrl: URL) {
  if (/^https?:\/\//.test(value)) return value;

  return new URL(value, requestUrl).toString();
}
