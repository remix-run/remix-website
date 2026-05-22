import { css, addEventListeners, navigate, on, type Handle } from "remix/ui";
import * as popover from "remix/ui/popover";
import { routes } from "../../../routes.ts";
import { assetPaths } from "../../../utils/asset-paths.ts";
import { isEditableKeyTarget } from "../../keyboard.ts";
import { colors } from "../styles/tokens.ts";
import { clamp01 } from "../utils/math.ts";

const MOBILE_BREAKPOINT_PX = 720;

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
  [`@media (max-width: ${MOBILE_BREAKPOINT_PX}px)`]: {
    display: "none",
  },
});

const desktopNavStyles = css({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  pointerEvents: "auto",
  [`@media (max-width: ${MOBILE_BREAKPOINT_PX}px)`]: {
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
  [`@media (max-width: ${MOBILE_BREAKPOINT_PX}px)`]: {
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
    label: "github",
    href: "https://github.com/remix-run/remix",
    external: true,
  },
  {
    key: "D",
    label: "docs",
    href: "https://api.remix.run/",
    external: true,
  },
  { key: "B", label: "blog", href: routes.blog.href() },
  // Jam 2026 owns a nested ticket frame and WebGL backdrop. Keep this as a
  // document navigation so Back returns to the landing page with a clean
  // lifecycle instead of restoring through a top-frame diff.
  {
    key: "J",
    label: "jam",
    href: routes.jam.y2026.index.href(),
    document: true,
  },
  { key: "S", label: "store", href: "https://shop.remix.run/", external: true },
];

type NavItem = (typeof NAV_ITEMS)[number];

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function openNavItem(item: NavItem) {
  if (item.external || item.document) {
    window.location.assign(item.href);
    return;
  }

  void navigate(item.href);
}

function navItemClick(item: NavItem, afterClick?: () => void) {
  return on<HTMLAnchorElement>("click", (event) => {
    if (
      !item.external &&
      !item.document &&
      event instanceof MouseEvent &&
      event.button === 0 &&
      !isModifiedClick(event)
    ) {
      event.preventDefault();
      void navigate(item.href);
    }

    afterClick?.();
  });
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

  addEventListeners(window, handle.signal, {
    keydown: (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableKeyTarget(e)) return;

      if (e.key === "Escape" && menuOpen) {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(activeIndexRef.current + 1, totalSections - 1);
        onJump?.(next);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(activeIndexRef.current - 1, 0);
        onJump?.(prev);
        return;
      }

      const item = NAV_ITEMS.find(
        (n) => n.key.toLowerCase() === e.key.toLowerCase(),
      );
      if (item) {
        if (item.key === "B" && shouldBlockBlogShortcut()) return;
        e.preventDefault();
        openNavItem(item);
      }
    },
    scroll: scheduleScrollUpdate,
    resize: () => {
      if (menuOpen && window.innerWidth > MOBILE_BREAKPOINT_PX) {
        setMenuOpen(false);
      }
    },
  });

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
            <a
              key={item.key}
              href={item.href}
              rmx-document={item.external || item.document ? "" : undefined}
              mix={[navItemStyles, navItemClick(item)]}
            >
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
                <svg aria-hidden="true" viewBox="0 0 12 12" mix={svgIconStyles}>
                  <use href={`${assetPaths.iconsSprite}#x-mark`} />
                </svg>
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
                  rmx-document={item.external || item.document ? "" : undefined}
                  mix={[
                    navItemStyles,
                    mobileMenuItemStyles,
                    navItemClick(item, () => setMenuOpen(false)),
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
