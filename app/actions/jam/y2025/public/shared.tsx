import { css, type Handle, type Props, type RemixNode } from "remix/ui";
import { JamScrambleText } from "./scramble-text.tsx";
import { Icon } from "../../../../ui/public/icon.tsx";
import { MobileMenu } from "../../../../ui/public/mobile-menu.tsx";
import { routes } from "../../../../routes.ts";
import { assetPaths } from "../../../../utils/public/asset-paths.ts";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

export function JamPageScaffold(
  handle: Handle<{
    activePath: string;
    hideBackground: boolean;
    showSeats: boolean;
    children?: RemixNode;
  }>,
) {
  return () => (
    <div mix={pageScaffoldStyle}>
      <Background hideBackground={handle.props.hideBackground}>
        <Navbar activePath={handle.props.activePath} />
        <div mix={pageContentStyle}>{handle.props.children}</div>
        <Footer showSeats={handle.props.showSeats} />
      </Background>
    </div>
  );
}

function Background(
  handle: Handle<{ hideBackground: boolean; children: RemixNode }>,
) {
  return () => {
    return (
      <div mix={backgroundRootStyle}>
        {handle.props.children}
        {!handle.props.hideBackground ? (
          <div mix={backgroundEffectStyle} aria-hidden="true">
            <svg mix={backgroundFilterSvgStyle}>
              <defs>
                <filter id="jam-background-filter">
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
            <div mix={backgroundMaskStyle} />
          </div>
        ) : null}
      </div>
    );
  };
}

function Navbar(handle: Handle<{ activePath: string }>) {
  return () => (
    <nav mix={navbarStyle}>
      <a href={routes.jam.y2025.index.href()} mix={navbarLogoLinkStyle}>
        <JamLogo mix={jamLogoStyle} />
      </a>
      <div mix={desktopNavStyle}>
        <NavLink
          href={routes.jam.y2025.lineup.href()}
          active={handle.props.activePath === routes.jam.y2025.lineup.href()}
        >
          Schedule & Lineup
        </NavLink>
        <NavLink
          href={routes.jam.y2025.gallery.index.href()}
          active={
            handle.props.activePath === routes.jam.y2025.gallery.index.href()
          }
        >
          Gallery
        </NavLink>
        <NavLink
          href={routes.jam.y2025.coc.href()}
          active={handle.props.activePath === routes.jam.y2025.coc.href()}
        >
          Code of Conduct
        </NavLink>
        <NavLink
          href={routes.jam.y2025.faq.href()}
          active={handle.props.activePath === routes.jam.y2025.faq.href()}
        >
          FAQ
        </NavLink>
      </div>
      <a
        mix={[jamButtonStyle, navbarTicketStyle]}
        href={routes.jam.y2025.ticket.index.href()}
      >
        <TicketLogo mix={navbarTicketIconStyle} />
        <span>Ticket</span>
      </a>
      <div mix={jamMobileMenuStyle}>
        <MobileMenu unstyled>
          <MobileNavLink
            href={routes.jam.y2025.lineup.href()}
            active={handle.props.activePath === routes.jam.y2025.lineup.href()}
          >
            Schedule & Lineup
          </MobileNavLink>
          <MobileNavLink
            href={routes.jam.y2025.gallery.index.href()}
            active={
              handle.props.activePath === routes.jam.y2025.gallery.index.href()
            }
          >
            Gallery
          </MobileNavLink>
          <MobileNavLink
            href={routes.jam.y2025.coc.href()}
            active={handle.props.activePath === routes.jam.y2025.coc.href()}
          >
            Code of Conduct
          </MobileNavLink>
          <MobileNavLink
            href={routes.jam.y2025.faq.href()}
            active={handle.props.activePath === routes.jam.y2025.faq.href()}
          >
            FAQ
          </MobileNavLink>
          <MobileNavLink
            href={routes.jam.y2025.ticket.index.href()}
            active={
              handle.props.activePath === routes.jam.y2025.ticket.index.href()
            }
          >
            Ticket
          </MobileNavLink>
        </MobileMenu>
      </div>
    </nav>
  );
}

function NavLink(
  handle: Handle<{ href: string; active: boolean; children: RemixNode }>,
) {
  return () => (
    <a
      href={handle.props.href}
      mix={[
        navLinkStyle,
        handle.props.active ? activeNavLinkStyle : inactiveNavLinkStyle,
      ]}
    >
      {handle.props.children}
    </a>
  );
}

function MobileNavLink(
  handle: Handle<{ href: string; active: boolean; children: RemixNode }>,
) {
  return () => (
    <a
      href={handle.props.href}
      mix={[
        mobileNavLinkStyle,
        handle.props.active ? activeNavLinkStyle : inactiveNavLinkStyle,
      ]}
    >
      {handle.props.children}
    </a>
  );
}

function Footer(handle: Handle<{ showSeats: boolean }>) {
  return () => (
    <footer mix={jamFooterStyle}>
      {handle.props.showSeats ? (
        <>
          <div mix={seatsSpacerStyle} />
          <div mix={seatsFrameStyle}>
            <img
              loading="lazy"
              src={assetPaths.jam2025.colorSeats}
              alt=""
              mix={seatsImageStyle}
              aria-hidden="true"
            />
          </div>
        </>
      ) : null}
      <div
        mix={[
          footerContentStyle,
          handle.props.showSeats ? seatsFooterStyle : plainFooterStyle,
        ]}
      >
        <div mix={footerLinksStyle}>
          <a
            href={routes.home.href()}
            mix={[
              footerHomeLinkStyle,
              handle.props.showSeats
                ? seatsFooterLinkStyle
                : plainFooterLinkStyle,
            ]}
          >
            remix.run
          </a>
          <a
            href="https://github.com/remix-run"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            mix={footerSocialLinkStyle}
          >
            <Icon
              name="github"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
            />
          </a>
          <a
            href="https://x.com/remix_run"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            mix={footerSocialLinkStyle}
          >
            <Icon
              name="x"
              aria-hidden="true"
              viewBox="0 0 300 271"
              fill="currentColor"
            />
          </a>
          <a
            href="https://youtube.com/remix_run"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            mix={footerSocialLinkStyle}
          >
            <Icon
              name="youtube"
              aria-hidden="true"
              viewBox="0 0 40 40"
              fill="currentColor"
            />
          </a>
          <a
            href="https://remix.run/discord"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            mix={footerSocialLinkStyle}
          >
            <Icon
              name="discord"
              aria-hidden="true"
              viewBox="0 0 40 40"
              fill="currentColor"
            />
          </a>
        </div>
        <div mix={footerLegalStyle}>
          <div>
            docs and examples licensed under{" "}
            <a
              href="https://opensource.org/licenses/MIT"
              mix={
                handle.props.showSeats
                  ? seatsLegalLinkStyle
                  : plainLegalLinkStyle
              }
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
              mix={
                handle.props.showSeats
                  ? seatsLegalLinkStyle
                  : plainLegalLinkStyle
              }
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

export function Title(
  handle: Handle<{ children: RemixNode; mix?: Props<"h1">["mix"] }>,
) {
  return () => (
    <h1 mix={handle.props.mix ? [titleStyle, handle.props.mix] : titleStyle}>
      {handle.props.children}
    </h1>
  );
}

export let ScrambleText = JamScrambleText;

export function SectionLabel(handle: Handle<{ children: RemixNode }>) {
  return () => <p mix={sectionLabelStyle}>{handle.props.children}</p>;
}

export function InfoText(
  handle: Handle<{ children: RemixNode; mix?: Props<"div">["mix"] }>,
) {
  return () => (
    <div
      mix={handle.props.mix ? [infoTextStyle, handle.props.mix] : infoTextStyle}
    >
      <p mix={infoTextParagraphStyle}>{handle.props.children}</p>
    </div>
  );
}

export function Subheader(
  handle: Handle<{ children: RemixNode; mix?: Props<"h2">["mix"] }>,
) {
  return () => (
    <h2
      mix={
        handle.props.mix ? [subheaderStyle, handle.props.mix] : subheaderStyle
      }
    >
      {handle.props.children}
    </h2>
  );
}

export function Paragraph(
  handle: Handle<{ children: RemixNode; mix?: Props<"p">["mix"] }>,
) {
  return () => (
    <p
      mix={
        handle.props.mix ? [paragraphStyle, handle.props.mix] : paragraphStyle
      }
    >
      {handle.props.children}
    </p>
  );
}

export function AddressMain() {
  return () => (
    <address mix={addressMainStyle}>
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
      mix={textLinkStyle}
    >
      620 King St W Toronto, ON M5V 1M7, Canada
    </a>
  );
}

export function JamButton(
  handle: Handle<{
    children: RemixNode;
    mix?: Props<"button">["mix"];
    disabled?: boolean;
    type?: "button" | "submit";
    active?: boolean;
  }>,
) {
  return () => {
    let stateStyle = handle.props.active
      ? activeJamButtonStyle
      : inactiveJamButtonStyle;
    return (
      <button
        type={handle.props.type ?? "button"}
        disabled={handle.props.disabled}
        mix={
          handle.props.mix
            ? [
                jamButtonStyle,
                jamButtonDisabledStyle,
                stateStyle,
                handle.props.mix,
              ]
            : [jamButtonStyle, jamButtonDisabledStyle, stateStyle]
        }
      >
        {handle.props.children}
      </button>
    );
  };
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

function JamLogo(handle: Handle<{ mix?: Props<"svg">["mix"] }>) {
  return () => (
    <svg viewBox="0 0 53.33 17" mix={handle.props.mix}>
      <path d="M32.46 2.34c-.25-.23-.51-.46-.79-.67a8.474 8.474 0 0 0-4.4-1.65S27.05 0 27.05 0c-.2-.01-.39-.01-.57 0h-.43v.01c-1.63.11-3.18.68-4.49 1.65-.28.21-.55.43-.79.67-1.7 1.62-2.64 3.81-2.64 6.16s.93 4.52 2.62 6.13c.26.25.55.49.84.71 1.28.94 2.78 1.5 4.36 1.63s.22.02.22.02c.14 0 .29.01.45.01s.31 0 .44-.01h.22v-.02c1.58-.12 3.09-.68 4.37-1.63.3-.22.58-.46.84-.71 1.69-1.62 2.62-3.8 2.62-6.14s-.94-4.54-2.64-6.15ZM19.39 9.13h2.68c.05.92.21 1.82.48 2.69h-2.38c-.43-.83-.69-1.74-.77-2.69Zm9.97-3.92c.3.86.49 1.75.54 2.67h-2.67V5.21h2.13Zm-2.13-1.26V1.73c.47.49.88 1.03 1.24 1.61.12.19.23.4.34.61h-1.58Zm-1.26-2.14v2.13h-1.52c.11-.2.22-.4.34-.59.34-.55.74-1.07 1.18-1.54Zm0 3.4v2.67h-2.63c.06-.92.25-1.81.56-2.67h2.08Zm-3.9 2.66h-2.69c.08-.94.34-1.84.76-2.67h2.41c-.27.86-.44 1.75-.49 2.67Zm1.26 1.26h2.64v2.69h-2.1c-.31-.86-.49-1.76-.54-2.69Zm2.64 3.95v2.19c-.45-.48-.86-1.01-1.2-1.58-.12-.2-.24-.4-.35-.62h1.55Zm1.26 2.19v-2.2h1.57a9.376 9.376 0 0 1-1.57 2.2Zm0-3.45V9.13h2.67c-.06.92-.24 1.82-.55 2.69h-2.12Zm3.94-2.69h2.64c-.08.95-.34 1.86-.77 2.69h-2.36c.27-.87.43-1.77.49-2.69Zm0-1.26c-.05-.91-.21-1.8-.48-2.67h2.36c.42.82.68 1.72.76 2.67h-2.64Zm.42-4.61c.23.22.44.45.63.69H30.2c-.02-.05-.04-.1-.07-.15-.18-.39-.38-.76-.6-1.12-.23-.38-.49-.74-.76-1.09a7.338 7.338 0 0 1 2.82 1.66Zm-9.98-.01a7.088 7.088 0 0 1 2.9-1.69c-.29.36-.56.73-.8 1.13-.23.37-.43.74-.61 1.12l-.06.13h-2.07c.2-.24.41-.47.64-.69Zm-.02 10.48c-.22-.21-.41-.42-.6-.65h2.03s.03.06.04.09a11.029 11.029 0 0 0 1.37 2.24 7.203 7.203 0 0 1-2.84-1.69Zm10.02 0c-.22.21-.46.42-.72.6-.65.48-1.36.84-2.11 1.07a11.24 11.24 0 0 0 1.38-2.23c.02-.03.03-.07.05-.1h2.01c-.19.23-.39.45-.6.65ZM8.46.08C3.79.08 0 3.87 0 8.54S3.79 17 8.46 17s8.46-3.79 8.46-8.46S13.13.08 8.46.08Zm-.53 12.61H5.11v-1.6h2.35c.39 0 .48.29.48.46v1.14Zm4.07-1.9c.07.96.07 1.41.07 1.9H9.85v-.3c0-.31.01-.63-.04-1.28-.07-.95-.48-1.16-1.23-1.16H5.09V8.22h3.6c.95 0 1.43-.29 1.43-1.05 0-.67-.48-1.08-1.43-1.08h-3.6V4.4h3.99c2.15 0 3.22 1.02 3.22 2.64 0 1.21-.75 2.01-1.77 2.14.86.17 1.36.66 1.45 1.62Zm32.27-7.54c.14-.14.28-.25.43-.33a.671.671 0 0 0-.33-.08c-.84.02-1.57 1.34-1.77 2.21.3-.09.63-.19.95-.29.11-.55.37-1.14.72-1.51Zm-.29 4c.46-.04.85.15.85.15l.35-1.31s-.3-.15-.89-.11c-1.53.1-2.22 1.16-2.14 2.22.08 1.25 1.34 1.21 1.38 1.97 0 .18-.11.45-.43.46-.49.04-1.1-.43-1.1-.43l-.24 1s.61.65 1.72.58c.92-.05 1.55-.79 1.49-1.87-.09-1.37-1.63-1.5-1.66-2.08 0-.11 0-.54.67-.58Zm-.02-2.62c.39-.12.79-.25 1.15-.35 0-.3-.03-.75-.18-1.07-.15.07-.29.19-.39.29-.25.28-.47.71-.58 1.14Zm1.35-1.45c.13.33.16.72.16.99.2-.06.38-.12.55-.16-.09-.28-.29-.75-.71-.83Z" />
      <path d="M44.83 0c-4.69 0-8.5 3.81-8.5 8.5s3.81 8.5 8.5 8.5 8.5-3.81 8.5-8.5-3.8-8.5-8.5-8.5Zm1.97 13.72-6.87-1.19s.84-6.4.86-6.62c.04-.3.05-.31.36-.41 0 0 .45-.15 1.07-.34.06-.48.3-1.1.61-1.59.44-.7.98-1.09 1.53-1.11.28 0 .52.08.7.28 0 .02.03.03.04.05h.09c.42 0 .77.25 1.01.7.07.15.13.28.16.4.21-.06.34-.1.34-.1h.1v9.95Zm.21-.01V3.88c.18.18.67.65.67.65s.8.02.85.02.09.04.1.09c0 .05 1.24 8.35 1.24 8.35l-2.85.71Z" />
    </svg>
  );
}

function TicketLogo(handle: Handle<{ mix?: Props<"svg">["mix"] }>) {
  return () => (
    <svg viewBox="0 0 24 24" mix={handle.props.mix}>
      <path d="M20.19 4H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.81-2-1.81-2zm-2.46 9.3l-8.86 2.36-1.66-2.88.93-.25 1.26.99 2.39-.64-2.4-4.16 1.4-.38 4.01 3.74 2.44-.65c.51-.14 1.04.17 1.18.68.13.51-.17 1.04-.69 1.19z"></path>
    </svg>
  );
}

let pageScaffoldStyle = css({ position: "relative", overflow: "hidden" });
let pageContentStyle = css({ paddingInline: "24px" });
let backgroundRootStyle = css({ isolation: "isolate" });

let backgroundEffectStyle = css({
  position: "fixed",
  inset: "-44px",
  filter: "url(#jam-background-filter) blur(4px)",
});

let backgroundFilterSvgStyle = css({ position: "absolute" });

let backgroundMaskStyle = css({
  width: "100%",
  height: "100%",
  backgroundColor: "rgb(0 0 0 / 0.3)",
  maskImage: `url('${assetPaths.jam2025.backgroundMask}')`,
  maskSize: "cover",
  maskRepeat: "no-repeat",
  maskPosition: "center",
});

let navbarStyle = css({
  position: "fixed",
  inset: "0 0 auto",
  zIndex: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px",
  background: "linear-gradient(rgb(0 0 0 / 0.7) 0%, rgb(0 0 0 / 0) 75%)",
  [breakpointMedia.md]: { padding: "36px" },
});

let navbarLogoLinkStyle = css({
  display: "flex",
  alignItems: "center",
  [breakpointMedia.md]: { display: "block" },
});

let jamLogoStyle = css({
  height: "48px",
  fill: "#ffffff",
  [breakpointMedia.md]: { width: "200px", height: "auto" },
  [breakpointMedia.lg]: { width: "160px" },
  [breakpointMedia.xl]: { width: "200px" },
});

let desktopNavStyle = css({
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: theme.radius.full,
  padding: "8px",
  backgroundColor: "rgb(0 0 0 / 0.4)",
  backdropFilter: "blur(16px)",
  [breakpointMedia.lg]: { display: "flex" },
});

let jamButtonStyle = css({
  display: "flex",
  minWidth: "fit-content",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  borderRadius: theme.radius.full,
  padding: "12px 16px",
  fontSize: "0.875rem",
  fontWeight: theme.fontWeight.semibold,
  lineHeight: 1.425,
  transition: "color 300ms, background-color 300ms",
  "&:hover": {
    backgroundColor: theme.colors.brand.blue,
    color: "#ffffff",
  },
  [breakpointMedia.md]: {
    padding: "16px 24px",
    fontSize: "1.25rem",
    lineHeight: 1.556,
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let navbarTicketStyle = css({
  display: "none",
  backgroundColor: "#ffffff",
  color: "#000000",
  [breakpointMedia.lg]: { display: "flex" },
});

let navbarTicketIconStyle = css({
  width: "24px",
  height: "24px",
  fill: "currentColor",
  [breakpointMedia.md]: { width: "32px", height: "32px" },
  [breakpointMedia.lg]: { width: "24px", height: "24px" },
  [breakpointMedia.xl]: { width: "32px", height: "32px" },
});

let jamMobileMenuStyle = css({
  "& [data-mobile-menu-summary]": {
    display: "grid",
    width: "48px",
    height: "48px",
    placeItems: "center",
    borderRadius: theme.radius.full,
    backgroundColor: "#ffffff",
    color: "#000000",
    backdropFilter: "blur(16px)",
    listStyle: "none",
    outline: "none",
    transition: "color 300ms, background-color 300ms",
  },
  "& [data-mobile-menu-summary]::-webkit-details-marker": { display: "none" },
  "& [data-mobile-menu-summary]:hover, & details[open] > [data-mobile-menu-summary]":
    { backgroundColor: theme.colors.brand.blue, color: "#ffffff" },
  "& [data-mobile-menu-summary]:focus-visible": {
    outline: `2px solid ${theme.colors.brand.blue}`,
    outlineOffset: "2px",
  },
  "& [data-mobile-menu-summary] svg": { width: "24px", height: "24px" },
  "& [data-mobile-menu-position]": {
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  "& [data-mobile-menu-surface]": {
    position: "relative",
    top: "4px",
    width: "max-content",
    padding: "4px",
  },
  "& [data-mobile-menu-nav]": {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflow: "hidden",
    borderRadius: "2rem",
    padding: "10px 8px",
    backgroundColor: "rgb(0 0 0 / 0.4)",
    backdropFilter: "blur(16px)",
  },
  [breakpointMedia.lg]: { display: "none" },
  "@media (prefers-reduced-motion: reduce)": {
    "& [data-mobile-menu-summary]": { transition: "none" },
  },
});

let navLinkStyle = css({
  border: "2px solid",
  borderRadius: theme.radius.full,
  padding: "2px 20px",
  fontSize: "1rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.5,
  outline: "none",
  transition: "color 300ms, border-color 300ms",
  [breakpointMedia.md]: {
    borderWidth: "4px",
    paddingBlock: "12px",
    fontSize: "1.25rem",
    lineHeight: 1.556,
  },
  [breakpointMedia.lg]: {
    borderWidth: "2px",
    padding: "8px 16px",
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  [breakpointMedia.xl]: {
    padding: "12px 20px",
    fontSize: "1.25rem",
    lineHeight: 1.556,
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let mobileNavLinkStyle = css({
  display: "block",
  minWidth: "max-content",
  border: "2px solid",
  borderRadius: theme.radius.full,
  padding: "8px 16px",
  fontSize: "1.125rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.556,
  outline: "none",
  transition: "color 300ms, border-color 300ms",
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let activeNavLinkStyle = css({
  borderColor: "#ffffff",
  color: "#ffffff",
});

let inactiveNavLinkStyle = css({
  borderColor: "transparent",
  color: "rgb(255 255 255 / 0.7)",
  "&:is(:hover, :focus-visible)": {
    borderColor: "#ffffff",
    color: "#ffffff",
  },
});

let jamFooterStyle = css({
  position: "relative",
  zIndex: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

let seatsSpacerStyle = css({
  width: "100%",
  height: 0,
  [breakpointMedia.md]: { height: "112px" },
});

let seatsFrameStyle = css({
  display: "flex",
  width: "100vw",
  justifyContent: "center",
  overflow: "hidden",
});

let seatsImageStyle = css({
  display: "block",
  minWidth: "1400px",
  [breakpointMedia.sm]: { minWidth: "1600px" },
  [breakpointMedia.md]: { minWidth: "1800px" },
  [breakpointMedia.lg]: { minWidth: "2000px" },
  [breakpointMedia.xl]: { minWidth: "2200px" },
  [breakpointMedia["2xl"]]: { minWidth: "110vw" },
});

let footerContentStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  paddingBlock: "160px",
  fontFamily: theme.fontFamily.mono,
  fontSize: "0.75rem",
  lineHeight: 1.333,
  textAlign: "center",
  [breakpointMedia.md]: { fontSize: "1rem", lineHeight: 1.5 },
  [breakpointMedia["2xl"]]: { paddingBlock: "128px" },
});

let seatsFooterStyle = css({
  width: "100%",
  background: "linear-gradient(180deg, rgb(255 51 0), rgb(186 37 0))",
  color: "#ffffff",
});

let plainFooterStyle = css({ color: "#a4a4a4" });
let footerLinksStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "20px",
});

let footerHomeLinkStyle = css({
  border: "1px solid",
  borderRadius: "24px",
  padding: "4px 16px",
  color: "#ffffff",
  textTransform: "uppercase",
});

let seatsFooterLinkStyle = css({
  borderColor: "#ffffff",
  "&:hover": { textDecoration: "underline" },
});

let plainFooterLinkStyle = css({
  borderColor: "#a4a4a4",
  "&:hover": { color: theme.colors.brand.blue },
});

let footerSocialLinkStyle = css({
  display: "inline-flex",
  width: "24px",
  height: "24px",
  flexShrink: 0,
  alignItems: "center",
  justifyContent: "center",
  color: "rgb(255 255 255 / 0.5)",
  transition: "color 150ms",
  "&:hover": { color: "#ffffff" },
  "& > svg": { width: "100%", height: "100%" },
  [breakpointMedia.md]: { width: "32px", height: "32px" },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let footerLegalStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  lineHeight: 2,
  textTransform: "uppercase",
});

let seatsLegalLinkStyle = css({
  color: "#ffffff",
  "&:hover": { textDecoration: "underline" },
});

let plainLegalLinkStyle = css({
  color: "#ffffff",
  "&:hover": { color: theme.colors.brand.blue },
});

let titleStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  color: "#ffffff",
  fontSize: "1.875rem",
  fontWeight: theme.fontWeight.extrabold,
  lineHeight: 1,
  letterSpacing: "-0.025em",
  textTransform: "uppercase",
  [breakpointMedia.sm]: { fontSize: "3rem" },
  [breakpointMedia.md]: { fontSize: "4.5rem", lineHeight: 1 },
});

let sectionLabelStyle = css({
  color: "rgb(255 255 255 / 0.5)",
  fontFamily: theme.fontFamily.mono,
  fontSize: "0.75rem",
  lineHeight: 1.333,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  [breakpointMedia.md]: { fontSize: "1rem", lineHeight: 1.5 },
});

let infoTextStyle = css({ textAlign: "center" });

let infoTextParagraphStyle = css({
  color: "#ffffff",
  fontSize: "1.125rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.4,
  [breakpointMedia.md]: { fontSize: "1.875rem", lineHeight: 1.2 },
});

let subheaderStyle = css({
  color: "#ffffff",
  fontSize: "1.5rem",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.333,
  letterSpacing: "-0.025em",
  [breakpointMedia.md]: { fontSize: "1.875rem", lineHeight: 1.2 },
});

let paragraphStyle = css({
  color: "rgb(255 255 255 / 0.8)",
  "& a": { color: "#59b0ff" },
  "& a:hover": { textDecoration: "underline" },
});

let addressMainStyle = css({
  display: "inline-block",
  color: "#ffffff",
  fontSize: "1.125rem",
  fontStyle: "normal",
  fontWeight: theme.fontWeight.bold,
  lineHeight: 1.625,
  [breakpointMedia.md]: { fontSize: "1.875rem" },
});

let textLinkStyle = css({
  color: "#59b0ff",
  "&:hover": { textDecoration: "underline" },
});

let jamButtonDisabledStyle = css({
  "&:disabled": { cursor: "not-allowed", opacity: 0.5 },
  "&:disabled:hover": { backgroundColor: "#ffffff", color: "#000000" },
});

let activeJamButtonStyle = css({
  backgroundColor: theme.colors.brand.blue,
  color: "#ffffff",
});

let inactiveJamButtonStyle = css({
  backgroundColor: "#ffffff",
  color: "#000000",
});
