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
    "Remix is a full stack web framework that lets you focus on the user interface and work back through web fundamentals to deliver a fast, slick, and resilient user experience. People are gonna love using your stuff.";
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

type LoaderData = {
  sample: Prose;
  sampleSm: Prose;
  mutations: Sequence;
  errors: Sequence;
};

export let loader: LoaderFunction = async () => {
  let [[sample], [sampleSm], [, mutations], [, errors]] = await Promise.all([
    getMarkdown("marketing/sample/sample.md"),
    getMarkdown("marketing/sample-sm/sample.md"),
    getMarkdown("marketing/mutations/mutations.md"),
    getMarkdown("marketing/mutations/errors.md"),
  ]);

  invariant(sample.type === "prose", "sample.md should be prose");
  invariant(sampleSm.type === "prose", "sample.md should be prose");
  invariant(mutations.type === "sequence", "mutations.md should be a sequence");
  invariant(errors.type === "sequence", "errors.md should be a sequence");

  let data: LoaderData = { sample, sampleSm, mutations, errors };
  return json(data, { headers: { "Cache-Control": "max-age=300" } });
};

export default function Index() {
  let { mutations, errors } = useLoaderData<LoaderData>();
  return (
    <div x-comp="Index">
      <div className="h-8" />
      <Hero />
      <div className="h-32" />
      <BigTweet tweet={tweets[0]} />
      <div className="h-10" />
      <TweetCarousel tweets={tweets.slice(1)} />
      <div className="h-32" />
      <ScrollExperience markdown={{ mutations, errors }} />
    </div>
  );
}

function Hero() {
  let { sample, sampleSm } = useLoaderData<LoaderData>();
  return (
    <div
      x-comp="Hero"
      className="px-6 sm:px-8 lg:flex lg:w-full lg:items-center lg:justify-between lg:gap-12"
    >
      <div className="lg:w-1/2 lg:mb-10">
        <div className="lg:max-w-2xl lg:mx-auto">
          <div className="font-display text-m-h1 sm:text-d-h2 text-white lg:text-[length:64px] lg:leading-[56px] xl:text-d-j">
            Focused on web <span className="text-aqua-brand">fundamentals</span>{" "}
            and <span className="text-green-brand">modern</span> UX, you’re
            simply going to{" "}
            <span className="text-yellow-brand">build better websites</span>
          </div>
          <div className="h-6" />
          <div className="text-m-p-lg xl:pr-56 lg:text-d-p-lg">
            Remix is a full stack web framework that lets you focus on the user
            interface and work back through web fundamentals to deliver a fast,
            slick, and resilient user experience. People are gonna love using
            your stuff.
          </div>
          <div className="h-9 xl:h-10" />
          <div className="flex flex-col gap-4 xl:flex-row xl:">
            <PrimaryButtonLink
              prefetch="intent"
              to="/docs/en/dev/tutorials/blog"
              className="w-full xl:w-60 xl:order-1"
              children="Get Started"
            />
            <OutlineButtonLink
              prefetch="intent"
              to="/docs/en/v1"
              className="w-full xl:w-60"
              children="Read the Docs"
            />
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-8 -mx-6 sm:-mx-8 md:p-10 lg:p-8 mt-6 lg:mt-0 relative lg:w-1/2 lg:h-[51rem] overflow-hidden lg:rounded-l-2xl">
        <Red className="absolute top-0 left-0 h-full xl:rounded-3xl" />
        <Sample html={sample.html} className="sm:hidden rounded-xl" />
        <Sample html={sampleSm.html} className="hidden sm:block" />
      </div>
    </div>
  );
}

function Sample({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={
        "relative text-m-p-sm sm:text-d-p-sm sm:rounded-lg xl:rounded-xl p-3 xl:p-4 overflow-auto bg-gray-800 lg:max-w-max md:max-w-full" +
        " " +
        className
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
