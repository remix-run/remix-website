import type { Handle } from "remix/ui";

import { cx } from "../utils/public/cx.ts";
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
      class="relative z-50 h-16 pl-6 pr-4 sm:pr-6 min-[900px]:pr-[30px]"
      style={{ fontFamily: theme.fontFamily.system }}
    >
      <div class="flex h-full w-full items-center justify-between gap-8">
        <WordmarkLink
          href={routes.home.href()}
          brandHref={routes.brand.href()}
          width={163}
          height={16}
          class="text-gray-900 dark:text-gray-200"
        />

        <nav
          class="hidden h-full items-center gap-5 min-[900px]:flex min-[900px]:gap-6"
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

        <MobileMenu class="min-[900px]:hidden">
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
      class={cx(
        "whitespace-nowrap text-base font-normal",
        handle.props.current
          ? "rmx-header-link-current"
          : "rmx-header-link text-rmx-primary opacity-80 hover:opacity-100",
      )}
    >
      {handle.props.children}
    </a>
  );
}
