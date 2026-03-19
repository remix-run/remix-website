import clsx from "clsx";
import type { RemixNode } from "remix/component/jsx-runtime";
import { JamLogoLink } from "../assets/jam-logo-link";
import { JamScrambleText } from "../assets/jam-scramble-text";
import { MobileMenu } from "../assets/mobile-menu";
import { Document } from "../components/document";
import {
  ICONS_SPRITE_HREF,
  JAM_BACKGROUND_MASK_AVIF,
  JAM_COLOR_SEATS_SVG,
  JAM_CSS_HREF,
  JAM_KEEPSAKE_BOARDING_PASS_AVIF,
  JAM_KEEPSAKE_PHOTO_1_AVIF,
  JAM_KEEPSAKE_PHOTO_2_AVIF,
  JAM_KEEPSAKE_PICK_AVIF,
  JAM_KEEPSAKE_POSTER_AVIF,
  JAM_KEEPSAKE_STICKER_SVG,
  JAM_KEEPSAKE_TICKET_AVIF,
} from "../constants/static-assets.ts";
import { routes } from "../routes";

const jamButtonClassName =
  "min-w-fit flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors duration-300 hover:bg-blue-brand hover:text-white md:px-6 md:py-4 md:text-xl";
const jamMobileMenuSummaryClass =
  "_no-triangle grid size-12 place-items-center rounded-full bg-white text-black backdrop-blur-lg outline-none transition-colors duration-300 hover:bg-blue-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-brand [[open]>&]:bg-blue-brand [[open]>&]:text-white [&_svg]:size-6";
const jamMobileMenuPositionClass = "absolute right-0 z-20 lg:left-0";
const jamMobileMenuWrapperClass = "relative top-1 w-max p-1";
const jamMobileMenuNavClass =
  "flex flex-col gap-2 overflow-hidden rounded-[2rem] bg-black/40 px-2 py-2.5 backdrop-blur-lg";

type JamPageProps = {
  title: string;
  description: string;
  pageUrl: string;
  previewImage: string;
  activePath: string;
  hideBackground?: boolean;
  showSeats?: boolean;
  children?: RemixNode;
};

export function JamDocument() {
  return (props: JamPageProps) => (
    <Document
      title={props.title}
      description={props.description}
      forceTheme="dark"
      headTags={[
        { kind: "meta", property: "og:type", content: "website" },
        { kind: "meta", property: "og:title", content: props.title },
        {
          kind: "meta",
          property: "og:description",
          content: props.description,
        },
        { kind: "meta", property: "og:url", content: props.pageUrl },
        {
          kind: "meta",
          property: "og:image",
          content: props.previewImage,
        },
        {
          kind: "meta",
          name: "twitter:card",
          content: "summary_large_image",
        },
        { kind: "meta", name: "twitter:title", content: props.title },
        {
          kind: "meta",
          name: "twitter:description",
          content: props.description,
        },
        {
          kind: "meta",
          name: "twitter:image",
          content: props.previewImage,
        },
        { kind: "link", rel: "stylesheet", href: JAM_CSS_HREF },
        {
          kind: "link",
          rel: "preload",
          href: "/font/jet-brains-mono.woff2",
          as: "font",
          crossorigin: "anonymous",
        },
      ]}
    >
      <JamPageScaffold
        activePath={props.activePath}
        hideBackground={props.hideBackground ?? false}
        showSeats={props.showSeats ?? false}
      >
        {props.children}
      </JamPageScaffold>
    </Document>
  );
}

function JamPageScaffold() {
  return (props: {
    activePath: string;
    hideBackground: boolean;
    showSeats: boolean;
    children?: RemixNode;
  }) => (
    <div class="relative overflow-hidden">
      <Background hideBackground={props.hideBackground}>
        <Navbar activePath={props.activePath} className="z-40" />
        <div class="px-6">{props.children}</div>
        <Footer showSeats={props.showSeats} className="relative z-20" />
      </Background>
    </div>
  );
}

function Background() {
  return (props: { hideBackground: boolean; children: RemixNode }) => {
    let filterId = "jam-background-filter";
    return (
      <div class="isolate">
        {props.children}
        {!props.hideBackground ? (
          <div
            class="fixed -inset-11"
            style={{ filter: `url(#${filterId}) blur(4px)` }}
            aria-hidden="true"
          >
            <svg class="absolute">
              <defs>
                <filter id={filterId}>
                  <feTurbulence
                    result="undulation"
                    numOctaves="2"
                    baseFrequency="0.000845,0.00338"
                    seed="0"
                    type="turbulence"
                  />
                  <feColorMatrix in="undulation" type="hueRotate" values="0" />
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
            <div
              class="size-full"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                maskImage: `url('${JAM_BACKGROUND_MASK_AVIF}')`,
                maskSize: "cover",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }}
            />
          </div>
        ) : null}
      </div>
    );
  };
}

function Navbar() {
  return (props: { className?: string; activePath: string }) => (
    <nav
      class={clsx(
        "fixed left-0 right-0 top-0 flex items-center justify-between p-4 md:p-9",
        props.className,
      )}
      style={{
        background:
          "linear-gradient(rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 75%)",
      }}
    >
      <JamLogoLink
        href={routes.jam2025.href()}
        brandHref={routes.brand.href()}
        class="flex items-center md:block"
      />
      <div class="hidden items-center justify-center gap-2 rounded-full bg-black/40 p-2 backdrop-blur-lg lg:flex">
        <NavLink
          href={routes.jam2025Lineup.href()}
          active={props.activePath === routes.jam2025Lineup.href()}
        >
          Schedule & Lineup
        </NavLink>
        <NavLink
          href={routes.jam2025Gallery.href()}
          active={props.activePath === routes.jam2025Gallery.href()}
        >
          Gallery
        </NavLink>
        <NavLink
          href={routes.jam2025Coc.href()}
          active={props.activePath === routes.jam2025Coc.href()}
        >
          Code of Conduct
        </NavLink>
        <NavLink
          href={routes.jam2025Faq.href()}
          active={props.activePath === routes.jam2025Faq.href()}
        >
          FAQ
        </NavLink>
      </div>
      <a
        class={clsx(jamButtonClassName, "hidden bg-white text-black lg:flex")}
        href={routes.jam2025Ticket.href()}
      >
        <TicketLogo class="size-6 fill-current md:size-8 lg:size-6 xl:size-8" />
        <span>Ticket</span>
      </a>
      <MobileMenu
        class="lg:hidden"
        summaryClass={jamMobileMenuSummaryClass}
        menuPositionClass={jamMobileMenuPositionClass}
        menuWrapperClass={jamMobileMenuWrapperClass}
        navClass={jamMobileMenuNavClass}
      >
        <MobileNavLink
          href={routes.jam2025Lineup.href()}
          active={props.activePath === routes.jam2025Lineup.href()}
        >
          Schedule & Lineup
        </MobileNavLink>
        <MobileNavLink
          href={routes.jam2025Gallery.href()}
          active={props.activePath === routes.jam2025Gallery.href()}
        >
          Gallery
        </MobileNavLink>
        <MobileNavLink
          href={routes.jam2025Coc.href()}
          active={props.activePath === routes.jam2025Coc.href()}
        >
          Code of Conduct
        </MobileNavLink>
        <MobileNavLink
          href={routes.jam2025Faq.href()}
          active={props.activePath === routes.jam2025Faq.href()}
        >
          FAQ
        </MobileNavLink>
        <MobileNavLink
          href={routes.jam2025Ticket.href()}
          active={props.activePath === routes.jam2025Ticket.href()}
        >
          Ticket
        </MobileNavLink>
      </MobileMenu>
    </nav>
  );
}

function NavLink() {
  return (props: { href: string; active: boolean; children: RemixNode }) => (
    <a
      href={props.href}
      class={clsx(
        "rounded-full border-2 px-5 py-0.5 text-base font-bold outline-none transition-colors duration-300 md:border-4 md:py-3 md:text-xl lg:border-2 lg:px-4 lg:py-2 lg:text-base xl:px-5 xl:py-3 xl:text-xl",
        props.active
          ? "border-white text-white"
          : "border-transparent text-white/70 hover:border-white hover:text-white focus-visible:border-white focus-visible:text-white",
      )}
    >
      {props.children}
    </a>
  );
}

function MobileNavLink() {
  return (props: { href: string; active: boolean; children: RemixNode }) => (
    <a
      href={props.href}
      class={clsx(
        "block min-w-max rounded-full border-2 px-4 py-2 text-lg font-bold outline-none transition-colors duration-300",
        props.active
          ? "border-white text-white"
          : "border-transparent text-white/70 hover:border-white hover:text-white focus-visible:border-white focus-visible:text-white",
      )}
    >
      {props.children}
    </a>
  );
}

function Footer() {
  return (props: { showSeats: boolean; className?: string }) => (
    <footer
      class={clsx("relative flex flex-col items-center", props.className)}
    >
      {props.showSeats ? (
        <>
          <div class="h-0 w-full md:h-28" />
          <div class="flex w-screen justify-center overflow-hidden">
            <img
              loading="lazy"
              src={JAM_COLOR_SEATS_SVG}
              alt=""
              class="block min-w-[1400px] sm:min-w-[1600px] md:min-w-[1800px] lg:min-w-[2000px] xl:min-w-[2200px] 2xl:min-w-[110vw]"
              aria-hidden="true"
            />
          </div>
        </>
      ) : null}
      <div
        class={clsx(
          "flex flex-col items-center gap-2 py-40 text-center font-mono text-xs md:text-base 2xl:py-32",
          props.showSeats
            ? "w-full bg-gradient-to-b from-[rgb(255,51,0)] to-[rgb(186,37,0)] text-white"
            : "text-gray-400",
        )}
      >
        <div class="flex items-center gap-5">
          <a
            href="/"
            class={clsx(
              "rounded-3xl border px-4 py-1 uppercase text-white",
              props.showSeats
                ? "border-white hover:underline"
                : "border-gray-400 hover:text-blue-brand",
            )}
          >
            remix.run
          </a>
          <a
            href="https://github.com/remix-run"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            class="inline-flex size-6 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white md:size-8 [&>svg]:size-full"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <use href={`${ICONS_SPRITE_HREF}#github`} />
            </svg>
          </a>
          <a
            href="https://twitter.com/remix_run"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            class="inline-flex size-6 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white md:size-8 [&>svg]:size-full"
          >
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="currentColor">
              <use href={`${ICONS_SPRITE_HREF}#twitter`} />
            </svg>
          </a>
          <a
            href="https://youtube.com/remix_run"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            class="inline-flex size-6 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white md:size-8 [&>svg]:size-full"
          >
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="currentColor">
              <use href={`${ICONS_SPRITE_HREF}#youtube`} />
            </svg>
          </a>
          <a
            href="https://discord.gg/xwx7mMzVkA"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            class="inline-flex size-6 shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white md:size-8 [&>svg]:size-full"
          >
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="currentColor">
              <use href={`${ICONS_SPRITE_HREF}#discord`} />
            </svg>
          </a>
        </div>
        <div class="flex flex-col items-center gap-2 uppercase leading-loose">
          <div>
            docs and examples licensed under{" "}
            <a
              href="https://opensource.org/licenses/MIT"
              class={clsx(
                "text-white",
                props.showSeats ? "hover:underline" : "hover:text-blue-brand",
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
              class={clsx(
                "text-white",
                props.showSeats ? "hover:underline" : "hover:text-blue-brand",
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

export function Title() {
  return (props: { children: RemixNode; className?: string }) => (
    <h1
      class={clsx(
        "flex flex-col gap-2 text-3xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-5xl md:text-7xl md:leading-none",
        props.className,
      )}
    >
      {props.children}
    </h1>
  );
}

export let ScrambleText = JamScrambleText;

export function SectionLabel() {
  return (props: { children: RemixNode }) => (
    <p class="font-mono text-xs uppercase tracking-widest text-white/50 md:text-base">
      {props.children}
    </p>
  );
}

export function InfoText() {
  return (props: { children: RemixNode; className?: string }) => (
    <div class={clsx("text-center", props.className)}>
      <p class="text-lg font-bold leading-[1.4] text-white md:text-3xl">
        {props.children}
      </p>
    </div>
  );
}

export function Subheader() {
  return (props: { children: RemixNode; className?: string }) => (
    <h2
      class={clsx(
        "text-2xl font-bold tracking-tight text-white md:text-3xl",
        props.className,
      )}
    >
      {props.children}
    </h2>
  );
}

export function Paragraph() {
  return (props: { children: RemixNode; className?: string }) => (
    <p
      class={clsx(
        "text-white/80 [&_a:hover]:underline [&_a]:text-blue-400",
        props.className,
      )}
    >
      {props.children}
    </p>
  );
}

export function AddressMain() {
  return () => (
    <address class="inline-block text-lg font-bold not-italic leading-relaxed text-white md:text-3xl">
      620 King St W
      <br />
      Toronto, ON M5V 1M7, Canada
    </address>
  );
}

export function AddressLink() {
  return () => (
    <a
      href="https://maps.app.goo.gl/GpacrBAJJMnctN9W7"
      target="_blank"
      rel="noopener noreferrer"
      class="text-blue-400 hover:underline"
    >
      620 King St W Toronto, ON M5V 1M7, Canada
    </a>
  );
}

export function JamButton() {
  return (props: {
    children: RemixNode;
    className?: string;
    disabled?: boolean;
    type?: "button" | "submit";
    active?: boolean;
  }) => (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      class={clsx(
        jamButtonClassName,
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black",
        props.active ? "bg-blue-brand text-white" : "bg-white text-black",
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}

export function KeepsakesStatic() {
  return () => (
    <div class="isolate">
      <Keepsake className="photo-1" hasBorder src={JAM_KEEPSAKE_PHOTO_1_AVIF} />
      <Keepsake className="photo-2" hasBorder src={JAM_KEEPSAKE_PHOTO_2_AVIF} />
      <Keepsake className="poster" src={JAM_KEEPSAKE_POSTER_AVIF} />
      <Keepsake className="pick" src={JAM_KEEPSAKE_PICK_AVIF} />
      <Keepsake className="ticket" src={JAM_KEEPSAKE_TICKET_AVIF} />
      <Keepsake className="boarding-pass" src={JAM_KEEPSAKE_BOARDING_PASS_AVIF} />
      <Keepsake className="sticker" src={JAM_KEEPSAKE_STICKER_SVG} />
    </div>
  );
}

function Keepsake() {
  return (props: { className: string; src: string; hasBorder?: boolean }) => (
    <div class="keepsake-container relative">
      <div class={clsx("keepsake select-none", props.className)}>
        <div class="rotate">
          <div
            class={clsx("h-full w-full", {
              "rounded border-[6px] border-white md:border-[16px]":
                props.hasBorder,
            })}
          >
            <img src={props.src} alt="" draggable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function transformShopifyImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: "webp" | "jpg" | "png";
    quality?: number;
  } = {},
) {
  try {
    let urlObj = new URL(url);
    let params = new URLSearchParams(urlObj.search);
    for (let [key, value] of Object.entries(options)) {
      if (value !== undefined) params.set(key, value.toString());
    }
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}

function TicketLogo() {
  return (props: { class?: string }) => (
    <svg viewBox="0 0 24 24" class={props.class}>
      <path d="M20.19 4H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.81-2-1.81-2zm-2.46 9.3l-8.86 2.36-1.66-2.88.93-.25 1.26.99 2.39-.64-2.4-4.16 1.4-.38 4.01 3.74 2.44-.65c.51-.14 1.04.17 1.18.68.13.51-.17 1.04-.69 1.19z"></path>
    </svg>
  );
}
