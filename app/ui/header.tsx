import cx from "clsx";
import { MobileMenu } from "../assets/mobile-menu";
import { WordmarkLink } from "../assets/wordmark-link";
import { routes } from "../routes";

const LINKS: Array<{ to: string; label: string; external?: boolean }> = [
  { to: routes.blog.href(), label: "Blog" },
  { to: routes.jam.y2025.index.href(), label: "Jam" },
  { to: "https://shop.remix.run", label: "Store", external: true },
  { to: "https://v2.remix.run/docs", label: "V2 Docs" },
];

export function Header() {
  return () => (
    <header class={cx("p-6", "text-rmx-primary", "relative z-50")}>
      <div class="flex w-full items-start justify-between gap-8">
        <WordmarkLink
          href={routes.remix3ActiveDevelopment.href()}
          brandHref={routes.brand.href()}
          width={164}
          height={16}
        />

        <nav class="hidden items-center gap-6 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <HeaderLink key={link.to} to={link.to} external={link.external}>
              {link.label}
            </HeaderLink>
          ))}
        </nav>

        <MobileMenu class="md:hidden">
          {LINKS.map((link) => (
            <HeaderLink key={link.to} to={link.to} external={link.external}>
              {link.label}
            </HeaderLink>
          ))}
        </MobileMenu>
      </div>
    </header>
  );
}

function HeaderLink() {
  return (props: { to: string; children: string; external?: boolean }) => (
    <a
      href={props.to}
      class={cx(
        "text-rmx-primary text-sm font-semibold leading-4 tracking-[0.01em] opacity-80 hover:opacity-100",
      )}
      {...(props.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {props.children}
    </a>
  );
}
