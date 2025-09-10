import { Outlet, redirect } from "react-router";
import { CACHE_CONTROL } from "~/lib/http.server";
import { Link } from "react-router";
import { useId, useRef } from "react";
import { clsx } from "clsx";
import { Discord, GitHub, Twitter, YouTube } from "~/ui/icons";
import { Navbar } from "../navbar";
import { useHideBackground } from "../utils";

import type { Route } from "./+types/layout";

import jamStyles from "../jam.css?url";
import maskSrc from "../images/background-mask.avif";

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
    <div className="relative overflow-x-hidden px-6">
      <Background>
        <Navbar className="z-40" />
        <Outlet />
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
      {/* Base radial gradient layer */}
      <div
        className="fixed -inset-11 z-0 select-none"
        style={{
          background:
            "radial-gradient(72% 63% at 50% 32.300000000000004%,#3b3b3b .036346160613726086%,rgb(26,26,26) 100%)",
        }}
      />

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

const socialClassName = "size-6 transition-colors hover:text-white md:size-8";

function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={clsx(
        "flex flex-col items-center gap-2 py-[160px] text-center font-conf-mono text-xs text-gray-400 md:text-base",
        className,
      )}
    >
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
          href="https://rmx.as/discord"
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
