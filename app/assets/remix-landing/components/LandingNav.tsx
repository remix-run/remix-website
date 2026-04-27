import { css, addEventListeners, on, ref, type Handle } from "remix/component";
import { shouldBlockNavLetterB } from "../konami-nav";
import { colors } from "../styles/tokens";

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
  { key: "G", label: "github", href: "https://github.com/remix-run/remix" },
  { key: "D", label: "docs", href: "https://v2.remix.run/docs" },
  { key: "B", label: "blog", href: "https://remix.run/blog" },
  { key: "J", label: "jam", href: "https://remix.run/jam/2025" },
  { key: "S", label: "store", href: "https://shop.remix.run/" },
];

export function LandingNav(handle: Handle) {
  let onJump: ((index: number) => void) | null = null;
  let activeIndex = 0;
  let totalSections = 1;
  let menuOpen = false;
  let mobileContainerEl: HTMLElement | null = null;

  function setMenuOpen(next: boolean) {
    if (menuOpen === next) return;
    menuOpen = next;
    handle.update();
  }

  addEventListeners(window, handle.signal, {
    keydown: (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

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

      const item = NAV_ITEMS.find((n) => n.key.toLowerCase() === e.key.toLowerCase());
      if (item) {
        if (item.key === "B" && shouldBlockNavLetterB()) return;
        window.open(item.href, "_blank");
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
      if (target && mobileContainerEl && mobileContainerEl.contains(target)) return;
      setMenuOpen(false);
    },
  });

  return (props: { activeIndex: number; totalSections: number; onJump: (index: number) => void; scrollY: number }) => {
    activeIndex = props.activeIndex;
    totalSections = props.totalSections;
    onJump = props.onJump;

    const hintOpacity = Math.max(0, 1 - props.scrollY / 80);
    const toggleLabel = menuOpen ? "close" : "menu";

    return (
      <header mix={[headerStyles]}>
        <span mix={[hintStyles]} style={{ opacity: `${hintOpacity}` }}>scroll or press ↓ and ↑</span>
        <nav mix={[desktopNavStyles]} aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a key={item.key} href={item.href} target="_blank" rel="noopener noreferrer" mix={[navItemStyles]}>
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
          {menuOpen ? (
            <div id="mobile-nav-menu" role="menu" mix={[mobileMenuStyles]}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.key}
                  role="menuitem"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  mix={[
                    navItemStyles,
                    mobileMenuItemStyles,
                    on<HTMLAnchorElement>("click", () => {
                      setMenuOpen(false);
                    }),
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
