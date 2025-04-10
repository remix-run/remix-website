// These are old components from the first Jam landing page. TBD if we need any of it anymore. Some of the elements might make it back, but the time ticket sales happen we can probably throw it all away

import { useEffect } from "react";

export function PostCard() {
  return (
    <div className="postcard-container flex size-full flex-col items-start justify-between rounded-[0.25rem] p-7 lg:p-8 xl:p-9">
      <div className="absolute inset-0">
        <img
          className="size-full rounded-[0.25rem] object-cover object-left-top"
          src="/conf-images/2025/toronto-postcard.avif"
          alt="stylized Toronto skyline"
          draggable={false}
        />
      </div>

      <img
        className="relative h-[110px] w-[245px]"
        src="/conf-images/2025/remix-jam-lockup.svg"
        alt=""
        draggable={false}
      />
      <h1 className="relative self-end text-xl font-extrabold uppercase leading-none tracking-[-0.02em] text-[#f4f3ef] xl:text-4xl">
        <span className="sr-only">Remix Jam Toronto '25</span>
        <time dateTime="2025-10-10">Oct 10, 2025</time>
      </h1>
    </div>
  );
}

export function Seats() {
  return (
    <div className="relative">
      <div className="flex flex-col items-center overflow-hidden">
        <div className="seats-container">
          <img
            src="/conf-images/2025/seat-combined.svg"
            className="size-full"
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
      {/* <NewsletterSignup /> */}
    </div>
  );
}

// TODO: Move this into a callback ref once we upgrade to React 19
export function useParallax(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let rafId: number;
    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        element.style.transform = `translateY(calc(${scrolled}px * (1 - var(--parallax-transform-percent, 0.75))))`;
      });
    };

    // There is a small problem with this being JS only -- if you refresh the page or navigate back and forward, and the page is half way scrolled, the position of the text won't be right.
    // You have two options:
    // 1. Call `onScroll` and have a slight flash of the text moving into location
    // 2. Don't call onScroll and the text will be far away, but then snap in correctly as soon as the user scrolls
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [ref]);
}
