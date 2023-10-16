import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Fragment,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ShowcaseExample } from "~/lib/showcase.server";
import { showcaseExamples } from "~/lib/showcase.server";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";
import { clsx } from "clsx";
import { useHydrated } from "~/lib/misc";
import { CACHE_CONTROL } from "~/lib/http.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let requestUrl = new URL(request.url);
  let siteUrl = requestUrl.protocol + "//" + requestUrl.host;

  return json({ siteUrl, showcaseExamples });
};

// Stolen from _marketing._index.tsx. eventually would like to replace
export const meta: MetaFunction<typeof loader> = (args) => {
  let { siteUrl } = args.data || {};
  let title = "Remix Showcase";
  let image = siteUrl ? `${siteUrl}/img/og.1.jpg` : null;
  let description = "See who is using Remix to build better websites.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:url", content: `${siteUrl}/showcase` },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:creator", content: "@remix_run" },
    { name: "twitter:site", content: "@remix_run" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
};

export default function Showcase() {
  let { showcaseExamples } = useLoaderData<typeof loader>();
  // Might be a bit silly to declare here and then prop-drill, but was a little concerned about a needless useEffect+useState for every card
  let isHydrated = useHydrated();

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
            Checkout the companies, organizations, nonprofits, and indie
            developers building better websites with Remix
          </p>
        </div>
        <ul className="mt-8 grid w-full max-w-md grid-cols-1 gap-x-8 gap-y-6 self-center md:max-w-3xl md:grid-cols-2 lg:max-w-6xl lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6 xl:gap-x-12 xl:gap-y-10">
          <IntersectionObserverProvider>
            {showcaseExamples.map((example, i) => {
              let preload: ShowcaseTypes["preload"] = i < 6 ? "auto" : "none";
              return (
                <Fragment key={example.name}>
                  <DesktopShowcase
                    // Non-focusable since focusing on the anchor tag starts the video -- need to
                    // ensure that this is fine for screen readers, but I'm fairly confident the
                    // video is not critical information and just visual flair so I don't think
                    // we're providing an unusable or even bad experience to screen-reader users
                    isHydrated={isHydrated}
                    preload={preload}
                    {...example}
                  />
                  <MobileShowcase
                    isHydrated={isHydrated}
                    preload={preload}
                    {...example}
                  />
                </Fragment>
              );
            })}
          </IntersectionObserverProvider>
        </ul>
      </main>
      <Footer />
    </div>
  );
}

type ObservedEntryMap = Map<Element, IntersectionObserverEntry>;
type IntersectionObserverContext = {
  observer: IntersectionObserver;
  observedEntryMap: ObservedEntryMap;
};

const IntersectionObserverContext = createContext<
  IntersectionObserverContext | undefined
>(undefined);

function IntersectionObserverProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  let [observer, setObserver] = useState<
    IntersectionObserverContext["observer"] | null
  >(null);
  let [observedEntryMap, setObservedEntryMap] = useState<
    IntersectionObserverContext["observedEntryMap"]
  >(new Map());

  useEffect(() => {
    let newObserver = new IntersectionObserver(
      (entries) => {
        setObservedEntryMap((prevObservedEntryMap) => {
          // copy the old map and update anything that's changed
          // we never delete entries, which may be a mistake in some cases, but fine here
          let newObservedEntryMap = new Map(prevObservedEntryMap);
          entries.forEach((entry) => {
            newObservedEntryMap.set(entry.target, entry);
          });
          return newObservedEntryMap;
        });
      },
      { threshold: 0, rootMargin: "75px 0px" }
    );
    setObserver(newObserver);

    return () => {
      newObserver?.disconnect();
    };
  }, []);

  const value = useMemo(
    () => (!observer ? undefined : { observer, observedEntryMap }),
    [observedEntryMap, observer]
  );

  return (
    <IntersectionObserverContext.Provider value={value}>
      {children}
    </IntersectionObserverContext.Provider>
  );
}

function useIntersectionObserver<T>(ref: React.MutableRefObject<T>) {
  const observerContext = useContext(IntersectionObserverContext);

  useEffect(() => {
    const node = ref.current;
    if (observerContext?.observer && node instanceof Element) {
      observerContext.observer.observe(node);
      return () => observerContext.observer.unobserve(node);
    }
  }, [observerContext?.observer, ref]);

  let entry = useMemo(() => {
    const node = ref.current;
    if (observerContext?.observedEntryMap && node instanceof Element) {
      return observerContext.observedEntryMap.get(node);
    }
  }, [observerContext?.observedEntryMap, ref]);

  return entry;
}

type ShowcaseTypes = ShowcaseExample & {
  preload?: "auto" | "metadata" | "none";
  isHydrated: boolean;
};

function DesktopShowcase({
  name,
  description,
  link,
  imgSrc,
  videoSrc,
  preload,
  isHydrated,
}: ShowcaseTypes) {
  let videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <li className="relative hidden overflow-hidden rounded-md border border-gray-100 shadow hover:shadow-blue-200 dark:border-gray-800 md:block">
      <ShowcaseVideo
        ref={videoRef}
        videoSrc={videoSrc}
        poster={imgSrc}
        autoPlay={false}
        preload={preload}
        isHydrated={isHydrated}
      />
      <ShowcaseDescription
        name={name}
        description={description}
        link={link}
        isHydrated={isHydrated}
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
  preload,
  isHydrated,
}: ShowcaseTypes) {
  let ref = useRef<HTMLVideoElement | null>(null);
  let entry = useIntersectionObserver(ref);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (node.paused && entry?.isIntersecting) {
      node.play();
    }
  }, [entry]);

  return (
    <li className="relative block overflow-hidden rounded-md border border-gray-100 shadow hover:shadow-blue-200 dark:border-gray-800 md:hidden">
      <ShowcaseVideo
        ref={ref}
        className="motion-reduce:hidden"
        videoSrc={videoSrc}
        poster={imgSrc}
        preload={preload}
        isHydrated={isHydrated}
      />
      {/* prefers-reduced-motion displays just an image */}
      <ShowcaseImage className="motion-safe:hidden" src={imgSrc} />
      <ShowcaseDescription
        name={name}
        description={description}
        link={link}
        isHydrated={isHydrated}
      />
    </li>
  );
}

let ShowcaseVideo = forwardRef<
  HTMLVideoElement,
  Pick<ShowcaseTypes, "videoSrc" | "isHydrated"> &
    React.VideoHTMLAttributes<HTMLVideoElement>
>(({ videoSrc, className, isHydrated, ...props }, ref) => {
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
        // Note: autoplay must be off for this strategy to work, if autoplay is turned on all assets will be downloaded automatically
        tabIndex={isHydrated ? -1 : 0}
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

function ShowcaseImage({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div className={clsx("aspect-[4/3] object-cover object-top", className)}>
      <img
        className="max-h-full w-full max-w-full"
        width={800}
        height={600}
        alt=""
        {...props}
      />
    </div>
  );
}

function ShowcaseDescription({
  description,
  link,
  name,
  isHydrated,
  playVideo,
  pauseVideo,
}: Pick<ShowcaseTypes, "description" | "link" | "name" | "isHydrated"> & {
  playVideo?: () => void;
  pauseVideo?: () => void;
}) {
  return (
    <div
      className={clsx("p-4", {
        // relative position in combination with the inner span makes the whole card clickable
        // only after hydration do we want it to be the size of the whole card, otherwise this
        // will get in the way of controlling the video
        relative: !isHydrated,
      })}
    >
      <h2 className="font-medium hover:text-blue-brand">
        <a
          href={link}
          rel="noopener noreferrer"
          target="_blank"
          onFocus={playVideo}
          onBlur={pauseVideo}
        >
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
