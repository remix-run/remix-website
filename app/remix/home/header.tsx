/** @jsxImportSource remix/component */
import cx from "clsx";
import { Wordmark } from "./wordmark";

const LINKS: Array<{ to: string; label: string; external?: boolean }> = [
  { to: "/blog", label: "Blog" },
  { to: "/jam/2025", label: "Jam" },
  { to: "https://shop.remix.run", label: "Store", external: true },
  { to: "https://v2.remix.run/docs", label: "V2 Docs", external: true },
];

export function Header() {
  return () => (
    <header class={cx("p-12", "text-rmx-primary", "relative z-50")}>
      <div class="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-8">
        <a href="/" aria-label="Remix" class="inline-flex items-center">
          <Wordmark aria-hidden />
          <span class="sr-only">Remix home</span>
        </a>

        <nav class="hidden items-center gap-6 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <HeaderLink key={link.to} to={link.to} external={link.external}>
              {link.label}
            </HeaderLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function HeaderLink() {
  return (props: { to: string; children: string; external?: boolean }) => (
    <a
      href={props.to}
      class={cx(
        "text-rmx-primary text-base font-semibold leading-6 tracking-[0.01em] opacity-80 hover:opacity-100",
      )}
      {...(props.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {props.children}
    </a>
  );
}
