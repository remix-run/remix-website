import { useRef } from "react";
import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export default function Showcase() {
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
        <ul className="mt-8 grid w-full max-w-md grid-cols-1 gap-x-8 gap-y-6 self-center md:max-w-3xl md:grid-cols-2 lg:max-w-6xl lg:grid-cols-3 lg:gap-x-12 lg:gap-y-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShowcaseCard key={i} />
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

function ShowcaseCard() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const playVideo = () => {
    videoRef.current?.play();
  };
  const pauseVideo = () => {
    videoRef.current?.pause();
  };

  return (
    <li className="relative overflow-hidden border border-gray-100 shadow md:rounded-md">
      <div className="aspect-[4/3] object-cover object-top">
        <video
          ref={videoRef}
          className="max-h-full w-full max-w-full"
          disablePictureInPicture
          disableRemotePlayback
          loop
          muted
          tabIndex={0}
          poster="/showcase-assets/shopify.png"
          onFocus={playVideo}
          onBlur={pauseVideo}
        >
          <source src="/showcase-assets/shopify.mp4" type="video/mp4" />
          {/* 😬 what is this? */}
          {/* <source
            src="https://cdn.shopify.com/videos/c/vp/6e7b8b8e8d7348dcabc229459f89f529/6e7b8b8e8d7348dcabc229459f89f529.m3u8"
            type="application/x-mpegURL"
          /> */}
        </video>
        <div className="p-4">
          <h2 className="font-medium">
            <a href="https://www.shopify.com/">
              {/* Makes the whole card clickable */}
              <span
                onMouseOver={playVideo}
                onMouseOut={pauseVideo}
                className="absolute inset-0 rounded-3xl"
              />
              Shopify
            </a>
          </h2>
          <p className="pt-2 text-xs font-light">A really cool company</p>
        </div>
      </div>
    </li>
  );
}
