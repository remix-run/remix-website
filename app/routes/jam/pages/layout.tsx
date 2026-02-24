import { Outlet, redirect, useMatches } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import { useId, useRef } from "react";
import { clsx } from "clsx";
import { Discord, GitHub, Twitter, YouTube } from "~/ui/icons";
import { Navbar } from "../navbar";
import { useHideBackground } from "../utils";

import type { Route } from "./+types/layout";

import jamStyles from "../../../../shared/jam.css?url";
import maskSrc from "../images/background-mask.avif";
import seatsSrc from "../images/remix-color-seats.svg";

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
      href: "/font/jet-brains-mono.woff2",
      crossOrigin: "anonymous",
    },
    { rel: "stylesheet", href: jamStyles },
  ];
}

export let handle = {
  forceTheme: "dark",
};

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  // Only redirect if we're at the index path (/jam or /jam/)
  if (url.pathname === "/jam" || url.pathname === "/jam/") {
    return redirect("/jam/2025");
  }

  // Otherwise, continue to the requested route
  return null;
}

export default function JamLayout() {
  return (
    <div className="relative overflow-hidden">
      <Background>
        <Navbar className="z-40" />
        <div className="px-6">
          <Outlet />
        </div>
        <Footer className="relative z-20" />
      </Background>
    </div>
  );
}

function Background({ children }: { children: React.ReactNode }) {
  let colorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  let filterId = useId();

  let hideBackground = useHideBackground();

  return (
    <>
      <div className="isolate">
        {children}

        {/* Layer applying the animated SVG filter */}
        {!hideBackground ? (
          <div
            className="fixed -inset-11"
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
                maskImage: `url('${maskSrc}')`,
                maskSize: "cover",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}

const socialClassName =
  "size-6 transition-colors text-white/50 hover:text-white md:size-8";

function Footer({ className }: { className?: string }) {
  const showSeats = useShowSeats();

  return (
    <footer className={clsx("relative flex flex-col items-center", className)}>
      {showSeats && (
        <>
          <div className="h-0 w-full md:h-28" />
          <div className="flex w-screen justify-center overflow-hidden">
            <img
              loading="lazy"
              src={seatsSrc}
              alt=""
              className="block min-w-[1400px] sm:min-w-[1600px] md:min-w-[1800px] lg:min-w-[2000px] xl:min-w-[2200px] 2xl:min-w-[110vw]"
              aria-hidden="true"
            />
          </div>
        </>
      )}
      <div
        className={clsx(
          "flex flex-col items-center gap-2 py-40 text-center font-mono text-xs md:text-base 2xl:py-32",
          showSeats
            ? "w-full bg-gradient-to-b from-[rgb(255,51,0)] to-[rgb(186,37,0)] text-white"
            : "text-gray-400",
        )}
      >
        <div className="flex items-center gap-5">
          <a
            href="/"
            className={clsx(
              "rounded-3xl border px-4 py-1 uppercase text-white",
              showSeats
                ? "border-white hover:underline"
                : "border-gray-400 hover:text-blue-brand",
            )}
          >
            remix.run
          </a>
          <a
            href="https://github.com/remix-run"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHub className={socialClassName} aria-hidden />
          </a>
          <a
            href="https://twitter.com/remix_run"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter className={socialClassName} aria-hidden />
          </a>
          <a
            href="https://youtube.com/remix_run"
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <YouTube className={socialClassName} aria-hidden />
          </a>
          <a
            href="https://discord.gg/xwx7mMzVkA"
            aria-label="Discord"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Discord className={socialClassName} aria-hidden />
          </a>
        </div>
        <div className="flex flex-col items-center gap-2 uppercase leading-loose">
          <div>
            docs and examples licensed under{" "}
            <a
              href="https://opensource.org/licenses/MIT"
              className={clsx(
                "text-white",
                showSeats ? "hover:underline" : "hover:text-blue-brand",
              )}
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
              className={clsx(
                "text-white",
                showSeats ? "hover:underline" : "hover:text-blue-brand",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Shopify, Inc.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function useShowSeats() {
  const matches = useMatches();
  return matches.some((match) => {
    const handle = match.handle;
    return (
      handle &&
      typeof handle === "object" &&
      "showSeats" in handle &&
      handle.showSeats === true
    );
  });
}
