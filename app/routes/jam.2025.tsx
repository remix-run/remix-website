import { Link, useFetcher } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import { useEffect, useId, useRef, useState } from "react";
import { clsx } from "clsx";
import { getMeta } from "~/lib/meta";
import { getSubscribeStatus } from "~/ui/subscribe";
import type { Route } from "./+types/jam.2025";
import type { NewsletterActionData } from "~/routes/[_]actions.newsletter";
import { Discord, GitHub, Twitter, YouTube } from "~/ui/icons";

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
      href: "/font/jet-brains-mono-regular.woff2",
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
    <div className="relative overflow-x-hidden px-6">
      <Background />
      <Navbar />

      {/* <div className="relative z-10">
        <Keepsakes />
      </div>

      <LetterOfIntent /> */}

      <EventDetails />

      {/* Spacer */}
      <div className="h-[100px] w-full" />

      <NewsletterSignup />

      <Footer />
    </div>
  );
}

function Background() {
  const prefersReducedMotion = usePrefersReducedMotion();
  let colorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  let rafIdRef = useRef<number>(0);
  let filterId = useId();

  // Effect runs once on mount to start an animation loop that continuously
  // cycles the hue rotation of the SVG filter over 2500ms.
  useEffect(() => {
    if (prefersReducedMotion) return; // Bail if user prefers reduced motion

    let colorMatrix = colorMatrixRef.current;
    if (!colorMatrix) return;

    let startTime: number | null = null;
    let duration = 2500;
    let maxValue = 360;

    // Animation frame handler: Calculates elapsed time, determines the current
    // hue value (0-360) based on the 2500ms cycle, and directly updates the
    // 'values' attribute of the feColorMatrix element.
    let animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      let elapsed = timestamp - startTime;
      let progress = (elapsed % duration) / duration;
      let currentValue = Math.floor(progress * maxValue);

      if (colorMatrixRef.current) {
        colorMatrixRef.current.setAttribute("values", String(currentValue));
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="fixed -inset-11 isolate -z-10">
      {/* Base radial gradient layer */}
      <div
        className="absolute size-full"
        style={{
          background:
            "radial-gradient(72% 63% at 50% 32.300000000000004%,#3b3b3b .036346160613726086%,rgb(26,26,26) 100%)",
        }}
      />
      {/* Layer applying the animated SVG filter */}
      <div
        className="absolute size-full"
        style={{
          filter: `url(#${filterId}) blur(4px)`,
        }}
      >
        {/* SVG containing the filter definition */}
        <svg className="absolute">
          <defs>
            <filter id={filterId}>
              <feTurbulence
                result="undulation"
                numOctaves="2"
                baseFrequency="0.000845,0.00338"
                seed="0"
                type="turbulence"
              />
              <feColorMatrix
                ref={colorMatrixRef}
                in="undulation"
                type="hueRotate"
                values="0"
              />
              <feColorMatrix
                in="dist"
                result="circulation"
                type="matrix"
                values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="circulation"
                scale="44.24242424242424"
                result="dist"
              />
              <feDisplacementMap
                in="dist"
                in2="undulation"
                scale="44.24242424242424"
                result="output"
              />
            </filter>
          </defs>
        </svg>
        {/* Masked overlay image */}
        <div
          className="size-full"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            maskImage: "url('/conf-images/2025/background-mask.avif')",
            maskSize: "cover",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
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
  // useParallax(containerRef);

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
        <time dateTime="2025-10-10">Oct 10, 2025</time>
      </h1>
    </div>
  );
}

function EventDetails() {
  return (
    <main className="mx-auto flex max-w-[800px] flex-col items-center gap-12 py-20 pt-[280px] text-center">
      <SectionLabel>Pack Your Bags</SectionLabel>

      <h1 className="flex flex-col gap-3 text-6xl font-extrabold uppercase leading-none tracking-tight text-white md:text-8xl md:leading-none">
        <span>Remix Jam</span>
        <span className="flex items-center justify-center gap-5">
          Toronto
          <span className="rounded-full px-8 py-5 text-4xl leading-none ring-[6px] ring-inset ring-white">
            Event
          </span>
        </span>
        <time dateTime="2025-10-10" className="whitespace-nowrap">
          October 10 2025
        </time>
      </h1>

      <SectionLabel>Overview</SectionLabel>
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <p className="text-xl font-bold leading-relaxed text-white md:text-3xl">
          Join us in person for a special event — to learn about our shared
          past, present, and future — hosted by the Remix team & Shopify in the
          heart of Toronto.
        </p>
      </div>

      <SectionLabel>Location</SectionLabel>
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <address className="text-xl font-bold not-italic leading-relaxed text-white md:text-3xl">
          620 King St W
          <br />
          Toronto, ON M5V 1M7, Canada
        </address>
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
      className="mx-auto max-w-2xl text-center text-base"
    >
      <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
        Sign up for our Newsletter to be stay up to date on any announcements,
        lineup changes, or additional details about Remix Jam
      </h2>

      <subscribe.Form
        className="mt-12 flex flex-col items-center"
        action="/_actions/newsletter"
        method="POST"
      >
        <input type="hidden" name="tag" value="6280341" />
        <SectionLabel>
          <label htmlFor="email">email</label>
        </SectionLabel>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="your@email.com"
          className="mt-[10px] w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-xl text-white ring-inset placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-brand sm:leading-6"
        />
        <button
          type="submit"
          className="mt-5 w-full max-w-sm rounded-full border-0 bg-black px-6 py-4 text-center text-xl font-semibold text-white ring-inset transition-colors duration-300 placeholder:text-white hover:bg-blue-brand focus:ring-blue-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:leading-6"
        >
          Sign Up
        </button>

        <div aria-live="polite" className="mt-4 text-sm text-white">
          {isSuccessful && (
            <p>
              You're good to go ✅ Please confirm your email to be notified when
              ticket sales are available.
            </p>
          )}
          {isError && (
            <p className="text-red-400">{error} ⚠️ Please try again.</p>
          )}
        </div>
      </subscribe.Form>
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
    element.addEventListener("touchend", handleEnd);
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

function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 py-[160px] text-center font-conf-mono text-gray-400">
      <div className="flex items-center gap-5">
        <Link
          to="/"
          className="rounded-3xl border border-gray-400 px-4 py-1 uppercase text-white hover:text-blue-brand"
        >
          remix.run
        </Link>
        <a
          href="https://github.com/remix-run"
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHub
            className="size-8 transition-colors hover:text-white"
            aria-hidden
          />
        </a>
        <a
          href="https://twitter.com/remix_run"
          aria-label="Twitter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter
            className="size-8 transition-colors hover:text-white"
            aria-hidden
          />
        </a>
        <a
          href="https://youtube.com/remix_run"
          aria-label="YouTube"
          target="_blank"
          rel="noopener noreferrer"
        >
          <YouTube
            className="size-8 transition-colors hover:text-white"
            aria-hidden
          />
        </a>
        <a
          href="https://rmx.as/discord"
          aria-label="Discord"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Discord
            className="size-8 transition-colors hover:text-white"
            aria-hidden
          />
        </a>
      </div>
      <div className="flex flex-col items-center gap-2 uppercase leading-loose">
        <div>
          docs and examples licensed under{" "}
          <a
            href="https://opensource.org/licenses/MIT"
            className="text-white hover:text-blue-brand"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT
          </a>
        </div>
        <div>
          ©2025{" "}
          <a
            href="https://shopify.com"
            className="text-white hover:text-blue-brand"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shopify, Inc.
          </a>
        </div>
      </div>
    </footer>
  );
}

function Navbar() {
  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between p-9"
      style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%)`,
      }}
    >
      <Link to="/jam/2025" className="flex items-center">
        <JamLogo className="w-[200px] fill-white" />
      </Link>

      {/* Placeholder for navigation links */}
      <div className="flex-1" />

      <Link
        to="#newsletter"
        className="flex items-center gap-2 rounded-full bg-white px-6 py-4 text-xl font-semibold text-black transition-colors duration-300 hover:bg-blue-brand hover:text-white"
      >
        <TicketLogo className="size-8 fill-current" />
        <span>Ticket</span>
      </Link>
    </nav>
  );
}

// Rename Logo to JamLogo for clarity
function JamLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 53.33 17" className={className}>
      <path d="M32.46 2.34c-.25-.23-.51-.46-.79-.67a8.474 8.474 0 0 0-4.4-1.65S27.05 0 27.05 0c-.2-.01-.39-.01-.57 0h-.43v.01c-1.63.11-3.18.68-4.49 1.65-.28.21-.55.43-.79.67-1.7 1.62-2.64 3.81-2.64 6.16s.93 4.52 2.62 6.13c.26.25.55.49.84.71 1.28.94 2.78 1.5 4.36 1.63s.22.02.22.02c.14 0 .29.01.45.01s.31 0 .44-.01h.22v-.02c1.58-.12 3.09-.68 4.37-1.63.3-.22.58-.46.84-.71 1.69-1.62 2.62-3.8 2.62-6.14s-.94-4.54-2.64-6.15ZM19.39 9.13h2.68c.05.92.21 1.82.48 2.69h-2.38c-.43-.83-.69-1.74-.77-2.69Zm9.97-3.92c.3.86.49 1.75.54 2.67h-2.67V5.21h2.13Zm-2.13-1.26V1.73c.47.49.88 1.03 1.24 1.61.12.19.23.4.34.61h-1.58Zm-1.26-2.14v2.13h-1.52c.11-.2.22-.4.34-.59.34-.55.74-1.07 1.18-1.54Zm0 3.4v2.67h-2.63c.06-.92.25-1.81.56-2.67h2.08Zm-3.9 2.66h-2.69c.08-.94.34-1.84.76-2.67h2.41c-.27.86-.44 1.75-.49 2.67Zm1.26 1.26h2.64v2.69h-2.1c-.31-.86-.49-1.76-.54-2.69Zm2.64 3.95v2.19c-.45-.48-.86-1.01-1.2-1.58-.12-.2-.24-.4-.35-.62h1.55Zm1.26 2.19v-2.2h1.57a9.376 9.376 0 0 1-1.57 2.2Zm0-3.45V9.13h2.67c-.06.92-.24 1.82-.55 2.69h-2.12Zm3.94-2.69h2.64c-.08.95-.34 1.86-.77 2.69h-2.36c.27-.87.43-1.77.49-2.69Zm0-1.26c-.05-.91-.21-1.8-.48-2.67h2.36c.42.82.68 1.72.76 2.67h-2.64Zm.42-4.61c.23.22.44.45.63.69H30.2c-.02-.05-.04-.1-.07-.15-.18-.39-.38-.76-.6-1.12-.23-.38-.49-.74-.76-1.09a7.338 7.338 0 0 1 2.82 1.66Zm-9.98-.01a7.088 7.088 0 0 1 2.9-1.69c-.29.36-.56.73-.8 1.13-.23.37-.43.74-.61 1.12l-.06.13h-2.07c.2-.24.41-.47.64-.69Zm-.02 10.48c-.22-.21-.41-.42-.6-.65h2.03s.03.06.04.09a11.029 11.029 0 0 0 1.37 2.24 7.203 7.203 0 0 1-2.84-1.69Zm10.02 0c-.22.21-.46.42-.72.6-.65.48-1.36.84-2.11 1.07a11.24 11.24 0 0 0 1.38-2.23c.02-.03.03-.07.05-.1h2.01c-.19.23-.39.45-.6.65ZM8.46.08C3.79.08 0 3.87 0 8.54S3.79 17 8.46 17s8.46-3.79 8.46-8.46S13.13.08 8.46.08Zm-.53 12.61H5.11v-1.6h2.35c.39 0 .48.29.48.46v1.14Zm4.07-1.9c.07.96.07 1.41.07 1.9H9.85v-.3c0-.31.01-.63-.04-1.28-.07-.95-.48-1.16-1.23-1.16H5.09V8.22h3.6c.95 0 1.43-.29 1.43-1.05 0-.67-.48-1.08-1.43-1.08h-3.6V4.4h3.99c2.15 0 3.22 1.02 3.22 2.64 0 1.21-.75 2.01-1.77 2.14.86.17 1.36.66 1.45 1.62Zm32.27-7.54c.14-.14.28-.25.43-.33a.671.671 0 0 0-.33-.08c-.84.02-1.57 1.34-1.77 2.21.3-.09.63-.19.95-.29.11-.55.37-1.14.72-1.51Zm-.29 4c.46-.04.85.15.85.15l.35-1.31s-.3-.15-.89-.11c-1.53.1-2.22 1.16-2.14 2.22.08 1.25 1.34 1.21 1.38 1.97 0 .18-.11.45-.43.46-.49.04-1.1-.43-1.1-.43l-.24 1s.61.65 1.72.58c.92-.05 1.55-.79 1.49-1.87-.09-1.37-1.63-1.5-1.66-2.08 0-.11 0-.54.67-.58Zm-.02-2.62c.39-.12.79-.25 1.15-.35 0-.3-.03-.75-.18-1.07-.15.07-.29.19-.39.29-.25.28-.47.71-.58 1.14Zm1.35-1.45c.13.33.16.72.16.99.2-.06.38-.12.55-.16-.09-.28-.29-.75-.71-.83Z" />
      <path d="M44.83 0c-4.69 0-8.5 3.81-8.5 8.5s3.81 8.5 8.5 8.5 8.5-3.81 8.5-8.5-3.8-8.5-8.5-8.5Zm1.97 13.72-6.87-1.19s.84-6.4.86-6.62c.04-.3.05-.31.36-.41 0 0 .45-.15 1.07-.34.06-.48.3-1.1.61-1.59.44-.7.98-1.09 1.53-1.11.28 0 .52.08.7.28 0 .02.03.03.04.05h.09c.42 0 .77.25 1.01.7.07.15.13.28.16.4.21-.06.34-.1.34-.1h.1v9.95Zm.21-.01V3.88c.18.18.67.65.67.65s.8.02.85.02.09.04.1.09c0 .05 1.24 8.35 1.24 8.35l-2.85.71Z" />
    </svg>
  );
}

function TicketLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M20.19 4H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.81-2-1.81-2zm-2.46 9.3l-8.86 2.36-1.66-2.88.93-.25 1.26.99 2.39-.64-2.4-4.16 1.4-.38 4.01 3.74 2.44-.65c.51-.14 1.04.17 1.18.68.13.51-.17 1.04-.69 1.19z"></path>
    </svg>
  );
}

// old code we might be using later

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
      <NewsletterSignup />
    </div>
  );
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

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    // Set the initial state
    setPrefersReducedMotion(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add the listener
    mediaQueryList.addEventListener("change", listener);

    // Clean up the listener on unmount
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, []);

  return prefersReducedMotion;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-conf-mono text-sm uppercase tracking-widest text-white/30 md:text-base">
      {children}
    </p>
  );
}
