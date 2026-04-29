import type { ManagedHeadTag } from "../ui/document-head";
import { assetPaths } from "./asset-paths";
import { getRequestContext } from "./request-context";

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
  let tags: ManagedHeadTag[] = [
    { kind: "meta", property: "og:type", content: "website" },
  ];

  if (props.title) {
    tags.push({ kind: "meta", property: "og:title", content: props.title });
  }

  if (props.description) {
    tags.push({
      kind: "meta",
      property: "og:description",
      content: props.description,
    });
  }

  tags.push(
    { kind: "meta", property: "og:url", content: pageUrl },
    { kind: "meta", property: "og:image", content: imageUrl },
    {
      kind: "meta",
      name: "twitter:card",
      content: "summary_large_image",
    },
  );

  if (props.title) {
    tags.push({ kind: "meta", name: "twitter:title", content: props.title });
  }

  if (props.description) {
    tags.push({
      kind: "meta",
      name: "twitter:description",
      content: props.description,
    });
  }

  tags.push({ kind: "meta", name: "twitter:image", content: imageUrl });

  if (props.imageAlt) {
    tags.push({
      kind: "meta",
      name: "twitter:image:alt",
      content: props.imageAlt,
    });
  }

  if (props.twitterCreator) {
    tags.push({
      kind: "meta",
      name: "twitter:creator",
      content: props.twitterCreator,
    });
  }

  if (props.twitterSite) {
    tags.push({
      kind: "meta",
      name: "twitter:site",
      content: props.twitterSite,
    });
  }

  return tags;
}

function getCurrentPageUrl() {
  let requestUrl = new URL(getRequestContext().request.url);
  return `${requestUrl.origin}${requestUrl.pathname}`;
}

function resolveUrl(value: string) {
  if (/^https?:\/\//.test(value)) return value;

  return new URL(value, getRequestContext().request.url).toString();
}
