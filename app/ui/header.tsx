import cx from "clsx";
import { MobileMenu } from "../assets/mobile-menu";
import { WordmarkLink } from "../assets/wordmark-link";
import { routes } from "../routes";

const LINKS: Array<{ to: string; label: string; document?: boolean }> = [
  { to: "https://github.com/remix-run/remix", label: "GitHub", document: true },
  { to: "https://api.remix.run", label: "Docs", document: true },
  { to: routes.blog.href(), label: "Blog" },
  { to: routes.jam.y2025.index.href(), label: "Jam" },
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
            <HeaderLink
              key={link.to}
              to={link.to}
              document={link.document}
            >
              {link.label}
            </HeaderLink>
          ))}
        </nav>

        <MobileMenu class="-mt-3 md:hidden">
          {LINKS.map((link) => (
            <HeaderLink
              key={link.to}
              to={link.to}
              document={link.document}
            >
              {link.label}
            </HeaderLink>
          ))}
        </MobileMenu>
      </div>
    </header>
  );
}

function HeaderLink() {
  return (props: { to: string; document?: boolean; children: string }) => (
    <a
      href={props.to}
      rmx-document={props.document ? "" : undefined}
      class={cx(
        "text-rmx-primary text-sm font-semibold leading-4 tracking-[0.01em] opacity-80 hover:opacity-100",
      )}
    >
      {props.children}
    </a>
  );
}
