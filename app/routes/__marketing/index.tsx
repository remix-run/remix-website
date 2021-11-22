import { useLoaderData, json } from "remix";
import type { LoaderFunction, LinksFunction } from "remix";
import { OutlineButtonLink, PrimaryButtonLink } from "~/components/buttons";
import { getMarkdown } from "~/utils/md";
import indexStyles from "../../styles/index.css";
import { Red } from "~/components/gradients";
import { BigTweet, TweetCarousel, tweets } from "~/components/twitter-cards";
import { ScrollExperience } from "~/components/scroll-experience";
import { Prose, Sequence } from "@ryanflorence/mdtut";
import invariant from "ts-invariant";

export function meta() {
  let url = "https://remix.run/";
  let title = "Remix - Build Better Websites";
  let image = "https://remix.run/img/og.1.jpg";
  let description =
    "After over a year of development, Remix v1.0 is around the corner and its going open source";
  return {
    title,
    description,
    "og:url": url,
    "og:title": title,
    "og:description": description,
    "og:image": image,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": title,
    "twitter:description": description,
    "twitter:image": image,
  };
}

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: indexStyles }];
};

export default function Index() {
  return (
    <h1 className="py-10 text-center text-m-h1 md:text-d-h1">
      We&apos;ll be right back...
    </h1>
  );
}
