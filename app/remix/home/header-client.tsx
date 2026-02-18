/** @jsxImportSource remix/component */
import cx from "clsx";
import type { Handle } from "remix/component";
import { Wordmark } from "./wordmark";

const LINKS: Array<{ to: string; label: string; external?: boolean }> = [
  { to: "/blog", label: "Blog" },
  { to: "/jam/2025", label: "Jam" },
  { to: "https://shop.remix.run", label: "Store", external: true },
  { to: "https://v2.remix.run/docs", label: "V2 Docs", external: true },
];

export function HydratedHeader(handle: Handle) {
  let mobileOpen = false;

  const closeMenu = () => {
    if (!mobileOpen) return;
    mobileOpen = false;
    handle.update();
  };

  const toggleMenu = () => {
    mobileOpen = !mobileOpen;
    handle.update();
  };

  return () => (
    <header class={cx("p-12", "text-rmx-primary", "relative z-50")}>
      <div class="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-8">
        <a
          href="/"
          aria-label="Remix"
          class="inline-flex items-center"
          on={{
            contextmenu(event) {
              // Parity with the existing site: right-click logo routes to /brand.
              event.preventDefault();
              window.location.href = "/brand";
            },
          }}
        >
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

        <HeaderMenuMobile mobileOpen={mobileOpen} toggleMenu={toggleMenu} />
      </div>

      {mobileOpen ? (
        <div class="absolute inset-x-0 top-full mt-3 px-12 md:hidden">
          {/* TODO(remix-home): match DetailsMenu/DetailsPopup behavior from app/ui/header.tsx. */}
          <nav
            class={cx(
              "rmx-bg-surface-2 rmx-shadow-mid",
              "mx-auto flex w-full max-w-[1400px] flex-col gap-1 rounded-xl border border-black/10 p-3",
            )}
            aria-label="Mobile main"
          >
            {LINKS.map((link) => (
              <a
                key={link.to}
                href={link.to}
                class={cx(
                  "rounded-lg px-3 py-2 text-base font-semibold opacity-85 hover:opacity-100",
                  "hover:bg-black/[0.04]",
                )}
                on={{ click: closeMenu }}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HeaderLink() {
  return (props: { to: string; children: string; external?: boolean }) => (
    <a
      href={props.to}
      // TODO(remix-home): switch to framework-native prefetching once routing surfaces are migrated.
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

function HeaderMenuMobile() {
  return (props: {
    mobileOpen: boolean;
    toggleMenu: () => void;
  }) => (
    <button
      type="button"
      class={cx(
        "inline-flex size-10 items-center justify-center rounded-md border border-black/10 md:hidden",
        "rmx-bg-surface-2 rmx-shadow-low",
      )}
      on={{ click: props.toggleMenu }}
      aria-label={
        props.mobileOpen ? "Close navigation menu" : "Open navigation menu"
      }
      aria-expanded={props.mobileOpen}
    >
      <span class="sr-only">Menu</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {props.mobileOpen ? (
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        ) : (
          <>
            <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}
