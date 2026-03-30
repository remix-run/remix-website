import clsx from "clsx";
import type { RemixNode } from "remix/component/jsx-runtime";
import { JamScrambleText } from "../assets/jam-scramble-text";
import { MobileMenu } from "../assets/mobile-menu";
import { Document } from "../ui/document";
import { routes } from "../routes";
import { assetPaths } from "../shared/asset-paths";
import jamStylesHref from "../shared/styles/jam.css?url";

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
        { kind: "link", rel: "stylesheet", href: jamStylesHref },
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
                maskImage: `url('${assetPaths.jam2025.backgroundMask}')`,
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
      <a href={routes.jam2025.href()} class="flex items-center md:block">
        <JamLogo class="h-[48px] fill-white md:h-auto md:w-[200px] lg:w-[160px] xl:w-[200px]" />
      </a>
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
              src={assetPaths.jam2025.colorSeats}
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
              <use href={`${assetPaths.iconsSprite}#github`} />
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
              <use href={`${assetPaths.iconsSprite}#twitter`} />
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
              <use href={`${assetPaths.iconsSprite}#youtube`} />
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
              <use href={`${assetPaths.iconsSprite}#discord`} />
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
      <Keepsake
        className="photo-1"
        hasBorder
        src={assetPaths.jam2025.keepsakes.photo1}
      />
      <Keepsake
        className="photo-2"
        hasBorder
        src={assetPaths.jam2025.keepsakes.photo2}
      />
      <Keepsake className="poster" src={assetPaths.jam2025.keepsakes.poster} />
      <Keepsake className="pick" src={assetPaths.jam2025.keepsakes.pick} />
      <Keepsake className="ticket" src={assetPaths.jam2025.keepsakes.ticket} />
      <Keepsake
        className="boarding-pass"
        src={assetPaths.jam2025.keepsakes.boardingPass}
      />
      <Keepsake
        className="sticker"
        src={assetPaths.jam2025.keepsakes.sticker}
      />
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

function JamLogo() {
  return (props: { class?: string }) => (
    <svg viewBox="0 0 53.33 17" class={props.class}>
      <path d="M32.46 2.34c-.25-.23-.51-.46-.79-.67a8.474 8.474 0 0 0-4.4-1.65S27.05 0 27.05 0c-.2-.01-.39-.01-.57 0h-.43v.01c-1.63.11-3.18.68-4.49 1.65-.28.21-.55.43-.79.67-1.7 1.62-2.64 3.81-2.64 6.16s.93 4.52 2.62 6.13c.26.25.55.49.84.71 1.28.94 2.78 1.5 4.36 1.63s.22.02.22.02c.14 0 .29.01.45.01s.31 0 .44-.01h.22v-.02c1.58-.12 3.09-.68 4.37-1.63.3-.22.58-.46.84-.71 1.69-1.62 2.62-3.8 2.62-6.14s-.94-4.54-2.64-6.15ZM19.39 9.13h2.68c.05.92.21 1.82.48 2.69h-2.38c-.43-.83-.69-1.74-.77-2.69Zm9.97-3.92c.3.86.49 1.75.54 2.67h-2.67V5.21h2.13Zm-2.13-1.26V1.73c.47.49.88 1.03 1.24 1.61.12.19.23.4.34.61h-1.58Zm-1.26-2.14v2.13h-1.52c.11-.2.22-.4.34-.59.34-.55.74-1.07 1.18-1.54Zm0 3.4v2.67h-2.63c.06-.92.25-1.81.56-2.67h2.08Zm-3.9 2.66h-2.69c.08-.94.34-1.84.76-2.67h2.41c-.27.86-.44 1.75-.49 2.67Zm1.26 1.26h2.64v2.69h-2.1c-.31-.86-.49-1.76-.54-2.69Zm2.64 3.95v2.19c-.45-.48-.86-1.01-1.2-1.58-.12-.2-.24-.4-.35-.62h1.55Zm1.26 2.19v-2.2h1.57a9.376 9.376 0 0 1-1.57 2.2Zm0-3.45V9.13h2.67c-.06.92-.24 1.82-.55 2.69h-2.12Zm3.94-2.69h2.64c-.08.95-.34 1.86-.77 2.69h-2.36c.27-.87.43-1.77.49-2.69Zm0-1.26c-.05-.91-.21-1.8-.48-2.67h2.36c.42.82.68 1.72.76 2.67h-2.64Zm.42-4.61c.23.22.44.45.63.69H30.2c-.02-.05-.04-.1-.07-.15-.18-.39-.38-.76-.6-1.12-.23-.38-.49-.74-.76-1.09a7.338 7.338 0 0 1 2.82 1.66Zm-9.98-.01a7.088 7.088 0 0 1 2.9-1.69c-.29.36-.56.73-.8 1.13-.23.37-.43.74-.61 1.12l-.06.13h-2.07c.2-.24.41-.47.64-.69Zm-.02 10.48c-.22-.21-.41-.42-.6-.65h2.03s.03.06.04.09a11.029 11.029 0 0 0 1.37 2.24 7.203 7.203 0 0 1-2.84-1.69Zm10.02 0c-.22.21-.46.42-.72.6-.65.48-1.36.84-2.11 1.07a11.24 11.24 0 0 0 1.38-2.23c.02-.03.03-.07.05-.1h2.01c-.19.23-.39.45-.6.65ZM8.46.08C3.79.08 0 3.87 0 8.54S3.79 17 8.46 17s8.46-3.79 8.46-8.46S13.13.08 8.46.08Zm-.53 12.61H5.11v-1.6h2.35c.39 0 .48.29.48.46v1.14Zm4.07-1.9c.07.96.07 1.41.07 1.9H9.85v-.3c0-.31.01-.63-.04-1.28-.07-.95-.48-1.16-1.23-1.16H5.09V8.22h3.6c.95 0 1.43-.29 1.43-1.05 0-.67-.48-1.08-1.43-1.08h-3.6V4.4h3.99c2.15 0 3.22 1.02 3.22 2.64 0 1.21-.75 2.01-1.77 2.14.86.17 1.36.66 1.45 1.62Zm32.27-7.54c.14-.14.28-.25.43-.33a.671.671 0 0 0-.33-.08c-.84.02-1.57 1.34-1.77 2.21.3-.09.63-.19.95-.29.11-.55.37-1.14.72-1.51Zm-.29 4c.46-.04.85.15.85.15l.35-1.31s-.3-.15-.89-.11c-1.53.1-2.22 1.16-2.14 2.22.08 1.25 1.34 1.21 1.38 1.97 0 .18-.11.45-.43.46-.49.04-1.1-.43-1.1-.43l-.24 1s.61.65 1.72.58c.92-.05 1.55-.79 1.49-1.87-.09-1.37-1.63-1.5-1.66-2.08 0-.11 0-.54.67-.58Zm-.02-2.62c.39-.12.79-.25 1.15-.35 0-.3-.03-.75-.18-1.07-.15.07-.29.19-.39.29-.25.28-.47.71-.58 1.14Zm1.35-1.45c.13.33.16.72.16.99.2-.06.38-.12.55-.16-.09-.28-.29-.75-.71-.83Z" />
      <path d="M44.83 0c-4.69 0-8.5 3.81-8.5 8.5s3.81 8.5 8.5 8.5 8.5-3.81 8.5-8.5-3.8-8.5-8.5-8.5Zm1.97 13.72-6.87-1.19s.84-6.4.86-6.62c.04-.3.05-.31.36-.41 0 0 .45-.15 1.07-.34.06-.48.3-1.1.61-1.59.44-.7.98-1.09 1.53-1.11.28 0 .52.08.7.28 0 .02.03.03.04.05h.09c.42 0 .77.25 1.01.7.07.15.13.28.16.4.21-.06.34-.1.34-.1h.1v9.95Zm.21-.01V3.88c.18.18.67.65.67.65s.8.02.85.02.09.04.1.09c0 .05 1.24 8.35 1.24 8.35l-2.85.71Z" />
    </svg>
  );
}

function TicketLogo() {
  return (props: { class?: string }) => (
    <svg viewBox="0 0 24 24" class={props.class}>
      <path d="M20.19 4H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.81-2-1.81-2zm-2.46 9.3l-8.86 2.36-1.66-2.88.93-.25 1.26.99 2.39-.64-2.4-4.16 1.4-.38 4.01 3.74 2.44-.65c.51-.14 1.04.17 1.18.68.13.51-.17 1.04-.69 1.19z"></path>
    </svg>
  );
}
