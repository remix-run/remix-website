import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Fragment, useRef } from "react";
import type { ShowcaseExample } from "~/lib/showcase.server";
import { showcaseExamples } from "~/lib/showcase.server";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";
import { clsx } from "clsx";
import { useHydrated } from "~/lib/misc";
import { usePrefersReducedMotion } from "~/ui/primitives/utils";

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
  // Unfortunately have to use JS for this, because I can't figure out a great way to
  // avoid video autoplay via css
  let prefersReducedMotion = usePrefersReducedMotion();

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
              {/* Leveraging display: hidden to avoid using a bunch of JS to determine which preview should be shown */}
              <ShowcaseCard screen="desktop" {...example} />
              <ShowcaseCard
                screen="mobile"
                // On mobile we autoplay videos, this avoids that until we know the user doesn't have prefers-reduced-motion
                disableAutoPlay={Boolean(prefersReducedMotion)}
                {...example}
              />
            </Fragment>
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
  screen = "desktop",
  disableAutoPlay = false,
}: ShowcaseExample & {
  /**
   * mobile: autoplays and no play/pause functionality. Display hidden on md+ screen sizes
   * desktop: no-autoplay, only plays/pauses on hover or focus of anchor tag. Display hidden on non-md+ screen sizes
   */
  screen?: "mobile" | "desktop";
  /** override to disable autoplay no matter the internal logic for this component. */
  disableAutoPlay?: boolean;
}) {
  let videoRef = useRef<HTMLVideoElement | null>(null);
  let isHydrated = useHydrated();

  let playVideo = () => {
    if (screen === "mobile") return;
    videoRef.current?.play();
  };
  let pauseVideo = () => {
    if (screen === "mobile") return;
    videoRef.current?.pause();
  };

  return (
    <li
      className={clsx(
        "relative overflow-hidden rounded-md border border-gray-100 shadow dark:border-gray-800",
        screen === "mobile" ? "block md:hidden" : "hidden md:block"
      )}
    >
      <div className="aspect-[4/3] object-cover object-top">
        <video
          ref={videoRef}
          className={"max-h-full w-full max-w-full"}
          disablePictureInPicture
          disableRemotePlayback
          playsInline
          loop
          muted
          // Non-focusable since focusing on the anchor tag starts the video need to
          // ensure that this is fine for screen readers, but I'm fairly confident the
          // video is not critical information and just visual flair so I don't think
          // we're providing an unusable or even bad experience to screen-reader users
          tabIndex={isHydrated ? -1 : 0}
          poster={imgSrc}
          width={800}
          height={600}
          autoPlay={!disableAutoPlay && screen === "mobile"}
          preload="none"
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
      <div className="p-4">
        <h2 className="font-medium">
          <a onFocus={playVideo} onBlur={pauseVideo} href={link}>
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
    </li>
  );
}
