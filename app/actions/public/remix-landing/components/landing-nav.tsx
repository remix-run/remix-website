import { css, navigate, on, type Handle } from "remix/ui";
import * as popover from "remix/ui/popover";
import { routes } from "../../../../routes.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { isEditableKeyTarget } from "../../../../ui/public/keyboard.ts";
import { colors, landingBreakpoints, landingMedia } from "../styles/tokens.ts";
import { clamp01 } from "../utils/math.ts";

const headerStyles = css({
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  zIndex: "30",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  padding: "24px",
  pointerEvents: "none",
});

const hintStyles = css({
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "12px",
  lineHeight: "normal",
  color: colors.muted,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  paddingTop: "5px",
  [landingMedia.small]: {
    display: "none",
  },
});

const desktopNavStyles = css({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  pointerEvents: "auto",
  [landingMedia.large]: {
    display: "none",
  },
});

const navItemStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "4px",
  padding: "4px 6px",
  background: colors.surface0,
  color: colors.fg,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "12px",
  lineHeight: "normal",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 150ms ease",
  "&:hover": {
    color: `var(--brand-cycle, ${colors.accent})`,
  },
});

const mobileContainerStyles = css({
  position: "relative",
  display: "none",
  pointerEvents: "auto",
  [landingMedia.large]: {
    display: "block",
    marginLeft: "auto",
    marginTop: "-12px",
    marginRight: "-12px",
  },
});

const mobileToggleStyles = css({
  appearance: "none",
  WebkitAppearance: "none",
  margin: "0",
  padding: "12px 16px",
  border: "none",
  boxSizing: "content-box",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "12px",
  fontWeight: "inherit",
  lineHeight: "normal",
  letterSpacing: "inherit",
  textTransform: "uppercase",
  color: colors.fg,
  "&:focus": {
    outline: "none",
  },
  "&:focus-visible": {
    outline: `1px solid var(--brand-cycle, ${colors.accent})`,
    outlineOffset: "2px",
  },
});

const mobileMenuItemStyles = css({
  padding: "12px 16px",
  justifyContent: "flex-end",
});

const mobileMenuStyles = css({
  position: "fixed",
  inset: "auto",
  display: "none",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "4px",
  margin: "0",
  padding: "0",
  border: "none",
  background: "transparent",
  color: "inherit",
  overflow: "visible",
  "&::backdrop": {
    background: "transparent",
  },
  "&:popover-open": {
    display: "flex",
  },
  "&:not(:popover-open)": {
    pointerEvents: "none",
  },
});

const svgIconStyles = css({
  height: "20px",
  width: "20px",
  display: "block",
});

const NAV_ITEMS = [
  {
    key: "G",
    label: "guides",
    href: "https://guides.remix.run",
    external: true,
  },
  {
    key: "A",
    label: "api",
    href: "https://api.remix.run",
    external: true,
  },
  {
    key: "H",
    label: "github",
    href: "https://github.com/remix-run/remix",
    external: true,
  },
  { key: "B", label: "blog", href: routes.blog.index.href() },
  {
    key: "N",
    label: "newsletter",
    href: routes.newsletter.index.href(),
  },
  { key: "J", label: "jam", href: routes.jam.y2026.index.href() },
  { key: "S", label: "store", href: "https://shop.remix.run", external: true },
];

type NavItem = (typeof NAV_ITEMS)[number];

function openNavItem(item: NavItem) {
  if (item.external) {
    window.location.assign(item.href);
    return;
  }

  void navigate(item.href);
}

export function LandingNav(
  handle: Handle<{
    activeIndexRef: { current: number };
    totalSections: number;
    onJump: (index: number) => void;
    scrollYRef: { current: number };
    shouldBlockBlogShortcut: () => boolean;
  }>,
) {
  let onJump: ((index: number) => void) | null = null;
  let totalSections = 1;
  let menuOpen = false;
  let scrollFrame = 0;
  let activeIndexRef: { current: number } = { current: 0 };
  let scrollYRef: { current: number } = { current: 0 };
  let shouldBlockBlogShortcut = () => false;

  function setMenuOpen(next: boolean) {
    if (menuOpen === next) return;
    menuOpen = next;
    handle.update();
  }

  function scheduleScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      handle.update();
    });
  }

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableKeyTarget(event)) return;

      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = Math.min(activeIndexRef.current + 1, totalSections - 1);
        onJump?.(next);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev = Math.max(activeIndexRef.current - 1, 0);
        onJump?.(prev);
        return;
      }

      const item = NAV_ITEMS.find(
        (item) => item.key.toLowerCase() === event.key.toLowerCase(),
      );
      if (item) {
        if (item.key === "B" && shouldBlockBlogShortcut()) return;
        event.preventDefault();
        openNavItem(item);
      }
    },
    { signal: handle.signal },
  );
  window.addEventListener("scroll", scheduleScrollUpdate, {
    signal: handle.signal,
  });
  window.addEventListener(
    "resize",
    () => {
      if (menuOpen && window.innerWidth > landingBreakpoints.large) {
        setMenuOpen(false);
      }
    },
    { signal: handle.signal },
  );

  handle.signal.addEventListener("abort", () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
  });

  return () => {
    activeIndexRef = handle.props.activeIndexRef;
    totalSections = handle.props.totalSections;
    onJump = handle.props.onJump;
    scrollYRef = handle.props.scrollYRef;
    shouldBlockBlogShortcut = handle.props.shouldBlockBlogShortcut;

    const hintOpacity = clamp01(1 - scrollYRef.current / 80);

    return (
      <header mix={[headerStyles]}>
        <span mix={[hintStyles]} style={{ opacity: `${hintOpacity}` }}>
          scroll or press ↓ and ↑
        </span>
        <nav mix={[desktopNavStyles]} aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a key={item.key} href={item.href} mix={navItemStyles}>
              [{item.key}] {item.label}
            </a>
          ))}
        </nav>
        <popover.Context>
          <div mix={[mobileContainerStyles]}>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen ? "true" : "false"}
              aria-controls="mobile-nav-menu"
              mix={[
                navItemStyles,
                mobileToggleStyles,
                popover.focusOnHide(),
                popover.anchor({ placement: "bottom-end", offset: 4 }),
                on<HTMLButtonElement>("click", (e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }),
              ]}
            >
              {menuOpen ? (
                <Icon
                  name="x-mark"
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  mix={svgIconStyles}
                />
              ) : (
                "menu"
              )}
            </button>
            <nav
              id="mobile-nav-menu"
              aria-label="Primary"
              mix={[
                mobileMenuStyles,
                popover.surface({
                  open: menuOpen,
                  closeOnAnchorClick: false,
                  onHide: () => setMenuOpen(false),
                }),
              ]}
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  mix={[
                    navItemStyles,
                    mobileMenuItemStyles,
                    on<HTMLAnchorElement>("click", () => setMenuOpen(false)),
                  ]}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </popover.Context>
      </header>
    );
  };
}
