import type { Handle } from "remix/ui";
import { cx } from "../utils/cx.ts";
import { MobileMenu } from "../assets/mobile-menu.tsx";
import { WordmarkLink } from "../assets/wordmark-link.tsx";
import { routes } from "../routes.ts";

const LINKS: Array<{ to: string; label: string; document?: boolean }> = [
  { to: "https://github.com/remix-run/remix", label: "GitHub", document: true },
  { to: routes.docs.index.href(), label: "Docs" },
  { to: routes.blog.href(), label: "Blog" },
  { to: routes.jam.y2026.index.href(), label: "Jam" },
  { to: "https://shop.remix.run", label: "Store", document: true },
];

export function Header() {
  return () => (
    <header class={cx("p-6", "text-rmx-primary", "relative z-50")}>
      <div class="flex w-full items-start justify-between gap-8">
        <WordmarkLink
          href={routes.home.href()}
          brandHref={routes.brand.href()}
          width={164}
          height={16}
          class="text-gray-900 dark:text-gray-200"
        />

        <nav class="hidden items-center gap-6 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <HeaderLink key={link.to} to={link.to} document={link.document}>
              {link.label}
            </HeaderLink>
          ))}
        </nav>

        <MobileMenu class="-mt-3 md:hidden">
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
      class={cx(
        "text-rmx-primary text-sm font-semibold leading-4 tracking-[0.01em] opacity-80 hover:opacity-100",
      )}
    >
      {handle.props.children}
    </a>
  );
}
