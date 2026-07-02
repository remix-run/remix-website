import { addEventListeners, clientEntry, css, on, type Handle } from "remix/ui";
import { spring } from "remix/ui/animation";
import { theme } from "../../../ui/theme.ts";

import { syncDocumentTheme } from "../../document-head-sync.tsx";
import { Jam2026Countdown } from "./countdown.tsx";
import {
  jamTheme,
  type Jam2026ThemeMode,
} from "../../../controllers/jam/2026/theme.ts";
import { ticketModalConfig } from "../../../controllers/jam/2026/tickets-modal-contract.ts";
import { routes } from "../../../routes.ts";
import { assetPaths } from "../../../utils/asset-paths.ts";

const LIGHT_LOGO_FILTER =
  "brightness(0) saturate(100%) invert(14%) sepia(48%) saturate(1162%) hue-rotate(171deg) brightness(91%) contrast(97%)";
const DARK_LOGO_FILTER = "brightness(0) invert(1)";

type Jam2026HeaderProps = {
  initialTheme?: Jam2026ThemeMode;
};

function getSystemTheme(): Jam2026ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function isPlainLeftClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
}

function getReducedMotionScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

export let Jam2026Header = clientEntry(
  import.meta.url,
  function Jam2026Header(handle: Handle<Jam2026HeaderProps>) {
    let theme: Jam2026ThemeMode = handle.props.initialTheme ?? "light";
    let usesSystemTheme = handle.props.initialTheme == null;
    let eventLockupVisible = false;
    let scrollFrame = 0;

    function setTheme(nextTheme: Jam2026ThemeMode) {
      usesSystemTheme = false;
      if (theme === nextTheme) return;
      theme = nextTheme;
      syncDocumentTheme(nextTheme);
      handle.update();
    }

    function syncSystemTheme() {
      if (!usesSystemTheme) return;

      let nextTheme = getSystemTheme();
      syncDocumentTheme();

      if (theme === nextTheme) return;
      theme = nextTheme;
      handle.update();
    }

    async function submitThemePreference(
      form: HTMLFormElement,
      signal: AbortSignal,
    ) {
      await fetch(form.getAttribute("action") ?? form.action, {
        body: new FormData(form),
        method: "POST",
        redirect: "manual",
        signal,
      });
    }

    function updateEventLockupVisible() {
      scrollFrame = 0;
      let nextVisible = window.scrollY >= 120;

      if (eventLockupVisible === nextVisible) return;
      eventLockupVisible = nextVisible;
      handle.update();
    }

    function requestEventLockupUpdate() {
      if (scrollFrame !== 0) return;
      scrollFrame = requestAnimationFrame(updateEventLockupVisible);
    }

    handle.queueTask(() => {
      theme = handle.props.initialTheme ?? getSystemTheme();
      usesSystemTheme = handle.props.initialTheme == null;
      syncDocumentTheme(usesSystemTheme ? undefined : theme);
      updateEventLockupVisible();
      handle.update();

      let systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      let onSystemThemeChange = () => syncSystemTheme();

      if (typeof systemThemeQuery.addEventListener === "function") {
        systemThemeQuery.addEventListener("change", onSystemThemeChange);
        handle.signal.addEventListener(
          "abort",
          () =>
            systemThemeQuery.removeEventListener("change", onSystemThemeChange),
          { once: true },
        );
      } else if (typeof systemThemeQuery.addListener === "function") {
        systemThemeQuery.addListener(onSystemThemeChange);
        handle.signal.addEventListener(
          "abort",
          () => systemThemeQuery.removeListener(onSystemThemeChange),
          { once: true },
        );
      }

      addEventListeners(window, handle.signal, {
        scroll: requestEventLockupUpdate,
        resize: requestEventLockupUpdate,
      });
      addEventListeners(document, handle.signal, {
        scroll: requestEventLockupUpdate,
      });

      handle.signal.addEventListener(
        "abort",
        () => {
          if (scrollFrame) cancelAnimationFrame(scrollFrame);
        },
        { once: true },
      );
    });

    return () => {
      let homeHref = routes.jam.y2026.index.href();
      let nextTheme: Jam2026ThemeMode = theme === "light" ? "dark" : "light";
      let logoHref = eventLockupVisible ? homeHref : "https://shopify.com";
      let logoExternal = !eventLockupVisible;

      return (
        <header
          aria-label="Remix Jam navigation"
          data-theme={usesSystemTheme ? undefined : theme}
          mix={jam2026HeaderStyle}
        >
          <Jam2026Countdown />

          <div
            data-lockup-visible={eventLockupVisible ? "true" : "false"}
            mix={jam2026NavLogoStyle}
          >
            <a
              href={logoHref}
              aria-label={eventLockupVisible ? "Remix Jam home" : "Shopify"}
              rel={logoExternal ? "noopener noreferrer" : undefined}
              target={logoExternal ? "_blank" : undefined}
              mix={[jam2026LogoLinkStyle, onHomeClick]}
            >
              <img
                alt=""
                data-logo="shopify"
                height={24}
                src={assetPaths.jam2026.shopifyGlyph}
                width={21}
                mix={[jam2026LogoFilterStyle, jam2026ShopifyLogoStyle]}
              />
              <img
                alt=""
                data-logo="event"
                height={54}
                src={assetPaths.jam2026.horizontalLockup}
                width={404}
                mix={[jam2026LogoFilterStyle, jam2026EventLogoStyle]}
              />
            </a>
          </div>

          <nav aria-label="Page navigation" mix={jam2026NavActionsStyle}>
            <form
              action={routes.jam.y2026.theme.href()}
              data-system-theme={usesSystemTheme ? "true" : undefined}
              data-theme={usesSystemTheme ? undefined : theme}
              method="post"
              mix={jam2026ThemeToggleStyle}
            >
              <input name="theme" type="hidden" value={nextTheme} />
              <span
                aria-hidden="true"
                data-active={theme === "light" ? "true" : "false"}
                data-theme-option="light"
                mix={jam2026ThemeOptionStyle}
              >
                Light
              </span>
              <button
                aria-label={`Switch to ${nextTheme} mode`}
                mix={[
                  jam2026ThemeSwitchStyle,
                  on<HTMLButtonElement>("click", (event, signal) => {
                    event.preventDefault();
                    let form = event.currentTarget.form;
                    if (!form) return;

                    setTheme(nextTheme);
                    void submitThemePreference(form, signal).catch(() => {});
                  }),
                ]}
                type="submit"
              >
                <span aria-hidden="true" mix={jam2026ThemeIndicatorStyle}>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    mix={[jam2026ThemeIconStyle, jam2026SunIconStyle]}
                  >
                    <use href={`${assetPaths.iconsSprite}#sun`} />
                  </svg>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    mix={[jam2026ThemeIconStyle, jam2026MoonIconStyle]}
                  >
                    <use href={`${assetPaths.iconsSprite}#moon`} />
                  </svg>
                </span>
              </button>
              <span
                aria-hidden="true"
                data-active={theme === "dark" ? "true" : "false"}
                data-theme-option="dark"
                mix={jam2026ThemeOptionStyle}
              >
                Dark
              </span>
            </form>
            <a
              href="#faq"
              rmx-document=""
              mix={[jam2026NavLinkStyle, onFaqClick]}
            >
              FAQ
            </a>
            <a
              href={routes.jam.y2026.ticket.index.href()}
              mix={jam2026TicketLinkStyle}
              rmx-reset-scroll="false"
              rmx-target={ticketModalConfig.frameName}
            >
              <span aria-hidden="true" mix={jam2026TicketLinkFillStyle} />
              <span mix={jam2026TicketLinkLabelStyle}>Get tickets</span>
            </a>
          </nav>
        </header>
      );
    };
  },
);

let onHomeClick = on<HTMLAnchorElement>("click", (event) => {
  if (!(event instanceof MouseEvent) || !isPlainLeftClick(event)) return;

  let targetUrl = new URL(event.currentTarget.href);
  if (
    targetUrl.origin !== window.location.origin ||
    targetUrl.pathname !== window.location.pathname ||
    targetUrl.search !== window.location.search
  ) {
    return;
  }

  event.preventDefault();
  window.scrollTo({ top: 0, behavior: getReducedMotionScrollBehavior() });
});

let onFaqClick = on<HTMLAnchorElement>("click", (event) => {
  if (!(event instanceof MouseEvent) || !isPlainLeftClick(event)) return;

  let targetUrl = new URL(event.currentTarget.href);
  if (
    targetUrl.origin !== window.location.origin ||
    targetUrl.pathname !== window.location.pathname ||
    targetUrl.search !== window.location.search ||
    targetUrl.hash !== "#faq"
  ) {
    return;
  }

  event.preventDefault();
  if (window.location.hash !== "#faq") {
    history.pushState(history.state, "", targetUrl);
  }

  let faq = document.getElementById("faq");
  if (!faq) return;
  faq.scrollIntoView({
    block: "start",
    behavior: getReducedMotionScrollBehavior(),
  });
});

let jam2026HeaderStyle = css({
  alignItems: "center",
  background: jamTheme.navBg,
  display: "grid",
  gridTemplateColumns: "1fr auto",
  height: "48px",
  left: 0,
  position: "fixed",
  right: 0,
  top: 0,
  zIndex: 20,
  "@media (min-width: 980px)": {
    gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
  },
});

let jam2026NavLogoStyle = css({
  alignItems: "center",
  display: "grid",
  height: "100%",
  justifyItems: "start",
  paddingLeft: "12px",
  position: "relative",
  width: "118px",
  "@media (min-width: 380px)": {
    paddingLeft: "16px",
    width: "132px",
  },
  "@media (min-width: 520px)": {
    width: "172px",
  },
  "@media (min-width: 980px)": {
    justifyItems: "center",
    paddingLeft: 0,
    width: "214px",
  },
  "& img": {
    display: "block",
    gridArea: "1 / 1",
    transition: spring.transition(["opacity", "transform"], "snappy"),
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& img": {
      transition: "none",
    },
  },
});

let jam2026LogoLinkStyle = css({
  alignItems: "center",
  display: "grid",
  height: "100%",
  justifyItems: "start",
  outline: "none",
  textDecoration: "none",
  width: "100%",
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "-6px",
  },
  "@media (min-width: 980px)": {
    justifyItems: "center",
  },
});

let jam2026LogoFilterStyle = css({
  filter: LIGHT_LOGO_FILTER,
  ":root.dark &": {
    filter: DARK_LOGO_FILTER,
  },
  ':root[data-theme="dark"] &': {
    filter: DARK_LOGO_FILTER,
  },
  '[data-theme="dark"] &': {
    filter: DARK_LOGO_FILTER,
  },
});

let jam2026ShopifyLogoStyle = css({
  height: "24px",
  opacity: 1,
  transform: "translateY(0) scale(1)",
  width: "21px",
  '[data-lockup-visible="true"] &': {
    opacity: 0,
    transform: "translateY(-14px) scale(0.88)",
  },
});

let jam2026EventLogoStyle = css({
  height: "auto",
  opacity: 0,
  transform: "translateY(14px) scale(0.96)",
  width: "104px",
  '[data-lockup-visible="true"] &': {
    opacity: 1,
    transform: "translateY(0) scale(1)",
  },
  "@media (min-width: 380px)": {
    width: "116px",
  },
  "@media (min-width: 520px)": {
    width: "152px",
  },
  "@media (min-width: 980px)": {
    width: "196px",
  },
});

let jam2026NavActionsStyle = css({
  alignItems: "center",
  display: "flex",
  height: "100%",
  justifyContent: "flex-end",
});

let jam2026NavLinkStyle = css({
  alignItems: "center",
  boxShadow: `inset 1px 0 0 ${jamTheme.ruleColor}`,
  color: jamTheme.ink,
  display: "inline-flex",
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  height: "100%",
  lineHeight: 1,
  padding: "0 16px",
  textDecoration: "none",
  textTransform: "uppercase",
  transition: "color 160ms ease",
  whiteSpace: "nowrap",
  "&:hover, &:focus-visible": {
    color: jamTheme.brandRed,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "-2px",
  },
  "@media (max-width: 640px)": {
    padding: "0 12px",
  },
  "@media (max-width: 380px)": {
    padding: "0 10px",
  },
});

let jam2026TicketLinkStyle = css({
  "--jam-2026-ticket-fill-delay": "0ms",
  "--jam-2026-ticket-fill-width": "100%",
  alignItems: "center",
  background: "transparent",
  color: "#ffffff",
  display: "inline-flex",
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  height: "100%",
  isolation: "isolate",
  lineHeight: 1,
  padding: "0 16px",
  position: "relative",
  textDecoration: "none",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  "&:hover": {
    "--jam-2026-ticket-fill-delay": "200ms",
    "--jam-2026-ticket-fill-width": "100vw",
  },
  "&:focus, &:focus-visible": {
    boxShadow: "inset 0 0 0 1px rgb(8 40 69 / 0.35)",
    outline: "2px solid #ffffff",
    outlineOffset: "-4px",
  },
  "@media (max-width: 640px)": {
    padding: "0 12px",
  },
  "@media (max-width: 380px)": {
    padding: "0 10px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    background: jamTheme.brandRed,
    "&:hover": {
      "--jam-2026-ticket-fill-delay": "0ms",
      "--jam-2026-ticket-fill-width": "100%",
      background: jamTheme.accentActive,
    },
  },
});

let jam2026TicketLinkFillStyle = css({
  background: jamTheme.brandRed,
  bottom: 0,
  position: "absolute",
  right: 0,
  top: 0,
  transition: `width ${spring("smooth", { duration: 200 })}`,
  transitionDelay: "var(--jam-2026-ticket-fill-delay)",
  width: "var(--jam-2026-ticket-fill-width)",
  zIndex: -1,
  "@media (prefers-reduced-motion: reduce)": {
    display: "none",
  },
});

let jam2026TicketLinkLabelStyle = css({
  color: "#ffffff",
});

let jam2026ThemeToggleStyle = css({
  alignItems: "center",
  display: "inline-flex",
  gap: "10px",
  height: "100%",
  padding: "0 16px",
  "@media (max-width: 640px)": {
    gap: "8px",
    padding: "0 10px",
  },
  "@media (max-width: 520px)": {
    gap: 0,
    padding: "0 8px",
  },
});

let jam2026ThemeOptionStyle = css({
  color: jamTheme.ink,
  display: "block",
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.06em",
  lineHeight: 1,
  textTransform: "uppercase",
  transition: "color 160ms ease",
  '&[data-active="false"]': {
    color: jamTheme.textMuted,
  },
  ':root.dark [data-system-theme="true"] &[data-theme-option="light"]': {
    color: jamTheme.textMuted,
  },
  ':root.dark [data-system-theme="true"] &[data-theme-option="dark"]': {
    color: jamTheme.ink,
  },
  "@media (max-width: 640px)": {
    fontSize: "10px",
  },
  "@media (max-width: 520px)": {
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: "1px",
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
});

let jam2026ThemeSwitchStyle = css({
  alignItems: "center",
  appearance: "none",
  background: "transparent",
  border: 0,
  borderRadius: "999px",
  boxSizing: "border-box",
  boxShadow: `inset 0 0 0 1px ${jamTheme.ink}`,
  color: jamTheme.ink,
  cursor: "pointer",
  display: "inline-flex",
  flexShrink: 0,
  height: "24px",
  outline: "none",
  transition: "background-color 140ms ease",
  width: "48px",
  "&:hover": {
    background: "light-dark(rgb(8 40 69 / 0.06), rgb(255 255 255 / 0.12))",
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "3px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
  "@media (max-width: 640px)": {
    width: "38px",
  },
});

let jam2026ThemeIndicatorStyle = css({
  display: "grid",
  height: "16px",
  marginLeft: "4px",
  placeItems: "center",
  paddingLeft: "1px",
  transform: "translateX(0)",
  transition: `transform ${spring("snappy")}`,
  width: "16px",
  ":root.dark &": {
    transform: "translateX(22px)",
  },
  '[data-theme="light"] &': {
    transform: "translateX(0)",
  },
  '[data-theme="dark"] &': {
    transform: "translateX(22px)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
  "@media (max-width: 640px)": {
    height: "14px",
    width: "14px",
    ":root.dark &": {
      transform: "translateX(14px)",
    },
    '[data-theme="light"] &': {
      transform: "translateX(0)",
    },
    '[data-theme="dark"] &': {
      transform: "translateX(14px)",
    },
  },
});

let jam2026ThemeIconStyle = css({
  color: jamTheme.ink,
  display: "block",
  gridArea: "1 / 1",
  height: "16px",
  overflow: "visible",
  transform: "scale(1) rotate(0deg)",
  width: "16px",
  "@media (max-width: 640px)": {
    height: "14px",
    width: "14px",
  },
});

let jam2026SunIconStyle = css({
  opacity: 1,
  ":root.dark &": {
    opacity: 0,
  },
  '[data-theme="light"] &': {
    opacity: 1,
  },
  '[data-theme="dark"] &': {
    opacity: 0,
  },
});

let jam2026MoonIconStyle = css({
  opacity: 0,
  ":root.dark &": {
    opacity: 1,
  },
  '[data-theme="light"] &': {
    opacity: 0,
  },
  '[data-theme="dark"] &': {
    opacity: 1,
  },
});
