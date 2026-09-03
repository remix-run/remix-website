import { css, type Handle } from "remix/ui";

import { MobileMenu } from "./public/mobile-menu.tsx";
import { WordmarkLink } from "./public/wordmark-link.tsx";
import { routes } from "../routes.ts";
import { theme } from "./public/theme.ts";

export type HeaderSection = "blog" | "newsletter" | "jam";

const LINKS: Array<{
  to: string;
  label: string;
  section?: HeaderSection;
}> = [
  { to: "https://guides.remix.run", label: "Guides" },
  { to: "https://api.remix.run", label: "API" },
  { to: "https://github.com/remix-run/remix", label: "GitHub" },
  { to: routes.blog.index.href(), label: "Blog", section: "blog" },
  {
    to: routes.newsletter.index.href(),
    label: "Newsletter",
    section: "newsletter",
  },
  { to: routes.jam.y2026.index.href(), label: "Jam", section: "jam" },
  { to: "https://shop.remix.run", label: "Store" },
];

export function Header(handle: Handle<{ currentSection?: HeaderSection }>) {
  return () => (
    <header
      mix={css({
        position: "relative",
        zIndex: 50,
        height: "64px",
        paddingLeft: "24px",
        paddingRight: "16px",
        fontFamily: theme.fontFamily.system,
        "@media (min-width: 640px)": { paddingRight: "24px" },
        "@media (min-width: 900px)": { paddingRight: "30px" },
      })}
    >
      <div
        mix={css({
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
        })}
      >
        <WordmarkLink
          href={routes.home.href()}
          brandHref={routes.brand.href()}
          width={163}
          height={16}
        />

        <nav
          mix={css({
            display: "none",
            height: "100%",
            alignItems: "center",
            gap: "20px",
            "& > a": {
              color: theme.colors.text.marketingPrimary,
              fontSize: "1rem",
              fontWeight: theme.fontWeight.normal,
              opacity: 0.8,
              whiteSpace: "nowrap",
            },
            "& > a:hover, & > a:focus-visible, & > a[aria-current]": {
              color: theme.colors.action.current,
              opacity: 1,
            },
            "@media (min-width: 900px)": { display: "flex", gap: "24px" },
          })}
          aria-label="Main"
        >
          {LINKS.map((link) => (
            <HeaderLink
              key={link.to}
              to={link.to}
              current={
                link.section !== undefined &&
                link.section === handle.props.currentSection
              }
            >
              {link.label}
            </HeaderLink>
          ))}
        </nav>

        <div
          mix={css({
            "@media (min-width: 900px)": { display: "none" },
          })}
        >
          <MobileMenu>
            {LINKS.map((link) => (
              <HeaderLink
                key={link.to}
                to={link.to}
                current={
                  link.section !== undefined &&
                  link.section === handle.props.currentSection
                }
              >
                {link.label}
              </HeaderLink>
            ))}
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}

function HeaderLink(
  handle: Handle<{
    to: string;
    children: string;
    current?: boolean;
  }>,
) {
  return () => (
    <a
      href={handle.props.to}
      aria-current={handle.props.current ? "page" : undefined}
    >
      {handle.props.children}
    </a>
  );
}
