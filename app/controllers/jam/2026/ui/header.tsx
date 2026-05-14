import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { routes } from "../../../../routes.ts";
import { jamTheme } from "../theme.ts";

export function Jam2026Header() {
  return () => (
    <header aria-label="Remix Jam 2026 navigation" mix={headerStyle}>
      <div mix={headerInnerStyle}>
        <a href={routes.jam.y2026.index.href()} mix={brandStyle}>
          Remix Jam 2026
        </a>
        <nav aria-label="Page navigation" mix={navStyle}>
          <a href="#faq" mix={navLinkStyle}>
            FAQ
          </a>
          <a
            href={routes.jam.y2026.tickets.index.href()}
            mix={ticketLinkStyle}
          >
            Get tickets
          </a>
        </nav>
      </div>
    </header>
  );
}

let headerStyle = css({
  position: "sticky",
  top: 0,
  zIndex: 10,
  borderBlockEnd: `1px solid ${jamTheme.borderSubtle}`,
  backgroundColor: jamTheme.headerSurface,
  backdropFilter: "blur(18px)",
});

let headerInnerStyle = css({
  width: "min(100%, 88rem)",
  marginInline: "auto",
  paddingBlock: theme.space.md,
  paddingInline: "clamp(1rem, 3vw, 2rem)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.space.lg,
});

let brandStyle = css({
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.bold,
  lineHeight: theme.lineHeight.tight,
  textDecoration: "none",
  textTransform: "uppercase",
});

let navStyle = css({
  display: "flex",
  alignItems: "center",
  gap: theme.space.sm,
});

let navLinkStyle = css({
  borderRadius: theme.radius.full,
  color: jamTheme.ink,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.semibold,
  lineHeight: theme.lineHeight.tight,
  paddingBlock: theme.space.sm,
  paddingInline: theme.space.md,
  textDecoration: "none",
  "&:hover": {
    backgroundColor: jamTheme.inkWash,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.accent}`,
    outlineOffset: "3px",
  },
});

let ticketLinkStyle = css({
  borderRadius: theme.radius.full,
  backgroundColor: jamTheme.accent,
  color: jamTheme.onAccent,
  fontFamily: theme.fontFamily.sans,
  fontSize: theme.fontSize.sm,
  fontWeight: theme.fontWeight.bold,
  lineHeight: theme.lineHeight.tight,
  paddingBlock: theme.space.sm,
  paddingInline: theme.space.lg,
  textDecoration: "none",
  "&:hover": {
    backgroundColor: jamTheme.accentHover,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.accent}`,
    outlineOffset: "3px",
  },
  "&:active": {
    backgroundColor: jamTheme.accentActive,
  },
});
