import { Link, useFetcher } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { getMeta } from "~/lib/meta";
import { getSubscribeStatus } from "~/ui/subscribe";
import type { Route } from "./+types/jam.2025";
import type { NewsletterActionData } from "~/routes/[_]actions.newsletter";

import jamStyles from "~/styles/jam.css?url";

export function headers() {
  return {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  };
}

export function links() {
  return [
    {
      rel: "preload",
      as: "font",
      href: "/font/fira-sans-extra-bold.woff2",
      crossOrigin: "anonymous",
    },
    { rel: "stylesheet", href: jamStyles },
  ];
}

export function meta({ matches }: Route.MetaArgs) {
  const [rootMatch] = matches;
  const { siteUrl } = rootMatch.data;
  return getMeta({
    title: "Remix Jam 2025",
    description: "It's time to get the band back together",
    siteUrl: `${siteUrl}/jam`,
    image: `${siteUrl}/conf-images/2025/og_image.jpg`,
  });
}

export default function RemixJam2025() {
  return (
    <div className="overflow-x-hidden bg-gradient-to-b from-[#ebebe6] to-white dark:text-gray-900">
      <div className="relative z-10">
        <Keepsakes />

        <Link
          to={newsletterLink}
          className="absolute right-4 top-6 rounded-full bg-black px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-brand xl:px-6 xl:py-5 xl:text-xl 2xl:px-9 2xl:py-6 2xl:text-2xl"
        >
          Tickets
        </Link>
      </div>

      <LetterOfIntent />

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
        <NewsletterSignup />
      </div>
    </div>
  );
}

type KeepsakeId = "sticker" | "postcard" | "lanyard" | "pick";

function Keepsakes() {
  const [order, setOrder] = useState<Record<KeepsakeId, number>>({
    sticker: 1,
    postcard: 2,
    lanyard: 3,
    pick: 4,
  });

  const moveToFront = (id: KeepsakeId) => {
    setOrder((current) => {
      const newOrder = { ...current };
      // Find the current max z-index
      const currentIndex = current[id];

      // Decrease all items that were above the moved item
      for (let key in newOrder) {
        if (newOrder[key as KeepsakeId] > currentIndex) {
          newOrder[key as KeepsakeId]--;
        }
      }

      // Move the dragged item to the top
      newOrder[id] = 4;

      return newOrder;
    });
  };

  return (
    <div className="isolate">
      <Keepsake
        className="sticker"
        order={order.sticker}
        onDragStart={() => moveToFront("sticker")}
      >
        <img
          src="/conf-images/2025/remix-logo-sticker.svg"
          alt="Remix Logo Sticker"
          draggable={false}
        />
      </Keepsake>

      <Keepsake
        className="postcard"
        order={order.postcard}
        onDragStart={() => moveToFront("postcard")}
      >
        <PostCard />
      </Keepsake>

      <Keepsake
        className="lanyard"
        order={order.lanyard}
        onDragStart={() => moveToFront("lanyard")}
      >
        <img
          src="/conf-images/2025/remix-lanyard.avif"
          alt="All Access Remix Jam 2025 Lanyard that says 'Michael Jackson co-author, Remix, Shopify'"
          draggable={false}
        />
      </Keepsake>

      <Keepsake
        className="pick"
        order={order.pick}
        onDragStart={() => moveToFront("pick")}
      >
        <img
          src="/conf-images/2025/remix-pick.avif"
          alt="Guitar pick with Remix logo and 'Remix Jam Toronto '25'"
          draggable={false}
        />
      </Keepsake>
    </div>
  );
}

type KeepsakeProps = {
  className: string;
  children: React.ReactNode;
  onDragStart: () => void;
  order?: number;
};

function Keepsake({ className, children, onDragStart, order }: KeepsakeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useDrag(elementRef, onDragStart);
  useParallax(containerRef);

  return (
    <div
      className="keepsake-container relative"
      style={{ zIndex: order }}
      ref={containerRef}
    >
      <div
        ref={elementRef}
        className={clsx("keepsake cursor-grab select-none", className)}
      >
        <div className="rotate">{children}</div>
      </div>
    </div>
  );
}

function PostCard() {
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
        <span>Fall 2025</span>
      </h1>
    </div>
  );
}

function LetterOfIntent() {
  const ref = useRef<HTMLElement>(null);
  useParallax(ref);

  return (
    <main ref={ref} className="letter-of-intent relative">
      <div className="letter-of-intent-container">
        <h2 className="text-left font-fira-sans text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-[3.625rem] lg:text-6xl 2xl:text-[5.25rem]">
          It&rsquo;s time to get the band back together
        </h2>

        <div className="mt-9 flex flex-col gap-12 text-justify text-base lg:text-xl 2xl:text-2xl">
          <p>
            A lot has changed since the last Remix Conf in 2023. The React team
            has incorporated a lot of what made Remix great into React itself in
            React 19. React now ships with support for <code>{"<form>"}</code>s,
            mutations, and transitions out of the box! And we took everything
            that was great about Remix and ported it back into React Router v7,
            building a bridge to the future of React for the millions of apps
            that have been built on React Router over the last decade.
          </p>
          <p>
            But we haven't stopped there; we've been jamming in our garage this
            whole time, and we're ready to start jamming again with all of you.
            That's why we're letting you know to mark your calendars for Remix
            Jam, Fall 2025.
          </p>
          <p>
            Remix Jam is a gathering of the web's biggest fans, hosted by
            Shopify in the beautiful city of Toronto. Remix Jam will be the best
            opportunity to hang out IRL with the Remix community and core team,
            as well as hear from leading experts who are successfully using
            Remix to solve real problems.
          </p>
          <p>
            Our tagline, "
            <span className="font-medium italic">Build Better Websites</span>"
            is still at the heart of everything we do. We want to enable users
            to build better websites, which is why we made Remix.
          </p>
          <blockquote className="italic text-blue-700">
            "Remix lets you focus on the user interface and work back through
            web standards to deliver a fast, slick, and resilient user
            experience."
          </blockquote>
          <p>
            We're pushing further, not just with projects like React Router but
            in our broader mission and philosophy to #useThePlatform to build a
            better web.
          </p>
          <p>
            We can't wait to tell you more. If you want to be notified as soon
            as tickets go on sale,{" "}
            <Link
              to={newsletterLink}
              className="font-bold text-blue-600 hover:underline"
            >
              sign up for our newsletter below!
            </Link>
          </p>
          <p className="mt-12 italic">— The Remix Team</p>
        </div>
      </div>
    </main>
  );
}

function NewsletterSignup() {
  const subscribe = useFetcher<NewsletterActionData>();
  const { isSuccessful, isError, error } = getSubscribeStatus(subscribe);

  return (
    <aside
      id={newsletterId}
      className="w-full bg-gradient-to-b from-[#ff3300] to-[#ebd26e] px-10 pb-[200px]"
    >
      <div className="mx-auto flex w-[1000px] max-w-full flex-col items-center">
        <h2 className="text-center text-[1.75rem] font-bold leading-tight tracking-tight text-white md:text-4xl md:leading-tight lg:text-[2.5rem] lg:leading-tight xl:text-5xl xl:leading-tight">
          <span>Sign up to get notified</span>
          <br />
          <span>when Remix Jam tickets are available</span>
        </h2>

        <subscribe.Form
          className="mt-7 flex w-[280px] flex-col gap-5 p-5"
          action="/_actions/newsletter"
          method="POST"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-left text-xs font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="jane@email.com"
              className="rounded-xl bg-black/20 p-5 text-sm leading-none text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <input type="hidden" name="tag" value="6280341" />
          <button
            type="submit"
            className="rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-brand"
          >
            Sign Up
          </button>

          <div aria-live="polite">
            {isSuccessful && (
              <p className="font-semibold text-white">
                You're good to go ✅
                <br />
                <br />
                Please confirm your email to be notified when ticket sales are
                available.
              </p>
            )}
            {isError && (
              <div className="font-semibold text-white">
                {error} ⚠️
                <br />
                <br />
                Please try again
              </div>
            )}
          </div>
        </subscribe.Form>
      </div>
    </aside>
  );
}

const newsletterId = "newsletter";
const newsletterLink = `#${newsletterId}`;

// TODO: Move this into a callback ref once we upgrade to React 19
function useDrag(ref: React.RefObject<HTMLElement>, onDragStart?: () => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let translate = { x: 0, y: 0 };

    const getEventPos = (e: MouseEvent | TouchEvent) => {
      const pos = "touches" in e ? e.touches[0] : e;
      return { x: pos.clientX, y: pos.clientY };
    };

    const handleStart = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      element.style.cursor = "grabbing";
      onDragStart?.();
      const pos = getEventPos(e);
      startPos = {
        x: pos.x - translate.x,
        y: pos.y - translate.y,
      };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent scrolling on touch devices

      const pos = getEventPos(e);
      translate = {
        x: pos.x - startPos.x,
        y: pos.y - startPos.y,
      };

      element.style.transform = `translate(${translate.x}px, ${translate.y}px)`;
    };

    const handleEnd = () => {
      isDragging = false;
      element.style.cursor = "grab";
    };

    // Mouse events
    element.addEventListener("mousedown", handleStart);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);

    // Touch events
    element.addEventListener("touchstart", handleStart, { passive: false });
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);

    return () => {
      element.removeEventListener("mousedown", handleStart);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);

      element.removeEventListener("touchstart", handleStart);
      document.removeEventListener("touchmove", handleMove);
      element.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tell me when this starts breaking
  }, [ref]);
}

// TODO: Move this into a callback ref once we upgrade to React 19
function useParallax(ref: React.RefObject<HTMLElement>) {
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

    // There is a small problem with this being JS only -- if you refresh the page or navigate back then forward, and the page is half way scrolled, the position of the text won't be right.
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
