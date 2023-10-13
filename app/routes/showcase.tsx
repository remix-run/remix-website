import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Fragment, forwardRef, useRef } from "react";
import type { ShowcaseExample } from "~/lib/showcase.server";
import { showcaseExamples } from "~/lib/showcase.server";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";
import { clsx } from "clsx";
import { useHydrated } from "~/lib/misc";

export let meta = () => {
  return [
    {
      title: "Remix Showcase",
      description: "See who is using Remix to build better websites.",
    },
  ];
};

let descriptions = [
  "Some quippy comment about how we're really great",
  "Show me the money",
  "Checkout the companies, organizations, nonprofits, and indie developers building better websites with Remix",
];

export async function loader() {
  return json({
    showcaseExamples,
    randomDescription:
      descriptions[Math.floor(Math.random() * descriptions.length)],
  });
}

export default function Showcase() {
  let { showcaseExamples, randomDescription } = useLoaderData<typeof loader>();
  let isHydrated = useHydrated();

  let videoTabIndex = isHydrated ? -1 : 0;

  return (
    <div className="flex h-full flex-1 flex-col">
      <Header />
      <main
        className="container mt-16 flex flex-1 flex-col items-center lg:mt-32"
        tabIndex={-1} // is this every gonna be focused? just copy pasta
      >
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
            Remix Showcase
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-light">
            {randomDescription}
          </p>
        </div>
        <ul className="mt-8 grid w-full max-w-md grid-cols-1 gap-x-8 gap-y-6 self-center md:max-w-3xl md:grid-cols-2 lg:max-w-6xl lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6 xl:gap-x-12 xl:gap-y-10">
          {showcaseExamples.map((example) => (
            <Fragment key={example.name}>
              <DesktopShowcase
                // Non-focusable since focusing on the anchor tag starts the video -- need to
                // ensure that this is fine for screen readers, but I'm fairly confident the
                // video is not critical information and just visual flair so I don't think
                // we're providing an unusable or even bad experience to screen-reader users
                videoTabIndex={videoTabIndex}
                {...example}
              />
              <MobileShowcase videoTabIndex={videoTabIndex} {...example} />
            </Fragment>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

type ShowcaseTypes = ShowcaseExample & { videoTabIndex: number };

function DesktopShowcase({
  name,
  description,
  link,
  imgSrc,
  videoSrc,
  videoTabIndex,
}: ShowcaseTypes) {
  let videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <li className="relative hidden overflow-hidden rounded-md border border-gray-100 shadow dark:border-gray-800 md:block">
      <ShowcaseVideo
        ref={videoRef}
        videoSrc={videoSrc}
        poster={imgSrc}
        autoPlay={false}
        tabIndex={videoTabIndex}
      />
      <ShowcaseDescription
        name={name}
        description={description}
        link={link}
        playVideo={() => videoRef.current?.play()}
        pauseVideo={() => videoRef.current?.pause()}
      />
    </li>
  );
}

function MobileShowcase({
  name,
  description,
  link,
  imgSrc,
  videoSrc,
  videoTabIndex,
}: ShowcaseTypes) {
  return (
    <li className="relative block overflow-hidden rounded-md border border-gray-100 shadow dark:border-gray-800 md:hidden">
      <ShowcaseVideo
        className="motion-reduce:hidden"
        videoSrc={videoSrc}
        poster={imgSrc}
        autoPlay
        tabIndex={videoTabIndex}
      />
      {/* prefers-reduced-motion */}
      <ShowcaseVideo
        className="motion-safe:hidden"
        videoSrc={videoSrc}
        poster={imgSrc}
        autoPlay={false}
        tabIndex={videoTabIndex}
      />
      <ShowcaseDescription name={name} description={description} link={link} />
    </li>
  );
}

let ShowcaseVideo = forwardRef<
  HTMLVideoElement,
  React.VideoHTMLAttributes<HTMLVideoElement> & { videoSrc: string }
>(({ videoSrc, className, ...props }, ref) => {
  return (
    <div className={clsx("aspect-[4/3] object-cover object-top", className)}>
      <video
        ref={ref}
        className="max-h-full w-full max-w-full"
        disablePictureInPicture
        disableRemotePlayback
        playsInline
        loop
        muted
        width={800}
        height={600}
        {...props}
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
      </video>
    </div>
  );
});

function ShowcaseDescription({
  description,
  link,
  name,
  playVideo,
  pauseVideo,
}: Pick<ShowcaseExample, "description" | "link" | "name"> & {
  playVideo?: () => void;
  pauseVideo?: () => void;
}) {
  return (
    <div className="p-4">
      <h2 className="font-medium">
        <a
          href={link}
          rel="noopener noreferrer"
          target="_blank"
          onFocus={playVideo}
          onBlur={pauseVideo}
        >
          {/* Makes the whole card clickable */}
          <span
            onMouseOver={playVideo}
            onMouseOut={pauseVideo}
            className="absolute inset-0"
          />
          {name}
        </a>
      </h2>
      <p className="pt-2 text-xs font-light">{description}</p>
    </div>
  );
}
