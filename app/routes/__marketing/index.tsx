import { useLoaderData, json } from "remix";
import type { LoaderFunction, LinksFunction } from "remix";
import { OutlineButtonLink, PrimaryButtonLink } from "~/components/buttons";
import { getMarkdown } from "~/utils/md";
import indexStyles from "../../styles/index.css";
import { Green, Red, RedPortrait } from "~/components/gradients";

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

export let loader: LoaderFunction = async () => {
  let [sample, sampleSm] = await Promise.all([
    getMarkdown("marketing/sample/sample.md"),
    getMarkdown("marketing/sample-sm/sample.md"),
  ]);
  return json(
    { sample, sampleSm },
    { headers: { "Cache-Control": "max-age=300" } }
  );
};

export default function Index() {
  return (
    <div
      x-comp="Index"
      className="container md:max-w-2xl flex-1 flex flex-col xl:max-w-7xl"
    >
      <div className="h-8" />
      <Hero />
      <div className="h-9" />
    </div>
  );
}

function BigTweet() {
  return (
    <div className="max-w-xl">
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
      <p>fpoiuaposidfpoiausd</p>
    </div>
  );
}

function Hero() {
  let { sample, sampleSm } = useLoaderData();
  return (
    <div
      x-comp="Hero"
      className="xl:flex xl:w-full xl:items-center xl:justify-between xl:gap-32"
    >
      <div className="xl:w-1/2 xl:mb-10">
        <div className="font-display text-2xl text-white xl:text-6xl xl:max-w-2xl">
          Focused on web <span className="text-aqua-brand">fundamentals</span>{" "}
          and <span className="text-green-brand">modern</span> UX, you’re simply
          going to{" "}
          <span className="text-yellow-brand">build better websites</span>
        </div>
        <div className="h-6" />
        <div className="text-sm xl:max-w-lg xl:text-base">
          Remix let’s you focus on the user interface and work back through web
          fundamentals to deliver a fast, slick, and resilient user experience.
          People are gonna love using your stuff.
        </div>
        <div className="h-9 xl:h-10" />
        <div className="flex flex-col xl:flex-row gap-4">
          <PrimaryButtonLink
            prefetch="intent"
            to="/blog/seed-funding-for-remix"
            className="w-full xl:w-60 xl:order-1"
            children="Get Started"
          />
          <OutlineButtonLink
            to="/newsletter"
            className="w-full xl:w-60"
            children="Read the Docs"
          />
        </div>
      </div>
      <div className="p-4 -mx-6 xl:p-10 mt-6 xl:mt-0 relative xl:w-1/2 xl:h-[51rem] overflow-hidden sm:mx-auto rounded-xl xl:rounded-3xl xl:overflow-visible">
        <Red className="absolute left-0 top-0 h-full xl:rounded-3xl" />
        <Sample html={sample.html} className="sm:hidden" />
        <Sample html={sampleSm.html} className="hidden sm:block" />
      </div>
    </div>
  );
}

function Sample({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={
        "relative xl:absolute z-10 text-3xs sm:text-xs min-w-full rounded-lg xl:rounded-xl p-3 xl:p-4 overflow-auto xl:overflow-visible bg-gray-800" +
        " " +
        className
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
