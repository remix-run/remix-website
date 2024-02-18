import type { MetaArgs } from "@remix-run/node";
import type { V1_MetaDescriptor } from "@remix-run/v1-meta";
import { metaV1 } from "@remix-run/v1-meta";

type DefaultMetadata = {
  title: string;
  description: string;
  siteUrl: string;
  image: string;
} & V1_MetaDescriptor;

export const meta = (
  args: MetaArgs,
  { title, description, siteUrl, image, ...rest }: DefaultMetadata,
) => {
  return metaV1(args, {
    title,
    description,
    "og:url": siteUrl,
    "og:title": title,
    "og:description": description,
    "og:image": image,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image,
    ...rest,
  });
};
