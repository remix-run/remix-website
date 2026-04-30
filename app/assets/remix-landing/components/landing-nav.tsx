import {
  css,
  addEventListeners,
  navigate,
  on,
  ref,
  type Handle,
} from "remix/ui";
import { routes } from "../../../routes";
import { colors } from "../styles/tokens";
import { clamp01 } from "../utils/math";

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
});

const mobileMenuStyles = css({
  position: "absolute",
  top: "calc(100% + 8px)",
  right: "0",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "4px",
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
  { key: "J", label: "jam", href: routes.jam.y2025.index.href() },
  { key: "S", label: "store", href: "https://shop.remix.run/", external: true },
];

type NavItem = (typeof NAV_ITEMS)[number];

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function openNavItem(item: NavItem) {
  if (item.external) {
    window.open(item.href, "_blank", "noopener,noreferrer");
    return;
  }

  void navigate(item.href);
}

function navItemClick(item: NavItem, afterClick?: () => void) {
  return on<HTMLAnchorElement>("click", (event) => {
    if (
      !item.external &&
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

export function LandingNav(handle: Handle) {
  let onJump: ((index: number) => void) | null = null;
  let activeIndex = 0;
  let totalSections = 1;
  let menuOpen = false;
  let mobileContainerEl: HTMLElement | null = null;
  let shouldBlockBlogShortcut = () => false;

  function setMenuOpen(next: boolean) {
    if (menuOpen === next) return;
    menuOpen = next;
    handle.update();
  }

  addEventListeners(window, handle.signal, {
    keydown: (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if (e.key === "Escape" && menuOpen) {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, totalSections - 1);
        onJump?.(next);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
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
    resize: () => {
      if (menuOpen && window.innerWidth > MOBILE_BREAKPOINT_PX) {
        setMenuOpen(false);
      }
    },
  });

  addEventListeners(document, handle.signal, {
    pointerdown: (e: PointerEvent) => {
      if (!menuOpen) return;
      const target = e.target as Node | null;
      if (target && mobileContainerEl && mobileContainerEl.contains(target))
        return;
      setMenuOpen(false);
    },
  });

  return (props: {
    activeIndex: number;
    totalSections: number;
    onJump: (index: number) => void;
    scrollY: number;
    shouldBlockBlogShortcut: () => boolean;
  }) => {
    activeIndex = props.activeIndex;
    totalSections = props.totalSections;
    onJump = props.onJump;
    shouldBlockBlogShortcut = props.shouldBlockBlogShortcut;

    const hintOpacity = clamp01(1 - props.scrollY / 80);
    const toggleLabel = menuOpen ? "close" : "menu";

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
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              mix={[navItemStyles, navItemClick(item)]}
            >
              [{item.key}] {item.label}
            </a>
          ))}
        </nav>
        <div
          mix={[
            mobileContainerStyles,
            ref((node) => {
              mobileContainerEl = node;
            }),
          ]}
        >
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="mobile-nav-menu"
            mix={[
              navItemStyles,
              mobileToggleStyles,
              on<HTMLButtonElement>("click", (e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }),
            ]}
          >
            {toggleLabel}
          </button>
          {/* TODO: either use existing menu component or remix/ui component */}
          {menuOpen ? (
            <div id="mobile-nav-menu" role="menu" mix={[mobileMenuStyles]}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.key}
                  role="menuitem"
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  mix={[
                    navItemStyles,
                    mobileMenuItemStyles,
                    navItemClick(item, () => setMenuOpen(false)),
                  ]}
                >
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </header>
    );
  };
}
