import type { ManagedHeadTag } from "../ui/document-head.ts";

type SocialHeadTagsProps = {
  title?: string;
  description?: string;
  url: string;
  imageUrl: string;
  imageAlt?: string;
  twitterCreator?: string;
  twitterSite?: string;
};

export function createSocialHeadTags(props: SocialHeadTagsProps) {
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
    { kind: "meta", property: "og:url", content: props.url },
    { kind: "meta", property: "og:image", content: props.imageUrl },
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

  tags.push({ kind: "meta", name: "twitter:image", content: props.imageUrl });

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
