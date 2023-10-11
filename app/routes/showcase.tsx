import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useRef } from "react";
import type { ShowcaseExample } from "~/lib/showcase.server";
import { showcaseExamples } from "~/lib/showcase.server";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export const meta: MetaFunction = (args) => {
  return [
    {
      title: "Remix Showcase",
      description: "See who is using Remix to build better websites.",
    },
  ];
};

export async function loader() {
  return json({ showcaseExamples });
}

export default function Showcase() {
  const { showcaseExamples } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full flex-1 flex-col">
      <Header />
      <main
        className="container mt-16 flex flex-1 flex-col lg:mt-32"
        tabIndex={-1} // is this every gonna be focused? just copy pasta
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold lg:text-6xl">Remix Showcase</h1>
          <p className="mt-4 text-lg font-light">
            Some quippy comment about how we're really great
          </p>
        </div>
        <ul className="mt-8 grid w-full max-w-md grid-cols-1 gap-x-8 gap-y-6 self-center md:max-w-3xl md:grid-cols-2 lg:max-w-6xl lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6 xl:gap-x-12 xl:gap-y-10">
          {showcaseExamples.map((example) => (
            <ShowcaseCard key={example.name} {...example} />
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

function ShowcaseCard({
  name,
  description,
  link,
  imgSrc,
  videoSrc,
}: ShowcaseExample) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const playVideo = () => {
    videoRef.current?.play();
  };
  const pauseVideo = () => {
    videoRef.current?.pause();
  };

  return (
    <li className="relative overflow-hidden border border-gray-100 shadow dark:border-gray-800 md:rounded-md">
      <div className="aspect-[4/3] object-cover object-top">
        <video
          ref={videoRef}
          className="max-h-full w-full max-w-full"
          disablePictureInPicture
          disableRemotePlayback
          loop
          muted
          tabIndex={0}
          poster={imgSrc}
          onFocus={playVideo}
          onBlur={pauseVideo}
          width={800}
          height={600}
        >
          {["webm", "mp4"].map((ext) => (
            <source
              key={ext}
              src={`${videoSrc}.${ext}`}
              type={`video/${ext}`}
              width={800}
              height={600}
            />
          ))}

          {/* 😬 what is this? */}
          {/* <source
            src="https://cdn.shopify.com/videos/c/vp/6e7b8b8e8d7348dcabc229459f89f529/6e7b8b8e8d7348dcabc229459f89f529.m3u8"
            type="application/x-mpegURL"
          /> */}
        </video>
      </div>
      <div className="p-4">
        <h2 className="font-medium">
          <a href={link}>
            {/* Makes the whole card clickable */}
            <span
              onMouseOver={playVideo}
              onMouseOut={pauseVideo}
              className="absolute inset-0 rounded-3xl"
            />
            {name}
          </a>
        </h2>
        <p className="pt-2 text-xs font-light">{description}</p>
      </div>
    </li>
  );
}
