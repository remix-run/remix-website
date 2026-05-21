import type { ManagedHeadTag } from "../ui/document-head.ts";
import { assetPaths } from "./asset-paths.ts";
import { getRequestContext } from "./request-context.ts";
import { createSocialHeadTags } from "./social-head-tags.ts";

type SocialHeadTagsProps = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  twitterCreator?: string;
  twitterSite?: string;
};

export function getSocialHeadTags(props: SocialHeadTagsProps) {
  let pageUrl = props.url ?? getCurrentPageUrl();
  let imageUrl = resolveUrl(props.image ?? assetPaths.marketing.defaultOgImage);

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

function getCurrentPageUrl() {
  let requestUrl = new URL(getRequestContext().request.url);
  return `${requestUrl.origin}${requestUrl.pathname}`;
}

function resolveUrl(value: string) {
  if (/^https?:\/\//.test(value)) return value;

  return new URL(value, getRequestContext().request.url).toString();
}
