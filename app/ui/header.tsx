import type { Handle } from "remix/ui";
import { MobileMenu } from "../assets/mobile-menu.tsx";
import { WordmarkLink } from "../assets/wordmark-link.tsx";
import { routes } from "../routes.ts";
import { theme } from "./theme.ts";

const LINKS: Array<{ to: string; label: string; document?: boolean }> = [
  { to: "https://guides.remix.run", label: "Guides", document: true },
  { to: "https://api.remix.run", label: "API", document: true },
  { to: routes.blog.href(), label: "Blog" },
  { to: routes.jam.y2026.index.href(), label: "Jam" },
  { to: "https://shop.remix.run", label: "Store", document: true },
  { to: "https://github.com/remix-run/remix", label: "GitHub", document: true },
];

export function Header() {
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
          class="hidden h-full items-center gap-5 sm:flex min-[900px]:gap-8"
          aria-label="Main"
        >
          {LINKS.map((link) => (
            <HeaderLink key={link.to} to={link.to} document={link.document}>
              {link.label}
            </HeaderLink>
          ))}
        </nav>

        <MobileMenu class="sm:hidden">
          {LINKS.map((link) => (
            <HeaderLink key={link.to} to={link.to} document={link.document}>
              {link.label}
            </HeaderLink>
          ))}
        </MobileMenu>
      </div>
    </header>
  );
}

function HeaderLink(
  handle: Handle<{ to: string; document?: boolean; children: string }>,
) {
  return () => (
    <a
      href={handle.props.to}
      rmx-document={handle.props.document ? "" : undefined}
      class="text-rmx-primary whitespace-nowrap text-base font-normal opacity-80 hover:opacity-100"
    >
      {handle.props.children}
    </a>
  );
}
