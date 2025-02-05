import { Link } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import { getMeta } from "~/lib/meta";
import type { Route } from "./+types/jam.2025";
import "~/styles/jam.css";

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
      {/* <Nav /> */}

      <LetterOfIntent />

      <div className="relative">
        <div className="flex flex-col items-center pt-[300px] xl:pt-[400px] 2xl:pt-[300px]">
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

function Nav() {
  return (
    <nav className="fixed left-1/2 top-12 z-10 flex w-3/4 max-w-[1600px] -translate-x-1/2 flex-col items-center gap-4 rounded-3xl bg-white/50 px-6 py-12 backdrop-blur-md md:w-[93%] md:flex-row md:justify-between md:rounded-[100px] md:px-9 md:py-9 xl:py-10 xl:pr-10 2xl:px-16 2xl:py-12">
      <h1 className="sr-only">Remix Jam 2025</h1>

      <img
        src="/conf-images/2025/remix-jam-logo.svg"
        alt=""
        className="h-9 md:h-6 lg:h-9 2xl:h-12"
      />

      <img
        src="/conf-images/2025/location.svg"
        alt="Toronto 2025"
        className="h-9 md:h-6 lg:h-9 2xl:h-12"
      />

      <Link
        to={newsletterLink}
        onClick={smoothScroll}
        className="rounded-full bg-black px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-brand xl:px-6 xl:py-5 xl:text-xl 2xl:px-9 2xl:py-6 2xl:text-2xl"
      >
        Tickets
      </Link>
    </nav>
  );
}

function LetterOfIntent() {
  const ref = useRef<HTMLElement>(null);
  useParallax(ref);

  return (
    <main
      ref={ref}
      className={clsx(
        "relative pt-[320px] md:pt-[410px] xl:pt-[420px] 2xl:pt-[600px]",
        "[--parallax-transform-percent:0.75] xl:[--parallax-transform-percent:0.9]",
      )}
    >
      <div className="3xl:w-[60%] 3xl:pt-0 3xl:pb-0 mx-auto w-[85%] max-w-[1400px] pb-[200px] md:w-3/4 md:pb-[200px] lg:w-3/4 lg:pb-14 lg:pt-12 xl:w-2/3 xl:pb-14 xl:pt-12 2xl:w-2/3 2xl:pb-28 2xl:pt-24">
        <h2 className="3xl:text-8xl text-left font-fira-sans text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] md:text-[3.625rem] lg:text-6xl 2xl:text-[5.25rem]">
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
              onClick={smoothScroll}
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

function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  document
    .querySelector(`#${newsletterId}`)
    ?.scrollIntoView({ behavior: "smooth" });
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
        element.style.transform = `translateY(calc(${scrolled}px * (1 - var(--parallax-transform-percent))))`;
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
