import { OutlineButtonLink, PrimaryButtonLink } from "~/components/buttons";

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

export default function Index() {
  return (
    <div
      x-comp="Index"
      className="container md:max-w-2xl flex-1 flex flex-col justify-center"
    >
      <div>
        <div className="h-8" />
        <div className="font-display text-2xl text-white">
          After over a year of development, Remix{" "}
          <span className="text-blue-brand">v1.0</span> is around the corner,
          and its going <span className="text-yellow-brand">open source</span>.
        </div>
        <div className="h-6" />
        <div className="text-sm">
          We recently raised a seed round to secure the future of Remix. It's
          time for everybody to build better websites.
        </div>
        <div className="h-9" />
        <div>
          <link rel="prefetch" as="image" href="/m-r.jpg" />
          <link rel="prefetch" as="image" href="/m.jpg" />
          <link rel="prefetch" as="image" href="/r.jpg" />
          <PrimaryButtonLink
            prefetch="render"
            to="/blog/seed-funding-for-remix"
            children="Read about the fund raise"
            className="w-full uppercase"
          />
          <div className="h-4" />
          <OutlineButtonLink
            to="/newsletter"
            children="Get notified when v1.0 ships"
            className="w-full uppercase"
          />
        </div>
        <div className="h-20" />
      </div>
    </div>
  );
}
