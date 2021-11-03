import { useLoaderData, json } from "remix";
import type { LoaderFunction } from "remix";
import { OutlineButtonLink, PrimaryButtonLink } from "~/components/buttons";
import { md } from "~/utils/md";

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

export let loader: LoaderFunction = async () => {
  let sample = await md("marketing/sample.md");
  return json({ sample }, { headers: { "Cache-Control": "max-age=300" } });
};

export default function Index() {
  let { sample } = useLoaderData();
  return (
    <div
      x-comp="Index"
      className="container md:max-w-2xl flex-1 flex flex-col justify-center xl:max-w-7xl"
    >
      <div>
        <div className="h-8" />
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
        <div className="h-9" />
        <div>
          <link rel="prefetch" as="image" href="/m-r.jpg" />
          <link rel="prefetch" as="image" href="/m.jpg" />
          <link rel="prefetch" as="image" href="/r.jpg" />
          <PrimaryButtonLink
            prefetch="intent"
            to="/blog/seed-funding-for-remix"
            className="w-full uppercase"
            children="Get Started"
          />
          <div className="h-4" />
          <OutlineButtonLink
            to="/newsletter"
            className="w-full uppercase"
            children="Read the Docs"
          />
        </div>
        <div dangerouslySetInnerHTML={{ __html: sample.html }} />
        <div className="h-20" />
      </div>
    </div>
  );
}
