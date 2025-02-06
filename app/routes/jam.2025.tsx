import { Link } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { getMeta } from "~/lib/meta";
import type { Route } from "./+types/jam.2025";

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
    <div className="bg-gradient-to-b from-[#ebebe6] to-white">
      <div className="relative z-10">
        <KeepSakes />

        <Link
          to={newsletterLink}
          className="absolute right-4 top-6 rounded-full bg-black px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-brand xl:px-6 xl:py-5 xl:text-xl 2xl:px-9 2xl:py-6 2xl:text-2xl"
        >
          Tickets
        </Link>
      </div>

      {/* <Nav /> */}

      <LetterOfIntent />

      <div className="relative">
        <div className="flex flex-col items-center overflow-hidden pt-[300px] xl:pt-[400px] 2xl:pt-[300px]">
          {/* <div className="h-[679px] w-[1824px] lg:h-[751px] lg:w-[2016px] xl:h-[876px] xl:w-[2344px] 2xl:h-[1037px] 2xl:w-[2784px]"> */}
          <div className="aspect-[2.69] w-[1824px] lg:w-[2016px] xl:w-[2344px] 2xl:w-[2784px]">
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

function KeepSakes() {
  return (
    <>
      <KeepSake className="sticker">
        <img
          src="/conf-images/2025/remix-logo-sticker.svg"
          alt="Remix Logo Sticker"
          draggable={false}
        />
      </KeepSake>

      <KeepSake className="postcard">
        <PostCard />
      </KeepSake>

      <KeepSake className="lanyard">
        <img
          src="/conf-images/2025/remix-lanyard.avif"
          alt="All Access Remix Jam 2025 Lanyard that says 'Michael Jackson co-author, Remix, Shopify'"
          draggable={false}
        />
      </KeepSake>

      <KeepSake className="pick">
        <img
          src="/conf-images/2025/remix-pick.avif"
          alt="Guitar pick with Remix logo and 'Remix Jam Toronto '25'"
          draggable={false}
        />
      </KeepSake>
    </>
  );
}

type KeepSakeProps = {
  className: string;
  children: React.ReactNode;
};

function KeepSake({ className, children }: KeepSakeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartPos({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setTranslate({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startPos]);

  const containerRef = useRef<HTMLDivElement>(null);
  useParallax(containerRef);

  return (
    <div className="keepsake-container" ref={containerRef}>
      <div
        onMouseDown={handleMouseDown}
        className={clsx(
          "keepsake select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className,
        )}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px)`,
        }}
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
    <main ref={ref} className={clsx("letter-of-intent relative")}>
      <div className="mx-auto w-[85%] max-w-[1400px] pb-[200px] md:w-3/4 md:pb-[200px] lg:w-3/4 lg:pb-14 lg:pt-12 xl:w-2/3 xl:pb-14 xl:pt-12 2xl:w-2/3 2xl:pb-28 2xl:pt-24 3xl:w-[60%] 3xl:pb-0 3xl:pt-0">
        <h2 className="text-left font-fira-sans text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-[3.625rem] lg:text-6xl 2xl:text-[5.25rem] 3xl:text-8xl">
          It&rsquo;s time to get the band back together
        </h2>

        <div className="mt-9 flex flex-col gap-12 text-justify text-base lg:text-xl 2xl:text-2xl">
          <p>
            A lot has changed since the last Remix Conf in 2023. The React team
            has introduced so many great features and new paradigms with React
            19. Because of this, we on the Remix team felt it our responsibility
            to build a bridge to React 19 for the million of applications using
            React Router, by bringing everything that made Remix great into it.
          </p>
          <p>
            But we haven't stopped there; we've still been jamming in our
            garage, and we're ready to start jamming with all of you again.
            That's why we're letting you know to mark your calendars for Remix
            Jam, Fall 2025.
          </p>
          <p>
            Remix Jam is a gathering of the web's biggest fans, hosted by
            Shopify in the beautiful city of Toronto. Remix Jam will be the best
            opportunity to hang out IRL with the Remix community and core team,
            as well as hear from leading experts who are successfully using
            Remix technologies to solve real problems.
          </p>
          <p>
            Our tagline, "
            <span className="font-medium italic">Build Better Websites</span>"
            is still at the heart of everything we do. We want to enable users
            to build better websites, which is why we made Remix.
          </p>
          <blockquote className="italic text-blue-400">
            "...a full stack web framework that lets you focus on the user
            interface and work back through web standards to deliver a fast,
            slick, and resilient user experience."
          </blockquote>
          <p>
            We're pushing further, not just with projects like React Router but
            in our broader mission and philosophy to useThePlatform to build a
            better web.
          </p>
          <p>
            We can't wait to tell you more. If you want to be notified as soon
            as tickets go on sale,{" "}
            <Link
              to={newsletterLink}
              className="font-bold text-blue-brand hover:underline"
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

        <form className="mt-7 flex w-[280px] flex-col gap-5 p-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-left text-xs font-medium text-white"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Jane Smith"
              className="rounded-xl bg-black/20 p-5 text-sm leading-none text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

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

          <button
            type="submit"
            className="rounded-2xl bg-black px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-brand"
          >
            Sign Up
          </button>
        </form>
      </div>
    </aside>
  );
}

const newsletterId = "newsletter";
const newsletterLink = `#${newsletterId}`;

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
